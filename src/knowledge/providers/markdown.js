import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { BaseKnowledgeProvider } from "./base.js";
import { resolveFromProject } from "../../core/project.js";
import { isFile } from "../../utils/fs.js";
import { CERTAINTY, PROVENANCE } from "../model/types.js";

function certaintyBadge(certainty) {
  switch (certainty) {
    case CERTAINTY.CONFIRMED:
      return "[Confirmado]";
    case CERTAINTY.HYPOTHESIS:
      return "[Hipótesis]";
    case CERTAINTY.UNDECIDED:
      return "[Pendiente de definición]";
    case CERTAINTY.UNKNOWN:
      return "[Desconocido / Sin información]";
    case CERTAINTY.SKIPPED:
      return "[Omitido]";
    default:
      return "";
  }
}

function provenanceLabel(prov) {
  switch (prov) {
    case PROVENANCE.USER:
      return "Usuario";
    case PROVENANCE.IMPORTED:
      return "Importado";
    case PROVENANCE.AGENT:
      return "Agente";
    default:
      return "Desconocido";
  }
}

export class MarkdownKnowledgeProvider extends BaseKnowledgeProvider {
  /**
   * Retorna la ruta absoluta del directorio de conocimiento.
   */
  getKnowledgeDir(projectDir, config) {
    const sourcePath = config?.knowledge?.source?.path || "docs/knowledge";
    return resolveFromProject(projectDir, sourcePath);
  }

  /**
   * Guarda el modelo conceptual en documentos Markdown.
   */
  async save(projectDir, config, knowledge) {
    const knowledgeDir = this.getKnowledgeDir(projectDir, config);
    await mkdir(knowledgeDir, { recursive: true });

    const writtenFiles = [];

    // 1. Overview / README
    const overviewContent = this.renderOverview(knowledge);
    const overviewPath = path.join(knowledgeDir, "overview.md");
    await writeFile(overviewPath, overviewContent, "utf8");
    writtenFiles.push(overviewPath);

    // 2. Identity & Context
    const idContent = this.renderIdentityAndContext(knowledge);
    const idPath = path.join(knowledgeDir, "identity-context.md");
    await writeFile(idPath, idContent, "utf8");
    writtenFiles.push(idPath);

    // 3. Domain
    const domainContent = this.renderDomain(knowledge);
    const domainPath = path.join(knowledgeDir, "domain.md");
    await writeFile(domainPath, domainContent, "utf8");
    writtenFiles.push(domainPath);

    // 4. Architecture & Technology
    const archContent = this.renderArchitecture(knowledge);
    const archPath = path.join(knowledgeDir, "architecture.md");
    await writeFile(archPath, archContent, "utf8");
    writtenFiles.push(archPath);

    // 5. Conventions & Constraints
    const convContent = this.renderConventionsAndConstraints(knowledge);
    const convPath = path.join(knowledgeDir, "conventions-constraints.md");
    await writeFile(convPath, convContent, "utf8");
    writtenFiles.push(convPath);

    // 6. Current State & Objectives
    const stateContent = this.renderStateAndObjectives(knowledge);
    const statePath = path.join(knowledgeDir, "state-objectives.md");
    await writeFile(statePath, stateContent, "utf8");
    writtenFiles.push(statePath);

    // 7. Sincronización opcional del Roadmap con los objetivos
    const syncedRoadmap = await this.syncRoadmap(projectDir, config, knowledge);
    if (syncedRoadmap) {
      writtenFiles.push(syncedRoadmap);
    }

    return {
      provider: "markdown",
      knowledgeDir,
      files: writtenFiles,
    };
  }

