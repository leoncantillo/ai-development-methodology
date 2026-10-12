import path from "node:path";
import { CONFIG_FILENAME } from "../core/constants.js";
import { CliError } from "../core/errors.js";
import { isFile, pathExists, readJson, writeJson } from "../utils/fs.js";
import { publicConfig } from "./defaults.js";
import { normalizeConfig } from "./normalize.js";
import { assertValidConfig } from "./schema.js";

export function configPath(projectDir) {
  return path.join(projectDir, CONFIG_FILENAME);
}

export async function configExists(projectDir) {
  return pathExists(configPath(projectDir));
}

export async function loadConfig(projectDir) {
  const file = configPath(projectDir);
  if (!(await isFile(file))) {
    throw new CliError(
      `No se encontró ${CONFIG_FILENAME} en ${projectDir}. Ejecuta \`ai-methodology install\` primero.`
    );
  }

  let parsed;
  try {
    parsed = await readJson(file);
  } catch (error) {
    throw new CliError(`No se pudo leer ${CONFIG_FILENAME}: ${error.message}`);
  }

  return assertValidConfig(normalizeConfig(parsed));
}

export async function saveConfig(projectDir, config) {
  const valid = assertValidConfig(normalizeConfig(config));
  await writeJson(configPath(projectDir), publicConfig(valid));
  return valid;
}
