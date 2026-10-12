#!/usr/bin/env node

import { main } from "../src/index.js";

main(process.argv.slice(2))
  .then((code) => {
    process.exit(code ?? 0);
  })
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(2);
  });