  async syncRoadmap(projectDir, config, knowledge) {
    const knowledgeDir = this.getKnowledgeDir(projectDir, config);
    const roadmapRelative = config?.planning?.roadmap?.path || "planning/roadmap.md";
    const roadmapPath = path.join(knowledgeDir, roadmapRelative);

    const goals = knowledge.objectives?.goals?.map((g) => g.value).filter(Boolean) || [];
    const milestones = knowledge.objectives?.nextMilestones?.map((m) => m.value).filter(Boolean) || [];

    if (goals.length === 0 && milestones.length === 0) {
      return null;
    }

    await mkdir(path.dirname(roadmapPath), { recursive: true });

    let existingContent = "";
    if (await isFile(roadmapPath)) {
      existingContent = await readFile(roadmapPath, "utf8");
    }

    const isDraft = !existingContent || existingContent.includes("status: draft") || existingContent.includes("En definición / Desarrollo inicial.");
    if (isDraft) {
      const immediateGoal = goals.length > 0 ? goals.join("; ") : "Establecer la arquitectura base y capacidades esenciales del proyecto.";
      const nextMilestonesText = milestones.length > 0
        ? milestones.map((m) => `  - ${m}`).join("\n")
        : "  - Por definir según necesidades de negocio y dominio.";

      const updatedRoadmap = `---
type: planning-roadmap
status: draft
updatedAt: ${new Date().toISOString().split("T")[0]}
tags:
  - planning
  - roadmap
  - releases
---

# Roadmap del Proyecto

**Propósito:** Definir los hitos estratégicos, las agrupaciones de releases y las prioridades de entrega del proyecto. El Diseñador (\`plan-task\`) y el Project Knowledge Agent (\`pka\`) consultan este documento para guiar la priorización de las épicas y tareas técnicas.

> [!NOTE]
> Las épicas (\`planning.epics.path\`) desglosan las capacidades técnicas necesarias para cada hito. Las historias de usuario operativas no se almacenan como archivos dispersos, sino que se gestionan dentro del documento de tarea actual (\`workflow.current_task.path\`).

---

## Horizonte de Entregas e Hitos

### Hito 1: Fundación y MVP (En curso)
- **Objetivo:** ${immediateGoal}
- **Estado:** En definición / Desarrollo inicial.
- **Épicas asociadas:**
  - \`EPIC-01\`: Fundación técnica y configuración inicial.
  - \`EPIC-02\`: Capacidades mínimas viables (MVP).
- **Criterio de éxito:** Sistema mínimo funcional verificado y ejecutable.

### Hito 2: Funcionalidades Core (Planificado)
- **Objetivo:** Implementar las funcionalidades principales y siguientes hitos acordados.
- **Estado:** Planificado.
- **Épicas proyectadas:**
${nextMilestonesText}

### Hito 3: Escalabilidad, Integraciones y Pulido (Futuro)
- **Objetivo:** Robustez, integraciones externas, optimizaciones y preparación para despliegue.
- **Estado:** Futuro.

---

## Guía de Mantenimiento para el PKA y el Desarrollador
- **Actualización Continua:** El **PKA** (\`pka\`) o el desarrollador actualizan este archivo cuando se alcanzan hitos, se incorporan nuevos requerimientos estratégicos o se reordenan prioridades.
- **Sincronización:** Mantener coherencia con \`state-objectives.md\` en la base de conocimiento y con los documentos de épica en \`planning.epics.path\`.
`;
      await writeFile(roadmapPath, updatedRoadmap, "utf8");
      return roadmapPath;
    }

    return null;
  }

  renderOverview(k) {
    return `---
type: project-knowledge-overview
updatedAt: ${k.metadata?.updatedAt || new Date().toISOString()}
---

# Base de Conocimiento del Proyecto: ${k.identity?.name?.value || "Sin nombre"}

Este directorio contiene el conocimiento inicial recopilado durante el proceso de onboarding.
Los documentos sirven como contexto fundamental para el Project Knowledge Agent (PKA), el Designer y el Executor.

## Contenido

- [[identity-context]]: Propósito, problema que resuelve y usuarios objetivo.
- [[domain]]: Conceptos clave y reglas de negocio del dominio.
- [[architecture]]: Estilo arquitectónico, componentes, lenguajes y herramientas.
- [[conventions-constraints]]: Estándares de desarrollo y limitaciones del proyecto.
- [[state-objectives]]: Estado actual de desarrollo, funcionalidades e hitos próximos.
`;
  }

  renderIdentityAndContext(k) {
    return `---
type: project-knowledge-identity
---

# Identidad y Contexto

## Identidad
- **Nombre:** ${k.identity?.name?.value || "N/A"} ${certaintyBadge(k.identity?.name?.certainty)}
- **Propósito:** ${k.identity?.purpose?.value || "N/A"} ${certaintyBadge(k.identity?.purpose?.certainty)}
- **Descripción:** ${k.identity?.description?.value || "N/A"} ${certaintyBadge(k.identity?.description?.certainty)}

## Contexto
- **Problema que resuelve:** ${k.context?.problem?.value || "N/A"} ${certaintyBadge(k.context?.problem?.certainty)}
- **Usuarios objetivo:** ${k.context?.targetUsers?.value || "N/A"} ${certaintyBadge(k.context?.targetUsers?.certainty)}
`;
  }

