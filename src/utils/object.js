export function getByPath(object, dottedPath) {
  return dottedPath.split(".").reduce((current, key) => {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    return current[key];
  }, object);
}

export function setByPath(object, dottedPath, value) {
  const keys = dottedPath.split(".");
  const clone = structuredClone(object);
  let current = clone;
  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    if (current[key] == null || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return clone;
}

export function coerceValue(raw) {
  if (raw === "true") {
    return true;
  }
  if (raw === "false") {
    return false;
  }
  if (raw === "null") {
    return null;
  }
  if (raw !== "" && Number.isFinite(Number(raw)) && String(Number(raw)) === raw) {
    return Number(raw);
  }
  return raw;
}

export function deepMerge(base, overlay) {
  if (overlay == null || typeof overlay !== "object" || Array.isArray(overlay)) {
    return overlay;
  }
  const result = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (
      value != null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      result[key] != null &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
