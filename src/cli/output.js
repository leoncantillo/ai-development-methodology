export function printHelp() {
  console.log(`ai-methodology — instala y administra una metodología de desarrollo con agentes de IA

Uso:
  ai-methodology <comando> [opciones]

Comandos:
  install     Instala la metodología en el proyecto actual
  update      Actualiza los archivos administrados
  config      Consulta o modifica la configuración
  validate    Comprueba la instalación

Opciones globales:
  -h, --help       Muestra esta ayuda
  -v, --version    Muestra la versión
      --cwd <dir>  Directorio de trabajo

install:
  -y, --yes              Usa valores por defecto sin preguntar
      --name <nombre>    Nombre del proyecto
      --overwrite-local  Sobrescribe archivos modificados localmente

update:
      --dry-run          Muestra el plan sin escribir
      --overwrite-local  Sobrescribe archivos modificados localmente

config:
      --show             Imprime la configuración actual
      --set <clave> <valor>  Asigna un campo (notación con puntos)

validate:
      --strict           Trata las advertencias como error
`);
}

export function printValidation(checks, summary) {
  console.log("AI Methodology — Validation\n");
  for (const check of checks) {
    const label = check.status === "ok" ? "OK" : check.status === "warn" ? "WARN" : "ERROR";
    console.log(`[${label}] ${check.message}`);
  }

  const resultLabel = {
    valid: "Valid",
    "valid-with-warnings": "Valid with warnings",
    invalid: "Invalid",
  }[summary.result];

  console.log(`\nResult: ${resultLabel}`);
}

export function printInstallSummary({ projectDir, written, skipped, conflicts, currentTask, configPath }) {
  console.log(`\nInstalación en ${projectDir}`);
  console.log(`Configuración: ${configPath}`);
  if (written.length > 0) {
    console.log("Archivos escritos:");
    for (const item of written) {
      console.log(`  - ${item.relative}`);
    }
  }
  if (skipped.length > 0) {
    console.log("Archivos ya actualizados:");
    for (const item of skipped) {
      console.log(`  - ${item.relative}`);
    }
  }
  if (conflicts.length > 0) {
    console.log("Conflictos (modificados localmente, no sobrescritos):");
    for (const item of conflicts) {
      console.log(`  - ${item.relative}`);
    }
  }
  if (currentTask?.created) {
    console.log(`Tarea actual creada: ${currentTask.relative}`);
  }
}
