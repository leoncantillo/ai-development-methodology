import { resolveProjectDir } from "../core/project.js";
import { printValidation } from "../cli/output.js";
import { runChecks, summarizeChecks } from "../validator/checks.js";

export async function validateCommand({ cwd, flags }) {
  const projectDir = await resolveProjectDir(cwd);
  const checks = await runChecks(projectDir);
  const summary = summarizeChecks(checks);
  printValidation(checks, summary);

  if (summary.result === "invalid") {
    return 1;
  }
  if (flags.strict && summary.warnings > 0) {
    return 1;
  }
  return 0;
}
