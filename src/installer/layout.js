import path from "node:path";
import { mkdir } from "node:fs/promises";
import { getAgentPath, getMethodologyPath } from "../config/defaults.js";
import { resolveFromProject } from "../core/project.js";

export async function ensureConfiguredLayout(projectDir, config) {
  const knowledgeRoot = resolveFromProject(projectDir, config.knowledge.source.path);
  const currentTask = resolveFromProject(projectDir, config.workflow.current_task.path);

  await mkdir(knowledgeRoot, { recursive: true });
  await mkdir(path.join(knowledgeRoot, config.planning.epics.path), { recursive: true });
  await mkdir(path.dirname(path.join(knowledgeRoot, config.planning.roadmap.path)), {
    recursive: true,
  });
  await mkdir(path.dirname(currentTask), { recursive: true });
  await mkdir(resolveFromProject(projectDir, getAgentPath(config)), { recursive: true });
  await mkdir(resolveFromProject(projectDir, getMethodologyPath(config)), { recursive: true });
}
