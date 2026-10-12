import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { getAgentPath, getMethodologyPath } from "../config/defaults.js";
import { AGENT_FILES, CONFIG_FILENAME, METHODOLOGY_DOCUMENTS } from "../core/constants.js";
import { configPath } from "../config/io.js";
import { validateConfig } from "../config/schema.js";
import { loadManifest } from "../core/manifest.js";
import { getPackageVersion } from "../core/package.js";
import { resolveFromProject } from "../core/project.js";
import { isDirectory, isFile, pathExists, readJson } from "../utils/fs.js";

const execFileAsync = promisify(execFile);

function ok(id, message) {
  return { id, status: "ok", message };
}

function warn(id, message) {
  return { id, status: "warn", message };
}

function error(id, message) {
  return { id, status: "error", message };
}

export async function runChecks(projectDir) {
  const checks = [];
  const file = configPath(projectDir);

  if (!(await pathExists(file))) {
    checks.push(error("config", `Falta ${CONFIG_FILENAME}`));
    return checks;
  }

  let config;
  try {
    config = await readJson(file);
  } catch (err) {
    checks.push(error("config", `${CONFIG_FILENAME} no es JSON válido: ${err.message}`));
    return checks;
  }

  const schema = validateConfig(config);
  if (!schema.valid) {
    checks.push(error("config", `Configuración inválida: ${schema.errors.join("; ")}`));
    return checks;
  }
  checks.push(ok("config", "Archivo de configuración"));

  const agentsDir = resolveFromProject(projectDir, getAgentPath(config));
  if (!(await isDirectory(agentsDir))) {
    checks.push(error("agents-dir", `No existe el directorio de agentes: ${getAgentPath(config)}`));
  } else {
    checks.push(ok("agents-dir", "Directorio de agentes"));
  }

  for (const agent of AGENT_FILES) {
    const agentPath = path.join(agentsDir, agent.name);
    const id = `agent-${path.parse(agent.name).name}`;
    if (await isFile(agentPath)) {
      checks.push(ok(id, `Agente ${agent.name}`));
    } else {
      checks.push(error(id, `Falta el agente ${agent.name}`));
    }
  }

  const methodologyDir = resolveFromProject(projectDir, getMethodologyPath(config));
  if (!(await isDirectory(methodologyDir))) {
    checks.push(error("methodology-dir", `No existe el directorio de metodología: ${getMethodologyPath(config)}`));
  } else {
    checks.push(ok("methodology-dir", "Directorio de metodología"));
  }

  for (const name of METHODOLOGY_DOCUMENTS) {
    const docPath = path.join(methodologyDir, name);
    const id = `doc-${path.parse(name).name}`;
    if (await isFile(docPath)) {
      checks.push(ok(id, `Documento ${name}`));
    } else {
      checks.push(error(id, `Falta el documento ${name}`));
    }
  }

  const knowledgeRoot = resolveFromProject(projectDir, config.knowledge.source.path);
  if (await pathExists(knowledgeRoot)) {
    checks.push(ok("knowledge", `Fuente de conocimiento (${config.knowledge.source.path})`));
  } else {
    checks.push(warn("knowledge", `No existe la fuente de conocimiento: ${config.knowledge.source.path}`));
  }

  const epicsPath = path.join(knowledgeRoot, config.planning.epics.path);
  if (await pathExists(epicsPath)) {
    checks.push(ok("planning-epics", "Fuente de planificación (épicas)"));
  } else {
    checks.push(warn("planning-epics", `No existe planning.epics.path: ${config.planning.epics.path}`));
  }

  const roadmapPath = path.join(knowledgeRoot, config.planning.roadmap.path);
  if (await pathExists(roadmapPath)) {
    checks.push(ok("planning-roadmap", "Roadmap de planificación"));
  } else {
    checks.push(warn("planning-roadmap", `No existe planning.roadmap.path: ${config.planning.roadmap.path}`));
  }

  const currentTask = resolveFromProject(projectDir, config.workflow.current_task.path);
  if (await isFile(currentTask)) {
    checks.push(ok("current-task", "Archivo de tarea actual"));
  } else {
    checks.push(warn("current-task", `No existe workflow.current_task.path: ${config.workflow.current_task.path}`));
  }

  if (config.knowledge.graph.enabled) {
    try {
      await execFileAsync("graphify", ["--help"]);
      checks.push(ok("graphify", "Graphify disponible"));
    } catch {
      checks.push(warn("graphify", "Graphify está habilitado pero no está disponible en PATH"));
    }
  } else {
    checks.push(ok("graphify", "Integración Graphify desactivada"));
  }

  const manifest = await loadManifest(projectDir);
  const packageVersion = await getPackageVersion();
  if (!manifest) {
    checks.push(warn("manifest", "No hay manifiesto de instalación; update no podrá detectar cambios locales con precisión"));
  } else if (manifest.packageVersion !== packageVersion) {
    checks.push(warn("manifest", `Versión instalada ${manifest.packageVersion}; paquete actual ${packageVersion}`));
  } else {
    checks.push(ok("manifest", `Versión instalada ${manifest.packageVersion}`));
  }

  return checks;
}

export function summarizeChecks(checks) {
  const errors = checks.filter((item) => item.status === "error").length;
  const warnings = checks.filter((item) => item.status === "warn").length;
  if (errors > 0) {
    return { result: "invalid", errors, warnings };
  }
  if (warnings > 0) {
    return { result: "valid-with-warnings", errors, warnings };
  }
  return { result: "valid", errors, warnings };
}
