import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { PACKAGE_ROOT } from "../src/core/package.js";

export async function makeTempDir() {
  return mkdtemp(path.join(os.tmpdir(), "ai-methodology-"));
}

export async function writeProjectConfig(dir, config) {
  await writeFile(
    path.join(dir, "ai-methodology.config.json"),
    `${JSON.stringify(config, null, 2)}\n`,
    "utf8"
  );
}

export function validConfig(overrides = {}) {
  return {
    version: 1,
    project: { name: "demo" },
    knowledge: {
      source: { type: "local", path: "knowledge" },
      graph: { provider: "graphify", enabled: false },
    },
    planning: {
      unit: "epic",
      epics: { path: "planning/epics" },
      roadmap: { path: "planning/roadmap.md" },
    },
    workflow: {
      current_task: { path: "current-task.md" },
    },
    ...overrides,
  };
}

export async function seedKnowledge(dir) {
  await mkdir(path.join(dir, "knowledge", "planning", "epics"), { recursive: true });
  await writeFile(path.join(dir, "knowledge", "planning", "roadmap.md"), "# Roadmap\n", "utf8");
  await writeFile(path.join(dir, "knowledge", "planning", "epics", "epic-1.md"), "# Epic\n", "utf8");
}

export function runCli(args, { cwd } = {}) {
  const bin = path.join(PACKAGE_ROOT, "bin", "ai-methodology.js");
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [bin, ...args], {
      cwd,
      env: { ...process.env },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}
