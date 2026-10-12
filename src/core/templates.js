import path from "node:path";
import { AGENT_FILES, METHODOLOGY_DOCUMENTS } from "./constants.js";
import { TEMPLATES_ROOT } from "./package.js";
import { readText } from "../utils/fs.js";
import { sha256 } from "./hash.js";

export function templatePath(...segments) {
  return path.join(TEMPLATES_ROOT, ...segments);
}

export async function loadTemplate(relativePath) {
  const absolute = templatePath(relativePath);
  const content = await readText(absolute);
  return {
    relativePath,
    absolute,
    content,
    sha256: sha256(content),
  };
}

export async function listManagedTemplates() {
  const files = [
    ...AGENT_FILES.map((agent) => ({
      kind: "agent",
      template: agent.template,
      name: agent.name,
    })),
    ...METHODOLOGY_DOCUMENTS.map((name) => ({
      kind: "methodology",
      template: `methodology/${name}`,
      name,
    })),
  ];

  const loaded = [];
  for (const file of files) {
    const template = await loadTemplate(file.template);
    loaded.push({ ...file, ...template });
  }
  return loaded;
}

export async function loadCurrentTaskTemplate() {
  return loadTemplate("workflow/current-task.md");
}
