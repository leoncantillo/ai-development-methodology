import { SCHEMA_VERSION, SETTABLE_PATHS } from "../core/constants.js";
import { CliError } from "../core/errors.js";
import { getByPath } from "../utils/object.js";

function expect(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

export function validateConfig(config) {
  const errors = [];

  if (config == null || typeof config !== "object" || Array.isArray(config)) {
    return { valid: false, errors: ["La configuración debe ser un objeto JSON."] };
  }

  expect(config.version === SCHEMA_VERSION, `version debe ser ${SCHEMA_VERSION}.`, errors);
  expect(config.project && typeof config.project === "object", "project es obligatorio.", errors);
  expect(isNonEmptyString(config.project?.name), "project.name es obligatorio.", errors);

  expect(config.knowledge && typeof config.knowledge === "object", "knowledge es obligatorio.", errors);
  expect(
    config.knowledge?.source && typeof config.knowledge.source === "object",
    "knowledge.source es obligatorio.",
    errors
  );
  expect(
    config.knowledge?.source?.type === "local",
    "knowledge.source.type debe ser \"local\" en esta versión.",
    errors
  );
  expect(
    isNonEmptyString(config.knowledge?.source?.path),
    "knowledge.source.path es obligatorio.",
    errors
  );

  expect(
    config.knowledge?.graph && typeof config.knowledge.graph === "object",
    "knowledge.graph es obligatorio.",
    errors
  );
  expect(
    config.knowledge?.graph?.provider === "graphify",
    "knowledge.graph.provider debe ser \"graphify\".",
    errors
  );
  expect(
    typeof config.knowledge?.graph?.enabled === "boolean",
    "knowledge.graph.enabled debe ser booleano.",
    errors
  );

  expect(config.planning && typeof config.planning === "object", "planning es obligatorio.", errors);
  expect(isNonEmptyString(config.planning?.unit), "planning.unit es obligatorio.", errors);
  expect(isNonEmptyString(config.planning?.epics?.path), "planning.epics.path es obligatorio.", errors);
  expect(isNonEmptyString(config.planning?.roadmap?.path), "planning.roadmap.path es obligatorio.", errors);

  expect(config.workflow && typeof config.workflow === "object", "workflow es obligatorio.", errors);
  expect(
    isNonEmptyString(config.workflow?.current_task?.path),
    "workflow.current_task.path es obligatorio.",
    errors
  );

  if (config.paths != null) {
    expect(typeof config.paths === "object", "paths debe ser un objeto.", errors);
    if (config.paths?.agents != null) {
      expect(isNonEmptyString(config.paths.agents), "paths.agents debe ser una ruta no vacía.", errors);
    }
    if (config.paths?.methodology != null) {
      expect(
        isNonEmptyString(config.paths.methodology),
        "paths.methodology debe ser una ruta no vacía.",
        errors
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidConfig(config) {
  const result = validateConfig(config);
  if (!result.valid) {
    throw new CliError(`Configuración inválida:\n- ${result.errors.join("\n- ")}`);
  }
  return config;
}

export function assertSettablePath(dottedPath) {
  if (!SETTABLE_PATHS.has(dottedPath)) {
    throw new CliError(
      `No se puede modificar "${dottedPath}". Campos permitidos:\n- ${[...SETTABLE_PATHS].join("\n- ")}`
    );
  }
}

export function getConfigValue(config, dottedPath) {
  return getByPath(config, dottedPath);
}
