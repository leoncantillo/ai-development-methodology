import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createDefaultConfig } from "../config/defaults.js";
import { DEFAULT_PATHS } from "../core/constants.js";
import { assertValidConfig } from "../config/schema.js";

async function ask(question, fallback) {
  const rl = readline.createInterface({ input, output });
  try {
    const suffix = fallback == null || fallback === "" ? "" : ` (${fallback})`;
    const answer = (await rl.question(`${question}${suffix}: `)).trim();
    return answer || fallback;
  } finally {
    rl.close();
  }
}

function asBoolean(value, fallback) {
  if (value == null || value === "") {
    return fallback;
  }
  return /^(y|yes|true|1|s|si|sí)$/i.test(String(value));
}

export async function promptInstallConfig({ projectName, existing }) {
  const defaults = createDefaultConfig({
    projectName,
    overlay: existing ?? {},
  });

  const name = await ask("Nombre del proyecto", defaults.project.name);
  const knowledgePath = await ask(
    "Ruta de la fuente de conocimiento (relativa al proyecto)",
    defaults.knowledge.source.path
  );
  const graphEnabled = asBoolean(
    await ask("¿Habilitar Graphify? [y/N]", defaults.knowledge.graph.enabled ? "y" : "n"),
    defaults.knowledge.graph.enabled
  );
  const unit = await ask("Unidad de planificación", defaults.planning.unit);
  const epicsPath = await ask("Ruta de épicas (relativa a la fuente de conocimiento)", defaults.planning.epics.path);
  const roadmapPath = await ask(
    "Ruta del roadmap (relativa a la fuente de conocimiento)",
    defaults.planning.roadmap.path
  );
  const currentTask = await ask("Ruta de current-task", defaults.workflow.current_task.path);
  const agentsPath = await ask("Ruta de agentes", existing?.paths?.agents || DEFAULT_PATHS.agents);
  const methodologyPath = await ask(
    "Ruta de documentación de la metodología",
    existing?.paths?.methodology || DEFAULT_PATHS.methodology
  );

  const config = {
    version: 1,
    project: { name },
    knowledge: {
      source: { type: "local", path: knowledgePath },
      graph: { provider: "graphify", enabled: graphEnabled },
    },
    planning: {
      unit,
      epics: { path: epicsPath },
      roadmap: { path: roadmapPath },
    },
    workflow: {
      current_task: { path: currentTask },
    },
  };

  if (agentsPath !== DEFAULT_PATHS.agents || methodologyPath !== DEFAULT_PATHS.methodology) {
    config.paths = {
      agents: agentsPath,
      methodology: methodologyPath,
    };
  }

  return assertValidConfig(config);
}
