import { loadConfig } from "../config/io.js";
import { resolveProjectDir } from "../core/project.js";
import { CliError } from "../core/errors.js";
import { runOnboarding } from "../knowledge/onboarding/runner.js";

/**
 * Dispatcher para el comando `knowledge`.
 * Operación soportada:
 *   onboard – Inicia o reanuda el cuestionario de recopilación inicial de conocimiento.
 */
export async function knowledgeCommand({ cwd, flags, args }) {
  const projectDir = await resolveProjectDir(cwd);
  const config = await loadConfig(projectDir);

  const sub = args[0];
  if (!sub) {
    throw new CliError("Uso: ai-methodology knowledge onboard [opciones]");
  }

  switch (sub) {
    case "onboard": {
      await runOnboarding({ projectDir, config, flags });
      break;
    }
    default:
      throw new CliError(
        `Sub‑comando desconocido: ${sub}. Operaciones disponibles: onboard`
      );
  }

  return 0;
}
