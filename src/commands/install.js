import path from "node:path";
import { configExists, configPath, loadConfig, saveConfig } from "../config/io.js";
import { createDefaultConfig } from "../config/defaults.js";
import { promptInstallConfig } from "../cli/prompts.js";
import { printInstallSummary } from "../cli/output.js";
import { CliError } from "../core/errors.js";
import { findGitRoot } from "../core/git.js";
import { resolveProjectDir } from "../core/project.js";
import { applyCurrentTask, applyManagedPlan } from "../installer/apply.js";
import { ensureConfiguredLayout } from "../installer/layout.js";
import { planCurrentTask, planManagedFiles } from "../installer/plan.js";
import { runChecks, summarizeChecks } from "../validator/checks.js";
import { printValidation } from "../cli/output.js";

export async function installCommand({ cwd, flags }) {
  const projectDir = await resolveProjectDir(cwd, { forInstall: true });
  const gitRoot = await findGitRoot(projectDir);

  if (!gitRoot) {
    console.log("Aviso: no se detectó un repositorio Git. La instalación continuará en el directorio actual.");
  }

  const hasConfig = await configExists(projectDir);
  let existing = null;
  if (hasConfig) {
    existing = await loadConfig(projectDir);
    console.log("Se encontró una instalación previa. Se reutilizará la configuración salvo que la modifiques.");
  }

  const projectName = flags.name || existing?.project?.name || path.basename(projectDir);
  const interactive = !flags.yes && process.stdin.isTTY && process.stdout.isTTY;

  let config;
  if (interactive) {
    config = await promptInstallConfig({ projectName, existing });
  } else if (flags.yes || existing) {
    config = existing ?? createDefaultConfig({ projectName });
  } else {
    throw new CliError("No hay TTY para la instalación interactiva. Usa `--yes` o proporciona una configuración existente.");
  }

  config = await saveConfig(projectDir, config);
  await ensureConfiguredLayout(projectDir, config);

  const { plan } = await planManagedFiles(projectDir, config);
  const applied = await applyManagedPlan(projectDir, plan, {
    overwriteLocal: Boolean(flags["overwrite-local"]),
  });
  const currentTask = await planCurrentTask(projectDir, config);
  const currentTaskResult = await applyCurrentTask(currentTask);

  printInstallSummary({
    projectDir,
    written: applied.written,
    skipped: applied.skipped,
    conflicts: applied.conflicts,
    currentTask: { ...currentTask, created: currentTaskResult.created },
    configPath: configPath(projectDir),
  });

  const checks = await runChecks(projectDir);
  const summary = summarizeChecks(checks);
  printValidation(checks, summary);

  if (applied.conflicts.length > 0) {
    console.log("\nUsa `--overwrite-local` solo si quieres reemplazar los archivos modificados.");
  }

  return summary.result === "invalid" ? 1 : 0;
}
