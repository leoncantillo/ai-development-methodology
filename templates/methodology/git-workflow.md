---
type: methodology-git-workflow
status: verified
tags:
  - methodology
  - git
  - workflow
  - execution
---
# Flujo operativo de Git y control de versiones

**Propósito:** Definir los estándares, convenciones y procedimientos de control de versiones con Git que debe seguir el **Ejecutor** al trabajar en cualquier tarea.

Para conocer cómo este flujo se integra en el ciclo general entre el Diseñador y el Ejecutor, consultar [[development-workflow]].

---

## 1. Regla de rama principal (`main`)

* La rama `main` representa el estado estable, probado y listo para producción del proyecto.
* **Prohibición absoluta:** Nunca desarrollar, comitear ni hacer push directamente sobre `main`.
* Todo cambio debe originarse y completarse en una rama de trabajo dedicada.

---

## 2. Estrategia de ramas y nomenclatura

Toda tarea asignada en el archivo de tarea actual debe implementarse en su propia rama de trabajo, creada a partir del estado más reciente de `main`.

### Nomenclatura obligatoria

Las ramas deben utilizar formato en minúsculas con palabras separadas por guiones (`kebab-case`), precedidas por uno de los prefijos según la naturaleza del cambio:

* `feature/<descripcion>`: Nueva funcionalidad o capacidad.
* `fix/<descripcion>`: Corrección de un error o defecto reportado.
* `refactor/<descripcion>`: Reestructuración de código sin alterar comportamiento externo.
* `docs/<descripcion>`: Cambios exclusivamente en documentación.
* `chore/<descripcion>`: Tareas de mantenimiento, dependencias o configuración interna.
* `test/<descripcion>`: Incorporación o corrección exclusiva de pruebas.

*Ejemplo:* `feature/auth-refresh-token` o `refactor/user-service-layer`.

---

## 3. Commits convencionales y atómicos

### Conventional Commits

Los mensajes de commit deben seguir el estándar de **Conventional Commits**:

```text
<tipo>(<alcance_opcional>): <descripción imperativa en presente>
```

* **Tipos comunes:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `style`.
* **Idioma:** Las convenciones de mensaje deben respetar el estándar definido por el proyecto (inglés en repositorios técnicos por defecto, a menos que el proyecto especifique lo contrario).
* *Ejemplo:* `feat(auth): implement refresh token rotation` o `docs(methodology): add git workflow guide`.

### Atomicidad y enfoque

* Cada commit debe representar un cambio lógico único, coherente e indivisible.
* Evitar commits masivos que mezclen refactorizaciones, correcciones y nuevas funcionalidades no relacionadas.
* Los cambios en documentación y los cambios en código de producción deben mantenerse en commits separados cuando esto favorezca la trazabilidad y revisión.

---

## 4. Verificaciones previas al commit

Antes de crear un commit o finalizar la tarea, el Ejecutor debe verificar obligatoriamente:

1. **Estado ejecutable:** El código debe compilar limpiamente y no contener imports rotos ni referencias a componentes inexistentes.
2. **Pruebas:** Ejecutar las pruebas unitarias e integración relevantes y comprobar que todas pasen exitosamente.
3. **Limpieza:** No incluir archivos temporales, logs, artefactos de compilación (`.class`, `node_modules`, etc.) ni secretos o credenciales.

---

## 5. Integración y Pull Requests

* La integración de ramas hacia `main` se realiza exclusivamente mediante **Pull Requests (PR)**.
* Cada Pull Request debe incluir:
  * Título claro que resuma el objetivo.
  * Descripción concisa que explique qué se modificó y por qué (alineada con la tarea actual).
  * Checklist de validación ejecutada (pruebas que pasan, compilación exitosa).
* No realizar merges directos por consola sobre la rama `main` a menos que una política explícita de repositorio o pipeline lo autorice.
