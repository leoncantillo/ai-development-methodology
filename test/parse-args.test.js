import assert from "node:assert/strict";
import { test } from "node:test";
import { parseArgs } from "../src/cli/parse-args.js";

test("parsea comando, flags booleanos y --cwd", () => {
  const parsed = parseArgs(["install", "--yes", "--cwd", "/tmp/demo"]);
  assert.equal(parsed.command, "install");
  assert.equal(parsed.flags.yes, true);
  assert.equal(parsed.flags.cwd, "/tmp/demo");
});

test("parsea --set clave valor", () => {
  const parsed = parseArgs(["config", "--set", "knowledge.graph.enabled", "true"]);
  assert.equal(parsed.command, "config");
  assert.equal(parsed.flags.set, "knowledge.graph.enabled");
  assert.equal(parsed.flags.value, "true");
});
