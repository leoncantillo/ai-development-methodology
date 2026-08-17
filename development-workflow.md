# Flujo de trabajo para implementación de tareas

**Fuente:** Flujo de Trabajo para Implementación de Tareas
**ID Notion:** `3b0d6ab9-f4dd-816d-ae4d-cf59fdd9ed02`

## Objetivo y principios

Toda tarea debe comprenderse y analizarse antes de modificar archivos.

El agente debe conocer el objetivo de la tarea, el contexto relevante del proyecto, las restricciones existentes y los posibles impactos antes de implementar cambios.

El trabajo debe mantenerse dentro del alcance definido. Las mejoras, refactorizaciones o problemas adicionales detectados durante el análisis deben registrarse y proponerse como tareas independientes, salvo que sean necesarias para completar correctamente la tarea actual.

El resultado debe dejar el proyecto en un estado funcional y verificable, sin introducir regresiones conocidas ni dejar cambios deliberadamente incompletos.

## Flujo obligatorio

### 1. Comprensión

Antes de implementar, el agente debe:

* Leer la documentación relevante.
* Revisar la arquitectura y estructura del proyecto cuando sean necesarias para comprender la tarea.
* Identificar los módulos, componentes, dependencias y funcionalidades relacionadas.
* Comprender el objetivo funcional y las restricciones conocidas.
* Identificar decisiones previas que puedan afectar la implementación.
* Detectar información faltante, contradicciones o ambigüedades relevantes.

El agente debe comunicar un plan breve de implementación cuando la tarea tenga suficiente complejidad como para beneficiarse de él.

El plan no constituye por sí mismo una solicitud de aprobación. La necesidad de consultar al usuario se determina según las reglas de autonomía y toma de decisiones establecidas por la metodología.

### 2. Diseño

Antes de modificar el código, el agente debe determinar:

* Qué componentes necesitan modificarse o crearse.
* Qué dependencias existen entre los cambios.
* Qué interfaces, contratos, datos, persistencia, integraciones o mecanismos de comunicación se ven afectados, cuando corresponda.
* Qué validaciones y pruebas son necesarias.
* Qué riesgos o efectos secundarios pueden producirse.
* Qué decisiones arquitectónicas o de diseño son necesarias.

La estructura concreta de la solución debe adaptarse al proyecto. No deben asumirse capas, patrones, tecnologías o componentes que no sean necesarios para la tarea.

Cuando exista una contradicción importante en requisitos, arquitectura o decisiones previamente establecidas, el agente debe detener la implementación de esa parte y reportar el conflicto antes de asumir una decisión que pueda afectar el diseño del sistema.

Cuando exista información faltante que no sea crítica y pueda resolverse mediante una hipótesis razonable, el agente puede continuar dejando dicha hipótesis explícita.

### 3. Implementación

Durante la implementación, el agente debe:

* Respetar la arquitectura y las convenciones aplicables al proyecto.
* Mantener separación de responsabilidades.
* Aplicar los principios de diseño relevantes para el contexto.
* Evitar duplicación innecesaria.
* Evitar introducir complejidad o abstracciones que no aporten valor.
* Mantener la lógica de negocio separada de los mecanismos externos cuando la arquitectura del proyecto lo requiera.
* Reutilizar componentes existentes cuando hacerlo sea apropiado.
* Evitar modificaciones fuera del alcance de la tarea.

### 4. Estado ejecutable

Durante y al finalizar la implementación, el agente debe evitar dejar deliberadamente:

* Código que no compile.
* Dependencias rotas.
* Imports o referencias inválidas.
* Componentes inexistentes utilizados por el código.
* Flujos incompletos.
* Cambios parciales que impidan el funcionamiento del proyecto.

Cuando una implementación deba realizarse en varias etapas, cada etapa debe mantenerse en un estado coherente siempre que sea técnicamente posible.

### 5. Verificación

Después de implementar, el agente debe realizar las validaciones relevantes para la tarea, que pueden incluir:

* Compilación.
* Pruebas unitarias.
* Pruebas de integración.
* Pruebas funcionales.
* Análisis estático.
* Revisión de errores y warnings relevantes.
* Verificación de regresiones.
* Validación del comportamiento esperado.

Las validaciones deben ser proporcionales al cambio realizado.

Si una validación falla, el agente debe determinar si el fallo fue provocado por el cambio actual o si ya existía previamente.

Los fallos introducidos por la tarea deben corregirse antes de considerarla terminada.

Los fallos preexistentes deben documentarse y no deben corregirse automáticamente si hacerlo implica ampliar el alcance de la tarea.

### 6. Documentación

La documentación debe actualizarse cuando el cambio modifique información que deba mantenerse documentada.

Esto puede incluir, según el proyecto:

* Documentación técnica.
* Especificaciones.
* Diagramas.
* ADR.
* Contratos de API.
* Decisiones arquitectónicas.
* Instrucciones de operación.
* Documentación de componentes o funcionalidades.

No es obligatorio modificar documentación cuando la tarea no cambia información que deba documentarse.

### 7. Git

Los cambios deben gestionarse de acuerdo con las convenciones de control de versiones del proyecto.

Cuando dichas convenciones establezcan trabajo mediante ramas:

* No desarrollar directamente sobre la rama principal estable.
* Utilizar el tipo de rama correspondiente a la naturaleza del cambio.
* Mantener los commits enfocados y con una responsabilidad clara.
* Utilizar Conventional Commits cuando el proyecto adopte dicha convención.
* Integrar cambios mediante Pull Request.
* No realizar merges directos a la rama principal cuando las reglas del proyecto los prohíban.

Cuando corresponda, la tarea debe finalizar con cambios organizados en commits coherentes y revisables.

## Definition of Done

Una tarea puede considerarse terminada cuando:

* El objetivo funcional definido fue implementado.
* Los cambios se mantienen dentro del alcance acordado.
* El proyecto permanece en un estado coherente y ejecutable.
* Las validaciones relevantes fueron ejecutadas.
* Los fallos introducidos por la tarea fueron corregidos.
* No existen regresiones conocidas provocadas por el cambio.
* Se respetan las decisiones arquitectónicas y convenciones aplicables.
* La documentación relevante fue actualizada cuando correspondía.
* Los cambios están organizados de acuerdo con las convenciones de Git del proyecto.
* La solución queda en un estado estable y potencialmente desplegable cuando la naturaleza de la tarea lo permita.

## Tamaño y descomposición de tareas

Las tareas deben ser suficientemente pequeñas para poder analizarse, implementarse y verificarse de manera controlada.

Cuando una tarea:

* abarque demasiadas responsabilidades;
* afecte demasiados componentes sin una relación clara;
* requiera varias decisiones independientes;
* no pueda verificarse de forma razonable;
* o necesite romper temporalmente el estado funcional del proyecto;

el agente debe proponer una descomposición en subtareas.

La descomposición debe conservar la coherencia del trabajo y minimizar estados intermedios inválidos.

Cuando la descomposición requiera cambiar el alcance, alterar requisitos o tomar decisiones arquitectónicas no previstas, el agente debe consultar antes de continuar.

## Principio rector

**Comprender antes de modificar, diseñar antes de implementar y verificar antes de considerar una tarea terminada.**

La metodología busca que los agentes trabajen de forma autónoma dentro de límites claros, manteniendo el control humano sobre las decisiones que puedan cambiar significativamente los requisitos, la arquitectura, el alcance o las reglas del proyecto.
