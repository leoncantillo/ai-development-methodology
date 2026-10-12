import assert from "node:assert/strict";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { makeTempDir, runCli, seedKnowledge, validConfig, writeProjectConfig } from "./helpers.js";

test("install --yes crea agentes, documentos, config y current-task", async () => {
  const dir = await makeTempDir();
  const result = await runCli(["install", "--yes", "--name", "demo", "--cwd", dir]);
  assert.equal(result.code, 0, result.stderr || result.stdout);

  const config = JSON.parse(await readFile(path.join(dir, "ai-methodology.config.json"), "utf8"));
  assert.equal(config.project.name, "demo");
  assert.equal(config.version, 1);
  assert.equal(config.planning.unit, "epic");

  const designer = await readFile(path.join(dir, ".agents/workflow/designer.md"), "utf8");
  assert.match(designer, /ai-methodology\.config\.json/);
  await readFile(path.join(dir, "docs/ai-development-methodology/git-workflow.md"), "utf8");
  await readFile(path.join(dir, "current-task.md"), "utf8");
  await readFile(path.join(dir, ".ai-methodology/manifest.json"), "utf8");
  assert.equal((await stat(path.join(dir, "docs/knowledge/planning/epics"))).isDirectory(), true);
});

test("install crea las rutas configuradas y no abre docs como archivo", async () => {
  const dir = await makeTempDir();
  await writeProjectConfig(
    dir,
    validConfig({
      knowledge: {
        source: { type: "local", path: "docs" },
        graph: { provider: "graphify", enabled: false },
      },
      planning: {
        unit: "epic",
        epics: { path: "planning/epics" },
        roadmap: { path: "planning/roadmap.md" },
      },
      workflow: {
        current_task: { path: "docs" },
      },
    })
  );

  const result = await runCli(["install", "--yes", "--name", "demo", "--cwd", dir]);
  assert.equal(result.code, 0, result.stderr || result.stdout);
  assert.doesNotMatch(result.stderr, /EISDIR/);

  const config = JSON.parse(await readFile(path.join(dir, "ai-methodology.config.json"), "utf8"));
  assert.equal(config.knowledge.source.path, "docs");
  assert.equal(config.workflow.current_task.path, "docs/current-task.md");
  await readFile(path.join(dir, "docs/current-task.md"), "utf8");
  await readFile(path.join(dir, "docs/ai-development-methodology/git-workflow.md"), "utf8");
  assert.equal((await stat(path.join(dir, "docs/planning/epics"))).isDirectory(), true);
});

test("install no sobrescribe un agente modificado y update sigue detectando el conflicto", async () => {
  const dir = await makeTempDir();
  await runCli(["install", "--yes", "--name", "demo", "--cwd", dir]);
  const designerPath = path.join(dir, ".agents/workflow/designer.md");
  await writeFile(designerPath, "# custom designer\n", "utf8");

  const second = await runCli(["install", "--yes", "--cwd", dir]);
  assert.equal(second.code, 0, second.stderr || second.stdout);
  assert.equal(await readFile(designerPath, "utf8"), "# custom designer\n");
  assert.match(second.stdout, /Conflictos|modificados/i);

  const updated = await runCli(["update", "--cwd", dir]);
  assert.equal(updated.code, 1);
  assert.equal(await readFile(designerPath, "utf8"), "# custom designer\n");
  assert.match(updated.stdout, /conflict /);
});

test("validate detecta un agente faltante", async () => {
  const dir = await makeTempDir();
  await writeProjectConfig(dir, validConfig());
  await seedKnowledge(dir);

  const result = await runCli(["validate", "--cwd", dir]);
  assert.equal(result.code, 1);
  assert.match(result.stdout, /Falta el agente designer.md/);
});

test("config --set actualiza un campo y rechaza JSON inválido intermedio", async () => {
  const dir = await makeTempDir();
  await runCli(["install", "--yes", "--name", "demo", "--cwd", dir]);

  const ok = await runCli([
    "config",
    "--set",
    "knowledge.graph.enabled",
    "true",
    "--cwd",
    dir,
  ]);
  assert.equal(ok.code, 0, ok.stderr);
  const config = JSON.parse(await readFile(path.join(dir, "ai-methodology.config.json"), "utf8"));
  assert.equal(config.knowledge.graph.enabled, true);

  const bad = await runCli(["config", "--set", "knowledge.source.type", "notion", "--cwd", dir]);
  assert.equal(bad.code, 1);
  const unchanged = JSON.parse(await readFile(path.join(dir, "ai-methodology.config.json"), "utf8"));
  assert.equal(unchanged.knowledge.source.type, "local");
});

test("update no pisa cambios locales y --overwrite-local sí", async () => {
  const dir = await makeTempDir();
  await runCli(["install", "--yes", "--name", "demo", "--cwd", dir]);
  const designerPath = path.join(dir, ".agents/workflow/designer.md");
  await writeFile(designerPath, "# local change\n", "utf8");

  const blocked = await runCli(["update", "--cwd", dir]);
  assert.equal(blocked.code, 1);
  assert.equal(await readFile(designerPath, "utf8"), "# local change\n");

  const forced = await runCli(["update", "--overwrite-local", "--cwd", dir]);
  assert.equal(forced.code, 0, forced.stderr || forced.stdout);
  const restored = await readFile(designerPath, "utf8");
  assert.match(restored, /Task Planning and Review/);
});
