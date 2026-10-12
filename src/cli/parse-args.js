const BOOLEAN_FLAGS = new Set([
  "help",
  "version",
  "yes",
  "show",
  "dry-run",
  "strict",
  "force",
  "overwrite-local",
]);

const ALIASES = {
  h: "help",
  v: "version",
  y: "yes",
};

export function parseArgs(argv) {
  const flags = {};
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--") {
      positionals.push(...argv.slice(index + 1));
      break;
    }

    if (token.startsWith("--")) {
      const [rawKey, inline] = token.slice(2).split("=");
      const key = rawKey;
      if (key === "set") {
        flags.set = inline ?? argv[++index];
        flags.value = argv[++index];
        continue;
      }
      if (inline !== undefined) {
        flags[key] = BOOLEAN_FLAGS.has(key) ? inline !== "false" : inline;
        continue;
      }
      if (BOOLEAN_FLAGS.has(key)) {
        flags[key] = true;
        continue;
      }
      flags[key] = argv[++index];
      continue;
    }

    if (token.startsWith("-") && token.length === 2) {
      const key = ALIASES[token.slice(1)];
      if (key) {
        flags[key] = true;
        continue;
      }
    }

    positionals.push(token);
  }

  return {
    command: positionals[0] ?? null,
    args: positionals.slice(1),
    flags,
  };
}
