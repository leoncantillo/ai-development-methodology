/**
 * Tipos y constantes para el modelo conceptual de conocimiento de ai-methodology.
 */

export const PROVENANCE = {
  USER: "user",
  IMPORTED: "imported",
  AGENT: "agent",
};

export const CERTAINTY = {
  CONFIRMED: "confirmed",
  HYPOTHESIS: "hypothesis",
  UNDECIDED: "undecided",
  UNKNOWN: "unknown",
  SKIPPED: "skipped",
};

export const CATEGORIES = {
  IDENTITY: "identity",
  CONTEXT: "context",
  DOMAIN: "domain",
  ARCHITECTURE: "architecture",
  TECHNOLOGY: "technology",
  CONVENTIONS: "conventions",
  CONSTRAINTS: "constraints",
  CURRENT_STATE: "current_state",
  OBJECTIVES: "objectives",
};

export const CATEGORY_LABELS = {
  [CATEGORIES.IDENTITY]: "Identidad",
  [CATEGORIES.CONTEXT]: "Contexto",
  [CATEGORIES.DOMAIN]: "Dominio",
  [CATEGORIES.ARCHITECTURE]: "Arquitectura",
  [CATEGORIES.TECHNOLOGY]: "Tecnologías",
  [CATEGORIES.CONVENTIONS]: "Convenciones",
  [CATEGORIES.CONSTRAINTS]: "Restricciones",
  [CATEGORIES.CURRENT_STATE]: "Estado Actual",
  [CATEGORIES.OBJECTIVES]: "Objetivos",
};

/**
 * Crea una entrada de conocimiento con trazabilidad y certeza.
 */
export function createKnowledgeEntry({
  value,
  certainty = CERTAINTY.CONFIRMED,
  provenance = PROVENANCE.USER,
  notes = null,
  source = null,
  updatedAt = new Date().toISOString(),
}) {
  return {
    value,
    certainty,
    provenance,
    notes,
    source,
    updatedAt,
  };
}

/**
 * Crea una estructura neutral inicial del modelo conceptual de conocimiento.
 */
export function createProjectKnowledge({ projectName = "" } = {}) {
  return {
    metadata: {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    identity: {
      name: createKnowledgeEntry({ value: projectName }),
      purpose: createKnowledgeEntry({ value: "", certainty: CERTAINTY.UNDECIDED }),
      description: createKnowledgeEntry({ value: "", certainty: CERTAINTY.UNDECIDED }),
    },
    context: {
      problem: createKnowledgeEntry({ value: "", certainty: CERTAINTY.UNDECIDED }),
      targetUsers: createKnowledgeEntry({ value: "", certainty: CERTAINTY.UNDECIDED }),
    },
    domain: {
      concepts: [],
      businessRules: [],
    },
    architecture: {
      overview: createKnowledgeEntry({ value: "", certainty: CERTAINTY.UNDECIDED }),
      components: [],
      decisions: [],
    },
    technology: {
      languages: [],
      frameworks: [],
      tools: [],
      storage: [],
    },
    conventions: {
      standards: [],
      practices: [],
    },
    constraints: {
      limitations: [],
      dependencies: [],
    },
    currentState: {
      status: createKnowledgeEntry({ value: "", certainty: CERTAINTY.UNDECIDED }),
      implementedFeatures: [],
    },
    objectives: {
      goals: [],
      nextMilestones: [],
    },
  };
}
