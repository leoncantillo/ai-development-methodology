import { loadConfig, saveConfig } from "../config/io.js";
import { assertSettablePath, assertValidConfig } from "../config/schema.js";
import { promptInstallConfig } from "../cli/prompts.js";
import { CliError } from "../core/errors.js";
import { resolveProjectDir } from "../core/project.js";
import { coerceValue, setByPath } from "../utils/object.js";

export async function configCommand({ cwd, flags }) {
  const projectDir = await resolveProjectDir(cwd);
  const current = await loadConfig(projectDir);

  if (flags.show) {
    console.log(JSON.stringify(current, null, 2));
    return 0;
  }

  if (flags.set) {
    if (flags.value === undefined) {
      throw new CliError("Uso: ai-methodology config --set <clave> <valor>");
    }
    assertSettablePath(flags.set);
    const next = setByPath(current, flags.set, coerceValue(flags.value));
    await saveConfig(projectDir, assertValidConfig(next));
    console.log(`Actualizado ${flags.set}`);
    return 0;
  }

  const interactive = process.stdin.isTTY && process.stdout.isTTY;
  if (!interactive) {
    throw new CliError("Sin TTY. Usa `--show` o `--set <clave> <valor>`.");
  }

  const updated = await promptInstallConfig({
    projectName: current.project.name,
    existing: current,
  });
  await saveConfig(projectDir, updated);
  console.log("Configuración actualizada.");
  return 0;
}
