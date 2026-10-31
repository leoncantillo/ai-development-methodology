import path from "node:path";
import { loadConfig } from "../config/io.js";
import { resolveProjectDir } from "../core/project.js";
import { CliError } from "../core/errors.js";

/**
 * Simple dispatcher for the `knowledge` command.
 * Sub‑commands:
 *   ask <query>      – placeholder that would query the knowledge graph.
 *   add <title>      – placeholder that would start an interactive add flow.
 *   import <path>    – placeholder for importing an existing knowledge repo.
 *   summary          – placeholder that would summarise the main concepts.
 */
export async function knowledgeCommand({ cwd, flags, args }) {
  const projectDir = await resolveProjectDir(cwd);
  const config = await loadConfig(projectDir);

  const sub = args[0];
  if (!sub) {
    throw new CliError("Uso: ai-methodology knowledge <subcommand> [options]");
  }

  switch (sub) {
    case "ask": {
      const query = args.slice(1).join(" ");
      if (!query) {
        throw new CliError("`knowledge ask` requiere una consulta.");
      }
      console.log(`[knowledge] Consulta recibida: "${query}"`);
      console.log("(Implementación futura: buscar en Graphify y responder)");
      break;
    }
    case "add": {
      const title = args.slice(1).join(" ");
      if (!title) {
        throw new CliError("`knowledge add` requiere un título para el nuevo elemento.");
      }
      console.log(`[knowledge] Añadiendo nuevo elemento: "${title}"`);
      console.log("(Implementación futura: solicitar descripción, etiquetas y guardar en Graphify)");
      break;
    }
    case "import": {
      const repoPath = args[1];
      if (!repoPath) {
        throw new CliError("`knowledge import` requiere la ruta al repositorio de conocimiento.");
      }
      console.log(`[knowledge] Importando conocimiento desde: ${repoPath}`);
      console.log("(Implementación futura: leer archivos YAML/JSON y crear nodos en Graphify)");
      break;
    }
    case "summary": {
      console.log("[knowledge] Resumen del conocimiento del proyecto:");
      console.log("(Implementación futura: recorrer el grafo y presentar los conceptos principales)");
      break;
    }
    default:
      throw new CliError(`Sub‑comando desconocido: ${sub}. Los soportados son: ask, add, import, summary`);
  }

  // No exit code means success.
  return 0;
}
