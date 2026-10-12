import path from "node:path";
import { getAgentPath, getMethodologyPath } from "../config/defaults.js";
import { listManagedTemplates, loadCurrentTaskTemplate } from "../core/templates.js";
import { loadManifest, toProjectRelative } from "../core/manifest.js";
import { resolveFromProject } from "../core/project.js";
import { classifyFile } from "./files.js";

export function resolveManagedDestination(projectDir, config, template) {
  if (template.kind === "agent") {
    return resolveFromProject(projectDir, path.join(getAgentPath(config), template.name));
  }
  return resolveFromProject(projectDir, path.join(getMethodologyPath(config), template.name));
}

export async function planManagedFiles(projectDir, config) {
  const templates = await listManagedTemplates();
  const manifest = await loadManifest(projectDir);
  const plan = [];

  for (const template of templates) {
    const destination = resolveManagedDestination(projectDir, config, template);
    const relative = toProjectRelative(projectDir, destination);
    const installed = manifest?.files?.[relative];
    const status = await classifyFile(destination, {
      templateHash: template.sha256,
      installedHash: installed?.sha256,
    });

    plan.push({
      kind: template.kind,
      template: template.relativePath,
      destination,
      relative,
      content: template.content,
      templateHash: template.sha256,
      installedHash: installed?.sha256 ?? null,
      status,
    });
  }

  return { plan, manifest };
}

export async function planCurrentTask(projectDir, config) {
  const template = await loadCurrentTaskTemplate();
  const destination = resolveFromProject(projectDir, config.workflow.current_task.path);
  const relative = toProjectRelative(projectDir, destination);
  const exists = await classifyFile(destination, {
    templateHash: template.sha256,
    installedHash: null,
  });

  return {
    template: template.relativePath,
    destination,
    relative,
    content: template.content,
    templateHash: template.sha256,
    status: exists,
  };
}
