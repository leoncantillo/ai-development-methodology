---
type: methodology-standards
status: verified
tags:
  - methodology
  - standards
  - architecture
  - git
  - quality
---
# Estándares de arquitectura, Git, datos y calidad

**Propósito:** establecer principios y estándares técnicos transversales que puedan aplicarse a distintos proyectos sin imponer una arquitectura, tecnología o estructura específica.

Para conocer cómo estos estándares se aplican en la ejecución diaria de tareas, consultar [[development-workflow]].

## Arquitectura y diseño

* Aplicar principios de **Clean Architecture**, **SOLID** y conceptos de **DDD** cuando aporten valor al contexto y complejidad del proyecto.
* Mantener **alta cohesión** y **bajo acoplamiento**.
* Separar las reglas de negocio de los mecanismos de entrada, persistencia, comunicación y otros detalles de infraestructura.
* Evitar introducir capas, patrones, abstracciones o componentes que no aporten un beneficio justificado para el problema que se está resolviendo.
* La estructura de módulos y capas debe definirse según las necesidades del proyecto y las decisiones arquitectónicas tomadas durante su análisis.
* La lógica de negocio no debe quedar innecesariamente acoplada a frameworks, protocolos, bases de datos u otros detalles de infraestructura.

## Principios de simplicidad y calidad

* Aplicar **DRY (Don't Repeat Yourself)** para evitar duplicación innecesaria de lógica o conocimiento.
* Aplicar **KISS (Keep It Simple)**, favoreciendo soluciones simples cuando resuelvan correctamente el problema.
* Aplicar **YAGNI (You Aren't Gonna Need It)**, evitando implementar funcionalidades o abstracciones basadas únicamente en necesidades futuras no confirmadas.
* Priorizar la legibilidad, mantenibilidad y testeabilidad.
* La reutilización debe buscarse cuando reduzca duplicación o facilite el mantenimiento, pero no debe convertirse en una razón para crear abstracciones prematuras.
* Las decisiones de diseño deben equilibrar calidad, simplicidad y necesidades reales del proyecto, evitando la sobreingeniería.

## Control de versiones y colaboración

* No realizar desarrollo directamente sobre la rama principal estable del proyecto.
* Utilizar ramas de trabajo con una convención definida por el proyecto. Cuando sea apropiado, pueden utilizarse prefijos como:
  * `feature/`
  * `fix/`
  * `refactor/`
  * `docs/`
  * `chore/`
  * `test/`
* Integrar los cambios mediante **Pull Requests**, siguiendo las reglas de revisión establecidas por el proyecto.
* Utilizar **Conventional Commits** cuando el proyecto adopte esta convención.
* Mantener los commits enfocados y con una responsabilidad clara, evitando mezclar cambios no relacionados.
* Las modificaciones de documentación y las modificaciones de código deben mantenerse separadas cuando esto facilite su revisión, trazabilidad o reversión.

## Datos y migraciones

* Las modificaciones de estructura de datos deben realizarse mediante el mecanismo de migraciones definido por el proyecto.
* Cada migración debe tener una responsabilidad clara y un nombre descriptivo.
* Las modificaciones de datos deben considerar compatibilidad, integridad y posibles efectos sobre las funcionalidades existentes.
* No asumir una tecnología concreta de base de datos o herramienta de migración desde esta metodología; dichas decisiones pertenecen al contexto del proyecto.

## APIs y comunicación externa

* Los mecanismos de comunicación externos deben mantenerse separados de las reglas de negocio cuando la arquitectura del proyecto lo requiera.
* La elección entre REST, GraphQL, RPC, mensajería u otros mecanismos debe responder a los requisitos y contexto del proyecto.
* No implementar ni preparar anticipadamente una tecnología de comunicación únicamente por una posible necesidad futura.
* Los contratos externos deben diseñarse de forma que los cambios en el mecanismo de comunicación no obliguen innecesariamente a modificar el núcleo de la lógica de negocio.

## Convenciones del proyecto

* El idioma utilizado en código, documentación, nombres técnicos y contenido visible debe definirse como parte de las convenciones del proyecto.
* Las convenciones deben mantenerse consistentes dentro del proyecto.
* Las decisiones específicas de un proyecto no deben convertirse automáticamente en estándares metodológicos para proyectos futuros.

## Criterio rector

Antes de implementar una capacidad o introducir una decisión técnica, el agente debe evaluar su alineación con los requisitos, la arquitectura y los estándares aplicables al proyecto.

Los estándares de esta página deben utilizarse como **principios de orientación y criterios de calidad**, no como una plantilla rígida que obligue a todos los proyectos a utilizar las mismas tecnologías, capas, patrones o estructuras.

Para la descomposición de requerimientos e historias de usuario respetando estos estándares, consultar [[planning-user-stories]].

