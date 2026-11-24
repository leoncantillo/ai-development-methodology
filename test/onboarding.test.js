import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { Readable, Writable } from "node:stream";

import { OnboardingEngine } from "../src/knowledge/onboarding/engine.js";
import { ONBOARDING_QUESTIONS } from "../src/knowledge/onboarding/questions.js";
import { OnboardingSession } from "../src/knowledge/onboarding/session.js";
import {
  clearOnboardingSession,
  hasOnboardingSession,
  loadProgress,
  loadResponses,
  recordAnswer,
} from "../src/knowledge/onboarding/storage.js";
import { CERTAINTY, PROVENANCE } from "../src/knowledge/model/types.js";
import { MarkdownKnowledgeProvider } from "../src/knowledge/providers/markdown.js";
import { runOnboarding } from "../src/knowledge/onboarding/runner.js";
import { makeTempDir, validConfig, writeProjectConfig } from "./helpers.js";

function createMockIo(lines = []) {
  let outputStr = "";
  const output = new Writable({
    write(chunk, encoding, callback) {
      outputStr += chunk.toString();
      callback();
    },
  });
  return {
    output,
    getOutput: () => outputStr,
    session: new OnboardingSession({ output, inputs: lines }),
  };
}

test("1. Inicio del onboarding: inicializa con la primera pregunta aplicable", () => {
  const engine = new OnboardingEngine(ONBOARDING_QUESTIONS);
  const initial = engine.getInitialQuestion({});
  assert.ok(initial);
  assert.equal(initial.id, "identity_name");
  assert.equal(initial.category, "identity");
  assert.equal(initial.required, true);
});

test("2. Recorrido condicional de preguntas: evalúa bifurcaciones declarativas", () => {
  const engine = new OnboardingEngine(ONBOARDING_QUESTIONS);

  // Escenario backend = true
  const responsesWithBackend = {
    architecture_has_backend: { value: true, status: CERTAINTY.CONFIRMED },
  };
  const nextWhenBackend = engine.getNextQuestion("architecture_has_backend", responsesWithBackend);
  assert.equal(nextWhenBackend?.id, "architecture_backend_details");

  // Escenario backend = false
  const responsesWithoutBackend = {
    architecture_has_backend: { value: false, status: CERTAINTY.CONFIRMED },
  };
  const nextWhenNoBackend = engine.getNextQuestion("architecture_has_backend", responsesWithoutBackend);
  assert.equal(nextWhenNoBackend?.id, "architecture_has_frontend");

  // Escenario domain_has_complex_rules = false
  const responsesNoDomain = {
    domain_has_complex_rules: { value: false, status: CERTAINTY.CONFIRMED },
  };
  const nextNoDomain = engine.getNextQuestion("domain_has_complex_rules", responsesNoDomain);
  assert.equal(nextNoDomain?.id, "architecture_style");
});

test("3. Validación de respuestas por tipo", () => {
  const engine = new OnboardingEngine(ONBOARDING_QUESTIONS);

  // Text obligatorio
  const nameQ = engine.questionsById.get("identity_name");
  assert.equal(engine.validateAnswer(nameQ, "").valid, false);
  assert.equal(engine.validateAnswer(nameQ, "MiProyecto").valid, true);

  // Boolean
  const boolQ = engine.questionsById.get("architecture_has_backend");
  assert.equal(engine.validateAnswer(boolQ, "s").parsedValue, true);
  assert.equal(engine.validateAnswer(boolQ, "no").parsedValue, false);
  assert.equal(engine.validateAnswer(boolQ, "invalido").valid, false);

  // Single select
  const selectQ = engine.questionsById.get("architecture_style");
  assert.equal(engine.validateAnswer(selectQ, "monolito modular").valid, true);
  assert.equal(engine.validateAnswer(selectQ, "modular-monolith").valid, true);
  assert.equal(engine.validateAnswer(selectQ, "inexistente").valid, false);

  // Path
  const pathQ = { id: "p", type: "path", required: true };
  assert.equal(engine.validateAnswer(pathQ, "docs/knowledge").valid, true);
});

