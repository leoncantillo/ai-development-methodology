# ai-methodology

CLI para **instalar, configurar, validar y actualizar** una metodología de desarrollo de software con agentes de IA.

La herramienta administra los archivos de la metodología. Los agentes Diseñador y Ejecutor los utilizan para trabajar en cada proyecto. El proceso no está acoplado a un producto concreto.

## Requisitos

- Node.js 20 o superior
- Linux en la primera versión (la arquitectura evita dependencias innecesarias del sistema operativo)

## Instalación

```bash
npm install -g ai-methodology
ai-methodology --help
```

## Uso

Desde la raíz de un repositorio:

```bash
ai-methodology install
ai-methodology validate
ai-methodology config --show
ai-methodology update
```

`install` es idempotente: no duplica archivos ni sobrescribe en silencio personalizaciones locales.

## Qué instala en un proyecto

```text
proyecto/
├── .agents/
│   └── workflow/
│       ├── designer.md
│       └── executor.md
├── .ai-methodology/
│   └── manifest.json
├── docs/
│   └── ai-development-methodology/
│       ├── README.md
│       ├── development-workflow.md
│       ├── git-workflow.md
│       ├── planning-user-stories.md
│       └── project-foundation.md
├── ai-methodology.config.json
└── current-task.md
```

Las rutas de agentes y documentos pueden personalizarse. El manifiesto registra hashes para que `update` distinga archivos administrados de cambios locales.

## Configuración

Cada proyecto tiene un `ai-methodology.config.json`. Esquema de la primera versión:

```json
{
  "version": 1,
  "project": {
    "name": "mi_proyeto"
  },
  "knowledge": {
    "source": {
      "type": "local",
      "path": "../mi_proyeto-knowledge"
    },
    "graph": {
      "provider": "graphify",
      "enabled": true
    }
  },
  "planning": {
    "unit": "epic",
    "epics": {
      "path": "planning/epics"
    },
    "roadmap": {
      "path": "planning/roadmap.md"
    }
  },
  "workflow": {
    "current_task": {
      "path": "current-task.md"
    }
  }
}
```

`planning.epics.path` y `planning.roadmap.path` son relativas a `knowledge.source.path`.

Campos opcionales:

- `project.description`
- `paths.agents` (por defecto `.agents/workflow`)
- `paths.methodology` (por defecto `docs/ai-development-methodology`)

```bash
ai-methodology config --show
ai-methodology config --set knowledge.graph.enabled true
```

## Comandos

| Comando | Responsabilidad |
| --- | --- |
| `install` | Detecta el proyecto, pregunta lo necesario, escribe archivos y valida |
| `config` | Consulta o modifica la configuración con validación previa al guardado |
| `validate` | Comprueba config, agentes, documentos, rutas y Graphify si está habilitado |
| `update` | Actualiza archivos administrados sin destruir cambios locales |

Códigos de salida de `validate`: `0` válido (con o sin advertencias), `1` inválido. `--strict` trata advertencias como error.

Graphify no es obligatorio. Si `knowledge.graph.enabled` es `false`, su ausencia no es un error.

## Alcance de la primera versión

Incluido: instalación, configuración JSON, validación, actualización segura, plantillas Markdown, planificación por épicas, Graphify opcional.

Fuera de alcance: GUI, servidor, base de datos, ejecución automática de agentes, proveedor de IA concreto, Notion, plugins externos.

## Desarrollo

Si deseas contribuir al proyecto o probar cambios en el código fuente, clona el repositorio e instala el paquete localmente:

```bash
npm link
```

Para ejecutar las pruebas:

```bash
npm test
```

También puedes ejecutar la CLI directamente desde el repositorio:

```bash
node bin/ai-methodology.js --help
```

Las plantillas de la metodología se encuentran en `templates/` y el código de la CLI en `src/`.

Las contribuciones deben mantener separadas las reglas de la metodología y la lógica del instalador.