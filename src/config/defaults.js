import path from "node:path";
import { DEFAULT_CONFIG, DEFAULT_PATHS } from "../core/constants.js";
import { deepMerge } from "../utils/object.js";

export function createDefaultConfig({ projectName, overlay = {} } = {}) {
  const base = structuredClone(DEFAULT_CONFIG);
  base.project.name = projectName || path.basename(process.cwd());
  return deepMerge(base, overlay);
}

export function getAgentPath(config) {
  return config.paths?.agents || DEFAULT_PATHS.agents;
}

export function getMethodologyPath(config) {
  return config.paths?.methodology || DEFAULT_PATHS.methodology;
}

export function publicConfig(config) {
  const {
    project,
    knowledge,
    planning,
    workflow,
    paths,
    version,
  } = config;
  const result = {
    version,
    project,
    knowledge,
    planning,
    workflow,
  };
  if (paths) {
    result.paths = paths;
  }
  return result;
}