test("4. Omisión de preguntas opcionales", () => {
  const engine = new OnboardingEngine(ONBOARDING_QUESTIONS);

  // Pregunta opcional permite :skip
  const descQ = engine.questionsById.get("identity_description");
  assert.equal(descQ.required, false);
  const skipOptional = engine.validateAnswer(descQ, null, CERTAINTY.SKIPPED);
  assert.equal(skipOptional.valid, true);

  // Pregunta obligatoria rechaza :skip
  const nameQ = engine.questionsById.get("identity_name");
  assert.equal(nameQ.required, true);
  const skipRequired = engine.validateAnswer(nameQ, null, CERTAINTY.SKIPPED);
  assert.equal(skipRequired.valid, false);
});

test("5. Distinción entre desconocimiento y decisiones pendientes", () => {
  const engine = new OnboardingEngine(ONBOARDING_QUESTIONS);
  const purposeQ = engine.questionsById.get("identity_purpose");

  // Validación de estado desconocido
  const unknownRes = engine.validateAnswer(purposeQ, null, CERTAINTY.UNKNOWN);
  assert.equal(unknownRes.valid, true);

  // Validación de estado por definir
  const undecidedRes = engine.validateAnswer(purposeQ, null, CERTAINTY.UNDECIDED);
  assert.equal(undecidedRes.valid, true);

  // Verificación en el modelo conceptual
  const responses = {
    identity_name: { value: "Demo", status: CERTAINTY.CONFIRMED },
    identity_purpose: { value: null, status: CERTAINTY.UNDECIDED },
    context_problem: { value: null, status: CERTAINTY.UNKNOWN },
  };

  const model = engine.buildKnowledgeModel(responses, { projectName: "Demo" });
  assert.equal(model.identity.purpose.certainty, CERTAINTY.UNDECIDED);
  assert.equal(model.context.problem.certainty, CERTAINTY.UNKNOWN);
  assert.notEqual(model.identity.purpose.certainty, model.context.problem.certainty);
});

test("6. Persistencia temporal en .ai-methodology/onboarding/", async () => {
  const dir = await makeTempDir();

  assert.equal(await hasOnboardingSession(dir), false);

  await recordAnswer(
    dir,
    "identity_name",
    { value: "MiApp", status: CERTAINTY.CONFIRMED, provenance: PROVENANCE.USER },
    { nextQuestionId: "identity_purpose", completed: false }
  );

  assert.equal(await hasOnboardingSession(dir), true);

  const progress = await loadProgress(dir);
  assert.equal(progress.currentQuestionId, "identity_purpose");
  assert.deepEqual(progress.history, ["identity_name"]);
  assert.equal(progress.completed, false);

  const responses = await loadResponses(dir);
  assert.equal(responses.identity_name.value, "MiApp");
  assert.equal(responses.identity_name.status, CERTAINTY.CONFIRMED);
  assert.equal(responses.identity_name.provenance, PROVENANCE.USER);
});

test("7. Reanudación de procesos interrumpidos", async () => {
  const dir = await makeTempDir();

  // Guardar estado interrumpido a la mitad
  await recordAnswer(
    dir,
    "identity_name",
    { value: "InterruptedApp", status: CERTAINTY.CONFIRMED, provenance: PROVENANCE.USER },
    { nextQuestionId: "identity_purpose", completed: false }
  );

  const config = validConfig({ project: { name: "InterruptedApp" } });

  // Flujo reanudando sesión previa:
  // Respuesta a promptResumeSession: 's' (reanudar)
  // Preguntas pendientes:
  // identity_purpose -> 'Propósito continuado'
  // identity_description -> ':skip'
  // context_problem -> 'Problema resuelto'
  // context_target_users -> ':skip'
  // domain_has_complex_rules -> 'n'
  // architecture_style -> '1' (modular-monolith)
  // architecture_has_backend -> 'n'
  // architecture_has_frontend -> 'n'
  // technology_languages -> 'JavaScript'
  // technology_frameworks -> ':skip'
  // technology_tools -> ':skip'
  // conventions_standards -> ':skip'
  // constraints_limitations -> ':skip'
  // state_phase -> '1' (greenfield)
  // state_implemented_features -> ':skip'
  // objectives_immediate -> 'Lanzar MVP'
  // objectives_milestones -> ':skip'
  // promptFinalDecision -> '1' (confirmar y guardar)
  const inputs = [
    "s", // Reanudar
    "Propósito continuado",
    ":skip",
    "Problema resuelto",
    ":skip",
    "n",
    "1",
    "n",
    "n",
    "JavaScript",
    ":skip",
    ":skip",
    ":skip",
    ":skip",
    "1",
    ":skip",
    "Lanzar MVP",
    ":skip",
    "1", // Confirmar
  ];

  const mock = createMockIo(inputs);
  const result = await runOnboarding({
    projectDir: dir,
    config,
    session: mock.session,
  });

  assert.equal(result.completed, true);
  assert.equal(result.saved, true);
  assert.equal(await hasOnboardingSession(dir), false); // Limpiado tras confirmación

  const overviewFile = path.join(dir, "knowledge", "overview.md");
  const content = await readFile(overviewFile, "utf8");
  assert.match(content, /InterruptedApp/);
});

