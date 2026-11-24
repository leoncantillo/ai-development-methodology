import { ONBOARDING_QUESTIONS } from "./questions.js";
import { OnboardingEngine } from "./engine.js";
import { OnboardingSession } from "./session.js";
import {
  clearOnboardingSession,
  hasOnboardingSession,
  loadProgress,
  loadResponses,
  recordAnswer,
} from "./storage.js";
import { getKnowledgeProvider } from "../providers/registry.js";
import { saveConfig } from "../../config/io.js";
import { PROVENANCE } from "../model/types.js";

/**
 * Orquestador principal del proceso de Knowledge Onboarding.
 */
export async function runOnboarding({
  projectDir,
  config,
  flags = {},
  session = new OnboardingSession(),
  engine = new OnboardingEngine(ONBOARDING_QUESTIONS),
  provider = null,
} = {}) {
  try {
    const activeProvider = provider || getKnowledgeProvider(config);
    let activeConfig = config;

    const hasSession = await hasOnboardingSession(projectDir);
    let responses = {};
    let progress = null;
    let startFromQuestionId = null;

    if (flags.reset) {
      await clearOnboardingSession(projectDir);
    } else if (hasSession) {
      let action = flags.resume ? "resume" : null;
      if (!action) {
        action = await session.promptResumeSession();
      }

      if (action === "resume") {
        responses = await loadResponses(projectDir);
        progress = await loadProgress(projectDir);
        startFromQuestionId = progress?.currentQuestionId || null;
      } else if (action === "reset") {
        await clearOnboardingSession(projectDir);
      } else {
        console.log("Onboarding cancelado. Tu progreso anterior se mantiene guardado.");
        return { completed: false, cancelled: true, config: activeConfig };
      }
    }

    // Si no estamos reanudando una sesión existente, determinar escenario
    if (!progress) {
      const scenario = flags.scenario || (await session.promptScenario());

      if (scenario === "existing_with_docs") {
        const existingPath = await session.promptExistingKnowledgePath(
          activeConfig.knowledge?.source?.path || "docs"
        );
        if (activeConfig.knowledge?.source) {
          activeConfig.knowledge.source.path = existingPath;
          activeConfig = await saveConfig(projectDir, activeConfig);
          console.log(`Configuración actualizada: knowledge.source.path = "${existingPath}"`);
        }

        const wantsQuestions = await session.promptAskComplementaryQuestions();
        if (!wantsQuestions) {
          console.log("Se registró la fuente de conocimiento existente sin preguntas adicionales.");
          return { completed: true, skippedQuestions: true, config: activeConfig };
        }
      }
    }

    // Ciclo interactivo de preguntas
    let currentQuestion = startFromQuestionId
      ? engine.questionsById.get(startFromQuestionId) || engine.getInitialQuestion(responses)
      : engine.getInitialQuestion(responses);

    while (currentQuestion) {
      const prevAnswer = responses[currentQuestion.id];
      const answer = await session.promptQuestion(engine, currentQuestion, prevAnswer);

      responses[currentQuestion.id] = {
        value: answer.value,
        status: answer.status,
        provenance: PROVENANCE.USER,
        answeredAt: new Date().toISOString(),
      };

      const nextQuestion = engine.getNextQuestion(currentQuestion.id, responses);
      const nextId = nextQuestion ? nextQuestion.id : null;

      await recordAnswer(
        projectDir,
        currentQuestion.id,
        responses[currentQuestion.id],
        { nextQuestionId: nextId, completed: nextQuestion === null }
      );

      currentQuestion = nextQuestion;
    }

    // Ciclo de confirmación y revisión de resumen
    while (true) {
      session.renderSummary(engine.questions, responses);
      const decision = await session.promptFinalDecision();

      if (decision === "confirm") {
        const knowledgeModel = engine.buildKnowledgeModel(responses, {
          projectName: activeConfig.project?.name,
        });

        console.log("\nGuardando base de conocimiento inicial...");
        const result = await activeProvider.save(projectDir, activeConfig, knowledgeModel);
        await clearOnboardingSession(projectDir);

        console.log("✓ Base de conocimiento guardada correctamente.");
        return {
          completed: true,
          saved: true,
          knowledgeModel,
          providerResult: result,
          config: activeConfig,
        };
      }

      if (decision === "modify") {
        const qToModify = await session.promptQuestionToModify(engine.questions, responses);
        if (qToModify) {
          const prev = responses[qToModify.id];
          const newAns = await session.promptQuestion(engine, qToModify, prev);
          responses[qToModify.id] = {
            value: newAns.value,
            status: newAns.status,
            provenance: PROVENANCE.USER,
            answeredAt: new Date().toISOString(),
          };
          await recordAnswer(projectDir, qToModify.id, responses[qToModify.id], {
            nextQuestionId: null,
            completed: false,
          });
        }
        continue;
      }

      if (decision === "cancel") {
        console.log(
          "\nProceso cancelado. Tu progreso ha sido guardado en .ai-methodology/onboarding/\n" +
            "Puedes reanudarlo cuando desees ejecutando:\n" +
            "  ai-methodology knowledge onboard"
        );
        return { completed: false, cancelled: true, config: activeConfig };
      }
    }
  } finally {
    session.close();
  }
}
