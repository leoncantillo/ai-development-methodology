---
type: planning-roadmap
status: draft
updatedAt: 2026-11-24
tags:
  - planning
  - roadmap
  - releases
---

# Roadmap del Proyecto

**Propósito:** Definir los hitos estratégicos, las agrupaciones de releases y las prioridades de entrega del proyecto. El Diseñador (`plan-task`) y el Project Knowledge Agent (`pka`) consultan este documento para guiar la priorización de las épicas y tareas técnicas.

> [!NOTE]
> Las épicas (`planning.epics.path`) desglosan las capacidades técnicas necesarias para cada hito. Las historias de usuario operativas no se almacenan como archivos dispersos, sino que se gestionan dentro del documento de tarea actual (`workflow.current_task.path`).

---

## Horizonte de Entregas e Hitos

### Hito 1: Fundación y MVP (En curso)
- **Objetivo:** Establecer la arquitectura base, configuración del entorno y capacidades esenciales del proyecto.
- **Estado:** En definición / Desarrollo inicial.
- **Épicas asociadas:**
  - `EPIC-01`: Fundación técnica y configuración inicial.
  - `EPIC-02`: Capacidades mínimas viables (MVP).
- **Criterio de éxito:** Sistema mínimo funcional verificado y ejecutable.

### Hito 2: Funcionalidades Core (Planificado)
- **Objetivo:** Implementar las reglas de negocio y flujos principales de usuario.
- **Estado:** Pendiente.
- **Épicas proyectadas:**
  - Por definir según necesidades de negocio y dominio.

### Hito 3: Escalabilidad, Integraciones y Pulido (Futuro)
- **Objetivo:** Robustez, integraciones externas, optimizaciones y preparación para despliegue.
- **Estado:** Futuro.

---

## Guía de Mantenimiento para el PKA y el Desarrollador
- **Actualización Continua:** El **PKA** (`pka`) o el desarrollador actualizan este archivo cuando se alcanzan hitos, se incorporan nuevos requerimientos estratégicos o se reordenan prioridades.
- **Sincronización:** Mantener coherencia con `state-objectives.md` en la base de conocimiento y con los documentos de épica en `planning.epics.path`.
