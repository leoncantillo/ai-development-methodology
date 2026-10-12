import assert from "node:assert/strict";
import { test } from "node:test";
import { ensureFilePath, looksLikeDirectoryPath, normalizeConfig } from "../src/config/normalize.js";
import { validateConfig } from "../src/config/schema.js";
import { validConfig } from "./helpers.js";

test("acepta la configuración canónica", () => {
  const result = validateConfig(validConfig());
  assert.equal(result.valid, true);
});

test("rechaza un knowledge.source.type distinto de local", () => {
  const config = validConfig();
  config.knowledge.source.type = "notion";
  const result = validateConfig(config);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /local/);
});

test("rechaza project.name vacío", () => {
  const config = validConfig();
  config.project.name = "  ";
  const result = validateConfig(config);
  assert.equal(result.valid, false);
});

test("trata rutas sin extensión como directorios y añade el archivo por defecto", () => {
  assert.equal(looksLikeDirectoryPath("docs"), true);
  assert.equal(looksLikeDirectoryPath("docs/"), true);
  assert.equal(looksLikeDirectoryPath("current-task.md"), false);
  assert.equal(ensureFilePath("docs", "current-task.md"), "docs/current-task.md");
  assert.equal(ensureFilePath("docs/", "current-task.md"), "docs/current-task.md");
  assert.equal(ensureFilePath("current-task.md", "current-task.md"), "current-task.md");

  const normalized = normalizeConfig(
    validConfig({
      workflow: { current_task: { path: "docs" } },
      planning: {
        unit: "epic",
        epics: { path: "planning/epics/" },
        roadmap: { path: "planning" },
      },
    })
  );
  assert.equal(normalized.workflow.current_task.path, "docs/current-task.md");
  assert.equal(normalized.planning.epics.path, "planning/epics");
  assert.equal(normalized.planning.roadmap.path, "planning/roadmap.md");
});
