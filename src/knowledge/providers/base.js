/**
 * Clase base para proveedores de almacenamiento de conocimiento.
 */
export class BaseKnowledgeProvider {
  /**
   * Guarda el modelo conceptual de conocimiento en el almacenamiento del proveedor.
   * @param {string} projectDir - Directorio raíz del proyecto.
   * @param {object} config - Configuración del proyecto (ai-methodology.config.json).
   * @param {object} knowledgeModel - Modelo conceptual ProjectKnowledge.
   * @returns {Promise<object>} Resultado de la persistencia.
   */
  async save(projectDir, config, knowledgeModel) {
    throw new Error("El método save debe ser implementado por el proveedor.");
  }

  /**
   * Carga el conocimiento existente desde el almacenamiento del proveedor.
   * @param {string} projectDir - Directorio raíz del proyecto.
   * @param {object} config - Configuración del proyecto.
   * @returns {Promise<object|null>} Modelo de conocimiento o null si no existe.
   */
  async load(projectDir, config) {
    throw new Error("El método load debe ser implementado por el proveedor.");
  }
}
