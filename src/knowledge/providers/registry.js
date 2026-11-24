import { MarkdownKnowledgeProvider } from "./markdown.js";

/**
 * Retorna la instancia del proveedor de conocimiento según la configuración.
 */
export function getKnowledgeProvider(config) {
  // Inicialmente el almacenamiento base es local Markdown.
  // Si en el futuro se agregan otros tipos de source o providers de persistencia,
  // se instancian aquí.
  return new MarkdownKnowledgeProvider();
}
