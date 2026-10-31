export const CONFIG_FILENAME = "ai-methodology.config.json";
export const MANIFEST_DIR = ".ai-methodology";
export const MANIFEST_FILENAME = "manifest.json";
export const SCHEMA_VERSION = 1;

export const DEFAULT_PATHS = {
  agents: ".agents/workflow",
  methodology: "docs/ai-development-methodology",
};

export const DEFAULT_FILENAMES = {
  currentTask: "current-task.md",
  roadmap: "roadmap.md",
};

export const DEFAULT_CONFIG = {
  version: SCHEMA_VERSION,
  project: {
    name: "",
  },
  knowledge: {
    source: {
      type: "local",
      path: "docs/knowledge",
    },
    graph: {
      provider: "graphify",
      enabled: false,
    },
  },
  planning: {
    unit: "epic",
    epics: {
      path: "planning/epics",
    },
    roadmap: {
      path: "planning/roadmap.md",
    },
  },
  workflow: {
    current_task: {
      path: "current-task.md",
    },
  },
};

export const METHODOLOGY_DOCUMENTS = [
  "README.md",
  "development-workflow.md",
  "git-workflow.md",
  "planning-user-stories.md",
  "project-foundation.md",
];

export const AGENT_FILES = [
  { template: "agents/workflow/designer.md", name: "designer.md" },
  { template: "agents/workflow/executor.md", name: "executor.md" },
  { template: "agents/workflow/pka.md", name: "pka.md" },
];

export const SETTABLE_PATHS = new Set([
  "project.name",
  "project.description",
  "knowledge.source.type",
  "knowledge.source.path",
  "knowledge.graph.provider",
  "knowledge.graph.enabled",
  "planning.unit",
  "planning.epics.path",
  "planning.roadmap.path",
  "workflow.current_task.path",
  "paths.agents",
  "paths.methodology",
]);
