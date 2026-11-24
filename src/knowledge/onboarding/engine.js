import { CERTAINTY, PROVENANCE, createProjectKnowledge, createKnowledgeEntry } from "../model/types.js";

/**
 * Validador y motor declarativo de preguntas para el onboarding.
 */
export class OnboardingEngine {
  constructor(questions = []) {
    this.questions = questions;
    this.questionsById = new Map(questions.map((q) => [q.id, q]));
  }

  /**
   * Obtiene la primera pregunta aplicable.
   */
  getInitialQuestion(responses = {}) {
    return this.getNextQuestion(null, responses);
  }

  /**
   * Determina si una condición declarativa se cumple dado el estado actual de respuestas.
   */
  matchesCondition(condition, responses) {
    if (!condition) return true;
    const { field, equals, notEquals, inList } = condition;
    const current = responses[field]?.value;

    if (equals !== undefined && current !== equals) return false;
    if (notEquals !== undefined && current === notEquals) return false;
    if (inList !== undefined && !inList.includes(current)) return false;
    return true;
  }

  /**
   * Obtiene la siguiente pregunta en base a las reglas de transición `next` y `condition`.
   */
  getNextQuestion(currentQuestionId, responses = {}) {
    if (!currentQuestionId) {
      // Buscar la primera pregunta cuya condición se cumpla
      return this.questions.find((q) => this.matchesCondition(q.condition, responses)) || null;
    }

    const currentQuestion = this.questionsById.get(currentQuestionId);
    if (!currentQuestion) return null;

    const currentAnswer = responses[currentQuestionId];

    // 1. Revisar si la pregunta actual define una bifurcación explícita con `next`
    if (currentQuestion.next) {
      if (typeof currentQuestion.next === "string") {
        const nextQ = this.questionsById.get(currentQuestion.next);
        if (nextQ && this.matchesCondition(nextQ.condition, responses)) {
          return nextQ;
        }
      } else if (typeof currentQuestion.next === "object") {
        const key = String(currentAnswer?.value);
        const targetId = currentQuestion.next[key] ?? currentQuestion.next.default;
        if (targetId) {
          const nextQ = this.questionsById.get(targetId);
          if (nextQ && this.matchesCondition(nextQ.condition, responses)) {
            return nextQ;
          }
        }
      }
    }

    // 2. Si no hay bifurcación explícita o la pregunta de destino no es aplicable,
    // avanzar secuencialmente a la siguiente pregunta cuya condición se cumpla.
    const currentIndex = this.questions.findIndex((q) => q.id === currentQuestionId);
    for (let i = currentIndex + 1; i < this.questions.length; i += 1) {
      const candidate = this.questions[i];
      if (this.matchesCondition(candidate.condition, responses)) {
        return candidate;
      }
    }

    return null;
  }

  /**
   * Valida un valor para una pregunta según su tipo y obligatoriedad.
   * Retorna { valid: boolean, error?: string, parsedValue?: any }
   */
  validateAnswer(question, rawInput, specialStatus = null) {
    // Si es un estado especial (unknown, undecided, skipped)
    if (specialStatus === CERTAINTY.SKIPPED) {
      if (question.required) {
        return { valid: false, error: "Esta pregunta es obligatoria y no puede omitirse." };
      }
      return { valid: true, parsedValue: null };
    }

    if (specialStatus === CERTAINTY.UNKNOWN || specialStatus === CERTAINTY.UNDECIDED) {
      return { valid: true, parsedValue: null };
    }

    const trimmed = typeof rawInput === "string" ? rawInput.trim() : rawInput;

    if (question.required && (trimmed == null || trimmed === "" || (Array.isArray(trimmed) && trimmed.length === 0))) {
      return { valid: false, error: "Esta pregunta es obligatoria." };
    }

    if (trimmed == null || trimmed === "") {
      return { valid: true, parsedValue: null };
    }

    switch (question.type) {
      case "text":
      case "textarea":
        return { valid: true, parsedValue: String(trimmed) };

      case "boolean": {
        if (typeof trimmed === "boolean") {
          return { valid: true, parsedValue: trimmed };
        }
        const s = String(trimmed).toLowerCase();
        if (/^(s|si|sí|y|yes|true|1)$/i.test(s)) return { valid: true, parsedValue: true };
        if (/^(n|no|false|0)$/i.test(s)) return { valid: true, parsedValue: false };
        return { valid: false, error: "Responde 's' (sí) o 'n' (no)." };
      }

      case "single_select": {
        const options = question.options || [];
        const found = options.find(
          (opt) =>
            (typeof opt === "string" && opt.toLowerCase() === String(trimmed).toLowerCase()) ||
            (opt.value && opt.value.toLowerCase() === String(trimmed).toLowerCase()) ||
            (opt.label && opt.label.toLowerCase() === String(trimmed).toLowerCase())
        );
        if (!found) {
          const allowed = options.map((opt) => (typeof opt === "string" ? opt : opt.value)).join(", ");
          return { valid: false, error: `Opción no válida. Opciones permitidas: ${allowed}` };
        }
        return { valid: true, parsedValue: typeof found === "string" ? found : found.value };
      }

      case "multi_select": {
        let items = Array.isArray(trimmed) ? trimmed : String(trimmed).split(",").map((s) => s.trim()).filter(Boolean);
        const options = question.options || [];
        const validValues = new Set(
          options.map((opt) => (typeof opt === "string" ? opt.toLowerCase() : opt.value.toLowerCase()))
        );
        const result = [];
        for (const item of items) {
          if (!validValues.has(item.toLowerCase())) {
            return { valid: false, error: `Opción '${item}' no válida en la lista de opciones permitidas.` };
          }
          result.push(item);
        }
        return { valid: true, parsedValue: result };
      }

      case "path": {
        const pathStr = String(trimmed);
        return { valid: true, parsedValue: pathStr };
      }

      default:
        return { valid: true, parsedValue: trimmed };
    }
  }

