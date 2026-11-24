import readline from "node:readline/promises";
import { stdin as defaultInput, stdout as defaultOutput } from "node:process";
import { CERTAINTY, CATEGORY_LABELS } from "../model/types.js";

/**
 * Maneja la interacción en terminal para responder el cuestionario de onboarding.
 */
export class OnboardingSession {
  constructor({ input = defaultInput, output = defaultOutput, inputs = null } = {}) {
    this.input = input;
    this.output = output;
    this.inputs = inputs ? [...inputs] : null;
    this.rl = null;
  }

  getRl() {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: this.input,
        output: this.output,
      });
    }
    return this.rl;
  }

  close() {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  async askLine(promptText) {
    if (this.inputs !== null) {
      if (this.inputs.length === 0) {
        throw new Error(
          `OnboardingSession: no hay más respuestas simuladas para el prompt: "${promptText}"`
        );
      }
      const val = String(this.inputs.shift()).trim();
      this.output.write(`${promptText}${val}\n`);
      return val;
    }
    const rl = this.getRl();
    return (await rl.question(promptText)).trim();
  }

  /**
   * Presenta una pregunta al usuario y recopila una respuesta validada.
   */
  async promptQuestion(engine, question, previousAnswer = null) {
    this.output.write(`\n--- [${CATEGORY_LABELS[question.category] || question.category}] ---\n`);
    this.output.write(`${question.question}\n`);
    if (question.description) {
      this.output.write(`  Nota: ${question.description}\n`);
    }

    const specialHelp = [
      ":unknown (No lo sé)",
      ":undecided (Por definir)",
    ];
    if (!question.required) {
      specialHelp.push(":skip (Omitir)");
    }
    this.output.write(`  Comandos especiales: ${specialHelp.join(" | ")}\n`);

    if (question.type === "single_select" && question.options) {
      this.output.write("  Opciones disponibles:\n");
      question.options.forEach((opt, idx) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const lbl = typeof opt === "string" ? opt : opt.label;
        this.output.write(`    ${idx + 1}) [${val}] ${lbl}\n`);
      });
    }

    const prevHint = previousAnswer?.value !== undefined ? ` [Actual: ${previousAnswer.value}]` : "";

    while (true) {
      const raw = await this.askLine(`> ${prevHint} `);

      // Si el usuario no escribe nada y había una respuesta previa, conservarla
      if (raw === "" && previousAnswer) {
        return {
          value: previousAnswer.value,
          status: previousAnswer.status || CERTAINTY.CONFIRMED,
        };
      }

      // Manejo de comandos especiales
      const lower = raw.toLowerCase();
      if (lower === ":skip") {
        const res = engine.validateAnswer(question, null, CERTAINTY.SKIPPED);
        if (res.valid) {
          return { value: null, status: CERTAINTY.SKIPPED };
        }
        this.output.write(`  Error: ${res.error}\n`);
        continue;
      }

      if (lower === ":unknown" || lower === "no lo se" || lower === "no lo sé") {
        return { value: null, status: CERTAINTY.UNKNOWN };
      }

      if (lower === ":undecided" || lower === "por definir") {
        return { value: null, status: CERTAINTY.UNDECIDED };
      }

      // Si es selección numérica en single_select
      let processedInput = raw;
      if (question.type === "single_select" && /^\d+$/.test(raw)) {
        const idx = parseInt(raw, 10) - 1;
        if (question.options[idx]) {
          const opt = question.options[idx];
          processedInput = typeof opt === "string" ? opt : opt.value;
        }
      }

      const validation = engine.validateAnswer(question, processedInput);
      if (validation.valid) {
        return {
          value: validation.parsedValue,
          status: CERTAINTY.CONFIRMED,
        };
      }

      this.output.write(`  Error: ${validation.error}\n`);
    }
  }

  /**
   * Muestra el resumen de respuestas recopiladas.
   */
  renderSummary(questions, responses) {
    this.output.write("\n=======================================================\n");
    this.output.write("        RESUMEN DEL KNOWLEDGE ONBOARDING               \n");
    this.output.write("=======================================================\n");

    const byCategory = {};
    for (const q of questions) {
      if (!byCategory[q.category]) byCategory[q.category] = [];
      byCategory[q.category].push(q);
    }

    for (const [cat, qList] of Object.entries(byCategory)) {
      this.output.write(`\n[${CATEGORY_LABELS[cat] || cat}]\n`);
      for (const q of qList) {
        const resp = responses[q.id];
        if (!resp) continue;

        let statusText = "";
        if (resp.status === CERTAINTY.SKIPPED) statusText = "(Omitido)";
        else if (resp.status === CERTAINTY.UNKNOWN) statusText = "(No lo sé)";
        else if (resp.status === CERTAINTY.UNDECIDED) statusText = "(Por definir)";
        else statusText = `"${resp.value}"`;

        this.output.write(`  • ${q.question} -> ${statusText}\n`);
      }
    }
    this.output.write("=======================================================\n\n");
  }

  /**
   * Presenta las opciones finales:
   * 1. Confirmar y guardar
   * 2. Modificar respuestas
   * 3. Cancelar
   */
  async promptFinalDecision() {
    this.output.write("Acciones disponibles:\n");
    this.output.write("  1) Confirmar y guardar base de conocimiento\n");
    this.output.write("  2) Regresar y modificar respuestas\n");
    this.output.write("  3) Cancelar (conserva el progreso temporal para reanudar luego)\n");

    while (true) {
      const choice = (await this.askLine("Selecciona una opción [1-3]: ")).trim();
      if (choice === "1") return "confirm";
      if (choice === "2") return "modify";
      if (choice === "3") return "cancel";
      this.output.write("Por favor ingresa 1, 2 o 3.\n");
    }
  }

  /**
   * Permite al usuario seleccionar qué pregunta modificar.
   */
  async promptQuestionToModify(questions, responses) {
    const answered = questions.filter((q) => responses[q.id] !== undefined);
    this.output.write("\nPreguntas disponibles para modificar:\n");
    answered.forEach((q, idx) => {
      this.output.write(`  ${idx + 1}) [${q.id}] ${q.question}\n`);
    });

    while (true) {
      const choice = (await this.askLine("Número de la pregunta a modificar (o 'cancelar'): ")).trim();
      if (choice.toLowerCase() === "cancelar" || choice === "") return null;
      const num = parseInt(choice, 10);
      if (num >= 1 && num <= answered.length) {
        return answered[num - 1];
      }
      this.output.write("Número inválido.\n");
    }
  }

  /**
   * Pregunta si desea reanudar una sesión previa existente.
   */
  async promptResumeSession() {
    this.output.write("\nSe encontró un proceso de onboarding previo no completado.\n");
    const answer = (await this.askLine("¿Deseas reanudar desde donde lo dejaste? [S/n]: ")).toLowerCase();
    if (answer === "" || answer === "s" || answer === "si" || answer === "sí" || answer === "y" || answer === "yes") {
      return "resume";
    }
    const reset = (await this.askLine("¿Deseas reiniciar desde el principio borrando el progreso anterior? [s/N]: ")).toLowerCase();
    if (reset === "s" || reset === "si" || reset === "sí" || reset === "y" || reset === "yes") {
      return "reset";
    }
    return "cancel";
  }

  /**
   * Pregunta qué escenario representa el proyecto.
   */
  async promptScenario() {
    this.output.write("\nSelecciona el escenario que mejor describe tu proyecto:\n");
    this.output.write("  1) Proyecto nuevo (iniciar cuestionario interactivo)\n");
    this.output.write("  2) Proyecto existente con conocimiento / documentación previa\n");
    this.output.write("  3) Proyecto existente sin conocimiento organizado\n");

    while (true) {
      const choice = (await this.askLine("Opción [1-3]: ")).trim();
      if (choice === "1") return "new";
      if (choice === "2") return "existing_with_docs";
      if (choice === "3") return "existing_without_docs";
      this.output.write("Por favor selecciona 1, 2 o 3.\n");
    }
  }

  /**
   * Solicita la ruta de la documentación existente en el escenario 2.
   */
  async promptExistingKnowledgePath(defaultPath = "docs") {
    this.output.write("\nIndica la ruta a la documentación o conocimiento existente (relativa al proyecto):\n");
    const val = (await this.askLine(`Ruta [${defaultPath}]: `)).trim();
    return val || defaultPath;
  }

  /**
   * Pregunta si desea responder preguntas complementarias.
   */
  async promptAskComplementaryQuestions() {
    const answer = (await this.askLine("¿Deseas responder preguntas complementarias sobre el proyecto? [S/n]: ")).toLowerCase();
    return answer === "" || answer === "s" || answer === "si" || answer === "sí" || answer === "y" || answer === "yes";
  }
}
