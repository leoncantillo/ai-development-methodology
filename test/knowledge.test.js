import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { makeTempDir, runCli, validConfig, writeProjectConfig } from "./helpers.js";
import { OnboardingEngine } from "../src/knowledge/onboarding/engine.js";
import { OnboardingSession } from "../src/knowledge/onboarding/session.js";
import { runOnboarding } from "../src/knowledge/onboarding/runner.js";
import { Readable, Writable } from "node:stream";

function createMockIo(lines = []) {
  let outputStr = "";
  const output = new Writable({
    write(chunk, encoding, callback) {
      outputStr += chunk.toString();
      callback();
    },
  });
  return {
    output,
    getOutput: () => outputStr,
    session: new OnboardingSession({ output, inputs: lines }),
  };
}

test("10. Ejecución mediante install: install --yes no bloquea el CLI y avisa del onboarding", async () => {
  const dir = await makeTempDir();
  const result = await runCli(["install", "--yes", "--name", "onboarding-demo", "--cwd", dir]);

  assert.equal(result.code, 0, result.stderr || result.stdout);
  const config = JSON.parse(await readFile(path.join(dir, "ai-methodology.config.json"), "utf8"));
  assert.equal(config.project.name, "onboarding-demo");
});

test("Escenario 2: Proyecto existente con conocimiento previo registra la fuente", async () => {
  const dir = await makeTempDir();
  const config = validConfig({ project: { name: "ExistingDocApp" } });
  await writeProjectConfig(dir, config);

  // Inputs:
  // Escenario: 2 (existente con docs)
  // Ruta: "docs/existing-wiki"
  // Preguntas complementarias: "n" (no responder más ahora)
  const inputs = ["2", "docs/existing-wiki", "n"];
  const mock = createMockIo(inputs);

  const result = await runOnboarding({
    projectDir: dir,
    config,
    session: mock.session,
  });

  assert.equal(result.completed, true);
  assert.equal(result.skippedQuestions, true);

  const updatedConfig = JSON.parse(await readFile(path.join(dir, "ai-methodology.config.json"), "utf8"));
  assert.equal(updatedConfig.knowledge.source.path, "docs/existing-wiki");
});

test("Modificación de respuestas en el resumen antes de confirmar", async () => {
  const dir = await makeTempDir();
  const config = validConfig();

  const minimalQuestions = [
    { id: "identity_name", category: "identity", question: "Nombre", type: "text", required: true },
    { id: "identity_purpose", category: "identity", question: "Propósito", type: "text", required: true },
  ];
  const engine = new OnboardingEngine(minimalQuestions);

  // Inputs:
  // 1: Escenario nuevo
  // Q1: 'NombreInicial'
  // Q2: 'PropositoInicial'
  // Decisión: '2' (modificar)
  // Pregunta a modificar: '1' (q1)
  // Nuevo valor: 'NombreCorregido'
  // Decisión: '1' (confirmar y guardar)
  const inputs = [
    "1",
    "NombreInicial",
    "PropositoInicial",
    "2",
    "1",
    "NombreCorregido",
    "1",
  ];
  const mock = createMockIo(inputs);

  const result = await runOnboarding({
    projectDir: dir,
    config,
    session: mock.session,
    engine,
  });

  assert.equal(result.completed, true);
  assert.equal(result.saved, true);
  assert.equal(result.knowledgeModel.identity.name.value, "NombreCorregido");
});

test("11. Ejecución del comando knowledge via CLI: onboard y rechazo de operaciones no soportadas", async () => {
  const dir = await makeTempDir();
  await runCli(["install", "--yes", "--name", "cli-test", "--cwd", dir]);

  // Sin subcomando
  const noSubRes = await runCli(["knowledge", "--cwd", dir]);
  assert.equal(noSubRes.code, 1);
  assert.match(noSubRes.stderr, /Uso: ai-methodology knowledge onboard/);

  // Subcomandos eliminados (ask, add, import, summary) deben ser rechazados sin placeholders
  for (const cmd of ["ask", "add", "import", "summary", "unknown"]) {
    const res = await runCli(["knowledge", cmd, "--cwd", dir]);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Sub‑comando desconocido/);
    assert.match(res.stderr, /Operaciones disponibles: onboard/);
  }
});
