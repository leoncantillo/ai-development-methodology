import path from "node:path";
import { CONFIG_FILENAME } from "./constants.js";
import { findGitRoot } from "./git.js";
import { pathExists } from "../utils/fs.js";

export async function findConfigRoot(startDir) {
  let current = path.resolve(startDir);
  const { root } = path.parse(current);

  while (true) {
    if (await pathExists(path.join(current, CONFIG_FILENAME))) {
      return current;
    }
    if (current === root) {
      return null;
    }
    current = path.dirname(current);
  }
}

export async function resolveProjectDir(cwd, { forInstall = false } = {}) {
  const start = path.resolve(cwd);

  if (!forInstall) {
    const configRoot = await findConfigRoot(start);
    if (configRoot) {
      return configRoot;
    }
  }

  const gitRoot = await findGitRoot(start);
  return gitRoot ?? start;
}

export function resolveFromProject(projectDir, targetPath) {
  if (path.isAbsolute(targetPath)) {
    return targetPath;
  }
  return path.resolve(projectDir, targetPath);
}