test("8. Confirmación y cancelación: cancelación conserva el progreso temporal", async () => {
  const dir = await makeTempDir();
  const config = validConfig();

  // Responder unas preguntas y elegir cancelar en la confirmación final
  const minimalQuestions = [
    { id: "q1", category: "identity", question: "Q1", type: "text", required: true },
  ];
  const engine = new OnboardingEngine(minimalQuestions);

  // Inputs:
  // 1: Escenario nuevo
  // Q1: 'Valor 1'
  // Decisión: '3' (cancelar)
  const inputs = ["1", "Valor 1", "3"];
  const mock = createMockIo(inputs);

  const result = await runOnboarding({
    projectDir: dir,
    config,
    session: mock.session,
    engine,
  });

  assert.equal(result.completed, false);
  assert.equal(result.cancelled, true);

  // La sesión temporal debe mantenerse guardada
  assert.equal(await hasOnboardingSession(dir), true);
  const savedResponses = await loadResponses(dir);
  assert.equal(savedResponses.q1.value, "Valor 1");
});

test("9. Integración con MarkdownKnowledgeProvider", async () => {
  const dir = await makeTempDir();
  const config = validConfig({ knowledge: { source: { type: "local", path: "docs/knowledge" } } });
  const provider = new MarkdownKnowledgeProvider();

  const engine = new OnboardingEngine();
  const knowledgeModel = engine.buildKnowledgeModel(
    {
      identity_name: { value: "TestProject", status: CERTAINTY.CONFIRMED },
      identity_purpose: { value: "Test purpose", status: CERTAINTY.CONFIRMED },
      context_problem: { value: null, status: CERTAINTY.UNKNOWN },
      architecture_style: { value: "modular-monolith", status: CERTAINTY.UNDECIDED },
      objectives_immediate: { value: "Construir MVP de autenticación", status: CERTAINTY.CONFIRMED },
      objectives_milestones: { value: "Panel de administración y métricas", status: CERTAINTY.CONFIRMED },
    },
    { projectName: "TestProject" }
  );

  const saveRes = await provider.save(dir, config, knowledgeModel);
  assert.equal(saveRes.provider, "markdown");

  const overview = await readFile(path.join(dir, "docs/knowledge/overview.md"), "utf8");
  assert.match(overview, /TestProject/);

  const idContext = await readFile(path.join(dir, "docs/knowledge/identity-context.md"), "utf8");
  assert.match(idContext, /\[Desconocido \/ Sin información\]/);
  assert.match(idContext, /Test purpose/);

  const arch = await readFile(path.join(dir, "docs/knowledge/architecture.md"), "utf8");
  assert.match(arch, /\[Pendiente de definición\]/);

  const roadmap = await readFile(path.join(dir, "docs/knowledge/planning/roadmap.md"), "utf8");
  assert.match(roadmap, /Construir MVP de autenticación/);
  assert.match(roadmap, /Panel de administración y métricas/);

  const loaded = await provider.load(dir, config);
  assert.ok(loaded);
  assert.match(loaded.overview, /Base de Conocimiento del Proyecto: TestProject/);
});
