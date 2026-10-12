---
type: methodology-planning
status: verified
tags:
  - methodology
  - user-stories
  - planning
  - current-task
---
# Organización de historias de usuario y tareas de ejecución

**Propósito:** Definir el origen de los requerimientos desde las épicas, la formulación de historias de usuario y su articulación con el documento de ejecución operativa indicado en `workflow.current_task.path`.

Las rutas de `planning.epics.path` y `planning.roadmap.path` son relativas a `knowledge.source.path` en `ai-methodology.config.json`. Esta versión usa `planning.unit: "epic"`; otras fuentes podrán incorporarse más adelante.

---

## 1. Jerarquía estratégica del repositorio

En la base de conocimiento del proyecto, la planificación de alcance se mantiene deliberadamente compacta:

$$\text{Release (ej. MVP)} \longrightarrow \text{Epic (Capacidades y Checklist de Ejecución)}$$

* **Release:** Agrupación mayor que define hitos y entregas (por ejemplo el archivo de roadmap configurado).
* **Epic:** Documentos persistentes por dominio que contienen:
  * Propósito y límites de alcance.
  * **Checklist de ejecución** clasificado por prioridad (`P0 — Camino crítico`, `P1`, `P2`), donde cada ítem representa una capacidad o requerimiento funcional discreto.
  * Notas de arquitectura y dependencias.

> [!NOTE]
> Las épicas son fuentes de verdad de alcance en modo de **solo lectura**. El Diseñador las consulta para determinar qué corresponde construir y **nunca las modifica** durante la planificación de tareas.

---

## 2. Origen y ciclo de vida de la Historia de Usuario

Para evitar burocracia documental y proliferación de archivos dispersos, **las historias de usuario no se almacenan como archivos independientes en el repositorio**.

### ¿De dónde se extrae?
El **Diseñador/Planificador** extrae la necesidad directamente del **Checklist de ejecución** de la épica priorizada según el roadmap.

### ¿Dónde vive la Historia de Usuario?
La Historia de Usuario se formula y reside **dentro del archivo de tarea actual**, constituyendo la sección funcional de la tarea antes de desglosar su diseño técnico:

$$\text{Épica (Checklist)} \xrightarrow{\quad\text{Diseñador}\quad} \texttt{current-task.md (Historia + Diseño)} \xrightarrow{\quad\text{Ejecutor}\quad} \text{Código y Pruebas}$$

Al redactar la tarea actual, el Diseñador expande el ítem del checklist de la épica en:
1. **Definición de Usuario:** *Como [rol], quiero [capacidad] para [beneficio o valor]*.
2. **Criterios de Aceptación:** Condiciones objetivas y verificables del comportamiento esperado (qué debe ocurrir, entradas, salidas y reglas de negocio).
3. **Diseño Técnico:** Archivos afectados, contratos, pruebas a implementar y lineamientos arquitectónicos.

---

## 3. Descomposición técnica

Si una capacidad o ítem de la épica resulta demasiado amplio o involucra múltiples capas (ej. migración de BD, servicios de dominio, controladores y eventos):
* El Diseñador lo descompone en tareas técnicas secuenciales discretas en el archivo de tarea actual.
* Cada tarea debe dejar el proyecto en un estado coherente, ejecutable y probado antes de dar paso a la siguiente.
* Para el flujo de coordinación detallado entre ambos roles, consultar [[development-workflow]].