  /**
   * Transforma las respuestas registradas en un modelo conceptual neutral `ProjectKnowledge`.
   */
  buildKnowledgeModel(responses, { projectName = "" } = {}) {
    const knowledge = createProjectKnowledge({ projectName });

    const getEntry = (fieldId, fallback = "") => {
      const resp = responses[fieldId];
      if (!resp) {
        return createKnowledgeEntry({ value: fallback, certainty: CERTAINTY.UNDECIDED });
      }
      return createKnowledgeEntry({
        value: resp.value ?? fallback,
        certainty: resp.status || CERTAINTY.CONFIRMED,
        provenance: resp.provenance || PROVENANCE.USER,
        updatedAt: resp.answeredAt,
      });
    };

    // Identity
    knowledge.identity.name = getEntry("identity_name", projectName);
    knowledge.identity.purpose = getEntry("identity_purpose");
    knowledge.identity.description = getEntry("identity_description");

    // Context
    knowledge.context.problem = getEntry("context_problem");
    knowledge.context.targetUsers = getEntry("context_target_users");

    // Domain
    if (responses.domain_concepts?.value) {
      const lines = String(responses.domain_concepts.value).split("\n").filter(Boolean);
      knowledge.domain.concepts = lines.map((concept) =>
        createKnowledgeEntry({
          value: concept.trim(),
          certainty: responses.domain_concepts.status,
          provenance: responses.domain_concepts.provenance,
        })
      );
    }
    if (responses.domain_business_rules?.value) {
      const lines = String(responses.domain_business_rules.value).split("\n").filter(Boolean);
      knowledge.domain.businessRules = lines.map((rule) =>
        createKnowledgeEntry({
          value: rule.trim(),
          certainty: responses.domain_business_rules.status,
          provenance: responses.domain_business_rules.provenance,
        })
      );
    }

    // Architecture
    knowledge.architecture.overview = getEntry("architecture_style");
    if (responses.architecture_backend_details?.value) {
      knowledge.architecture.components.push(
        createKnowledgeEntry({
          value: `Backend: ${responses.architecture_backend_details.value}`,
          certainty: responses.architecture_backend_details.status,
          provenance: responses.architecture_backend_details.provenance,
        })
      );
    }
    if (responses.architecture_frontend_details?.value) {
      knowledge.architecture.components.push(
        createKnowledgeEntry({
          value: `Frontend: ${responses.architecture_frontend_details.value}`,
          certainty: responses.architecture_frontend_details.status,
          provenance: responses.architecture_frontend_details.provenance,
        })
      );
    }

    // Technology
    if (responses.technology_languages?.value) {
      const langs = String(responses.technology_languages.value).split(/[,/]/).map((l) => l.trim()).filter(Boolean);
      knowledge.technology.languages = langs.map((lang) =>
        createKnowledgeEntry({
          value: lang,
          certainty: responses.technology_languages.status,
          provenance: responses.technology_languages.provenance,
        })
      );
    }
    if (responses.technology_frameworks?.value) {
      const fws = String(responses.technology_frameworks.value).split(/[,/]/).map((l) => l.trim()).filter(Boolean);
      knowledge.technology.frameworks = fws.map((fw) =>
        createKnowledgeEntry({
          value: fw,
          certainty: responses.technology_frameworks.status,
          provenance: responses.technology_frameworks.provenance,
        })
      );
    }
    if (responses.technology_tools?.value) {
      const tools = String(responses.technology_tools.value).split(/[,/]/).map((l) => l.trim()).filter(Boolean);
      knowledge.technology.tools = tools.map((tool) =>
        createKnowledgeEntry({
          value: tool,
          certainty: responses.technology_tools.status,
          provenance: responses.technology_tools.provenance,
        })
      );
    }

    // Conventions
    if (responses.conventions_standards?.value) {
      knowledge.conventions.standards.push(
        createKnowledgeEntry({
          value: responses.conventions_standards.value,
          certainty: responses.conventions_standards.status,
          provenance: responses.conventions_standards.provenance,
        })
      );
    }

    // Constraints
    if (responses.constraints_limitations?.value) {
      knowledge.constraints.limitations.push(
        createKnowledgeEntry({
          value: responses.constraints_limitations.value,
          certainty: responses.constraints_limitations.status,
          provenance: responses.constraints_limitations.provenance,
        })
      );
    }

    // Current state
    knowledge.currentState.status = getEntry("state_phase");
    if (responses.state_implemented_features?.value) {
      const features = String(responses.state_implemented_features.value).split("\n").filter(Boolean);
      knowledge.currentState.implementedFeatures = features.map((f) =>
        createKnowledgeEntry({
          value: f.trim(),
          certainty: responses.state_implemented_features.status,
          provenance: responses.state_implemented_features.provenance,
        })
      );
    }

    // Objectives
    if (responses.objectives_immediate?.value) {
      knowledge.objectives.goals.push(
        createKnowledgeEntry({
          value: responses.objectives_immediate.value,
          certainty: responses.objectives_immediate.status,
          provenance: responses.objectives_immediate.provenance,
        })
      );
    }
    if (responses.objectives_milestones?.value) {
      const milestones = String(responses.objectives_milestones.value).split("\n").filter(Boolean);
      knowledge.objectives.nextMilestones = milestones.map((m) =>
        createKnowledgeEntry({
          value: m.trim(),
          certainty: responses.objectives_milestones.status,
          provenance: responses.objectives_milestones.provenance,
        })
      );
    }

    return knowledge;
  }
}
