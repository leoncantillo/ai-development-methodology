import { mkdir } from "node:fs/promises";
import path from "node:path";
import { createManifest, saveManifest } from "../core/manifest.js";
import { writeManagedFile } from "./files.js";

export async function applyManagedPlan(projectDir, plan, { overwriteLocal = false } = {}) {
  const files = {};
  const written = [];
  const skipped = [];
  const conflicts = [];

  for (const item of plan) {
    if (item.status === "modified" && !overwriteLocal) {
      conflicts.push(item);
      if (item.installedHash) {
        files[item.relative] = {
          template: item.template,
          sha256: item.installedHash,
        };
      }
      continue;
    }

    if (item.status === "current") {
      files[item.relative] = {
        template: item.template,
        sha256: item.templateHash,
      };
      skipped.push({ ...item, reason: "already-current" });
      continue;
    }

    await mkdir(path.dirname(item.destination), { recursive: true });
    const hash = await writeManagedFile(item.destination, item.content);
    files[item.relative] = {
      template: item.template,
      sha256: hash,
    };
    written.push(item);
  }

  const manifest = await createManifest({ files });
  await saveManifest(projectDir, manifest);

  return { written, skipped, conflicts, manifest };
}

export async function applyCurrentTask(taskPlan) {
  if (taskPlan.status === "missing") {
    await mkdir(path.dirname(taskPlan.destination), { recursive: true });
    await writeManagedFile(taskPlan.destination, taskPlan.content);
    return { created: true };
  }
  return { created: false };
}