  renderDomain(k) {
    let conceptsList = "Ninguno registrado aún.";
    if (k.domain?.concepts?.length > 0) {
      conceptsList = k.domain.concepts
        .map((c) => `- ${c.value} ${certaintyBadge(c.certainty)} (Origen: ${provenanceLabel(c.provenance)})`)
        .join("\n");
    }

    let rulesList = "Ninguna registrada aún.";
    if (k.domain?.businessRules?.length > 0) {
      rulesList = k.domain.businessRules
        .map((r) => `- ${r.value} ${certaintyBadge(r.certainty)} (Origen: ${provenanceLabel(r.provenance)})`)
        .join("\n");
    }

    return `---
type: project-knowledge-domain
---

# Dominio y Reglas de Negocio

## Conceptos Clave
${conceptsList}

## Reglas de Negocio
${rulesList}
`;
  }

  renderArchitecture(k) {
    let componentsList = "No especificados.";
    if (k.architecture?.components?.length > 0) {
      componentsList = k.architecture.components
        .map((c) => `- ${c.value} ${certaintyBadge(c.certainty)}`)
        .join("\n");
    }

    const langs = k.technology?.languages?.map((l) => l.value).join(", ") || "No especificado";
    const frameworks = k.technology?.frameworks?.map((f) => f.value).join(", ") || "No especificado";
    const tools = k.technology?.tools?.map((t) => t.value).join(", ") || "No especificado";

    return `---
type: project-knowledge-architecture
---

# Arquitectura y Tecnologías

## Estilo Arquitectónico
- **Enfoque:** ${k.architecture?.overview?.value || "No especificado"} ${certaintyBadge(k.architecture?.overview?.certainty)}

## Componentes Principales
${componentsList}

## Tecnologías
- **Lenguajes:** ${langs}
- **Frameworks:** ${frameworks}
- **Herramientas:** ${tools}
`;
  }

  renderConventionsAndConstraints(k) {
    let standardsList = "No especificados.";
    if (k.conventions?.standards?.length > 0) {
      standardsList = k.conventions.standards.map((s) => `- ${s.value} ${certaintyBadge(s.certainty)}`).join("\n");
    }

    let constraintsList = "No especificadas.";
    if (k.constraints?.limitations?.length > 0) {
      constraintsList = k.constraints.limitations
        .map((c) => `- ${c.value} ${certaintyBadge(c.certainty)}`)
        .join("\n");
    }

    return `---
type: project-knowledge-conventions
---

# Convenciones y Restricciones

## Estándares y Prácticas
${standardsList}

## Restricciones y Limitaciones
${constraintsList}
`;
  }

  renderStateAndObjectives(k) {
    let featuresList = "Ninguna registrada.";
    if (k.currentState?.implementedFeatures?.length > 0) {
      featuresList = k.currentState.implementedFeatures
        .map((f) => `- ${f.value} ${certaintyBadge(f.certainty)}`)
        .join("\n");
    }

    let goalsList = "No especificados.";
    if (k.objectives?.goals?.length > 0) {
      goalsList = k.objectives.goals.map((g) => `- ${g.value} ${certaintyBadge(g.certainty)}`).join("\n");
    }

    let milestonesList = "No especificados.";
    if (k.objectives?.nextMilestones?.length > 0) {
      milestonesList = k.objectives.nextMilestones.map((m) => `- ${m.value} ${certaintyBadge(m.certainty)}`).join("\n");
    }

    return `---
type: project-knowledge-state-objectives
---

# Estado Actual y Objetivos

## Estado Actual
- **Fase:** ${k.currentState?.status?.value || "No especificada"} ${certaintyBadge(k.currentState?.status?.certainty)}
- **Funcionalidades implementadas:**
${featuresList}

## Objetivos
- **Meta inmediata:**
${goalsList}
- **Próximos hitos:**
${milestonesList}
`;
  }

  async load(projectDir, config) {
    const overviewPath = path.join(this.getKnowledgeDir(projectDir, config), "overview.md");
    if (!(await isFile(overviewPath))) {
      return null;
    }
    const content = await readFile(overviewPath, "utf8");
    return { overview: content };
  }
}
