import { loadConfig } from "../config/io.js";
import { getPackageVersion } from "../core/package.js";
import { resolveProjectDir } from "../core/project.js";
import { applyManagedPlan } from "../installer/apply.js";
import { planManagedFiles } from "../installer/plan.js";
import { printValidation } from "../cli/output.js";
import { runChecks, summarizeChecks } from "../validator/checks.js";

export async function updateCommand({ cwd, flags }) {
  const projectDir = await resolveProjectDir(cwd);
  const config = await loadConfig(projectDir);
  const version = await getPackageVersion();
  const { plan, manifest } = await planManagedFiles(projectDir, config);

  console.log(`Versión del paquete: ${version}`);
  console.log(`Versión instalada: ${manifest?.packageVersion ?? "desconocida"}`);

  const missing = plan.filter((item) => item.status === "missing");
  const outdated = plan.filter((item) => item.status === "outdated");
  const current = plan.filter((item) => item.status === "current");
  const modified = plan.filter((item) => item.status === "modified");

  console.log(`\nActualizables: ${missing.length + outdated.length}`);
  console.log(`Al día: ${current.length}`);
  console.log(`Modificados localmente: ${modified.length}`);

  for (const item of [...missing, ...outdated]) {
    console.log(`  update  ${item.relative}`);
  }
  for (const item of modified) {
    console.log(`  conflict ${item.relative}`);
  }

  if (flags["dry-run"]) {
    return modified.length > 0 ? 1 : 0;
  }

  const applied = await applyManagedPlan(projectDir, plan, {
    overwriteLocal: Boolean(flags["overwrite-local"]),
  });

  console.log(`\nArchivos actualizados: ${applied.written.length}`);
  if (applied.conflicts.length > 0) {
    console.log("No se sobrescribieron archivos con cambios locales.");
    console.log("Revísalos y vuelve a ejecutar con `--overwrite-local` si corresponde.");
  }

  const checks = await runChecks(projectDir);
  const summary = summarizeChecks(checks);
  printValidation(checks, summary);
  return summary.result === "invalid" || applied.conflicts.length > 0 ? 1 : 0;
}
