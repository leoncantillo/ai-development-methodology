import path from "node:path";
import { DEFAULT_FILENAMES } from "../core/constants.js";

function toPosix(configuredPath) {
  return String(configuredPath).trim().replaceAll("\\", "/");
}

export function looksLikeDirectoryPath(configuredPath) {
  const posix = toPosix(configuredPath);
  if (posix === "" || posix.endsWith("/")) {
    return true;
  }
  return path.posix.extname(path.posix.basename(posix)) === "";
}

export function ensureFilePath(configuredPath, defaultFileName) {
  const posix = toPosix(configuredPath).replace(/\/+$/, "");
  if (posix === "" || looksLikeDirectoryPath(configuredPath)) {
    return posix ? `${posix}/${defaultFileName}` : defaultFileName;
  }
  return posix;
}

export function normalizeConfig(config) {
  return {
    ...config,
    planning: {
      ...config.planning,
      epics: {
        ...config.planning.epics,
        path: toPosix(config.planning.epics.path).replace(/\/+$/, ""),
      },
      roadmap: {
        ...config.planning.roadmap,
        path: ensureFilePath(config.planning.roadmap.path, DEFAULT_FILENAMES.roadmap),
      },
    },
    workflow: {
      ...config.workflow,
      current_task: {
        ...config.workflow.current_task,
        path: ensureFilePath(config.workflow.current_task.path, DEFAULT_FILENAMES.currentTask),
      },
    },
    knowledge: {
      ...config.knowledge,
      source: {
        ...config.knowledge.source,
        path: toPosix(config.knowledge.source.path).replace(/\/+$/, ""),
      },
    },
  };
}
