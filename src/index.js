import { parseArgs } from "./cli/parse-args.js";
import { printHelp } from "./cli/output.js";
import { configCommand } from "./commands/config.js";
import { installCommand } from "./commands/install.js";
import { updateCommand } from "./commands/update.js";
import { validateCommand } from "./commands/validate.js";
import { knowledgeCommand } from "./commands/knowledge.js";
import { CliError } from "./core/errors.js";
import { getPackageVersion } from "./core/package.js";

const COMMANDS = {
  knowledge: knowledgeCommand,
  install: installCommand,
  update: updateCommand,
  config: configCommand,
  validate: validateCommand,
};

export async function main(argv) {
  const parsed = parseArgs(argv);

  if (parsed.flags.version) {
    console.log(await getPackageVersion());
    return 0;
  }

  if (parsed.flags.help || !parsed.command) {
    printHelp();
    return parsed.command ? 0 : parsed.flags.help ? 0 : 1;
  }

  const command = COMMANDS[parsed.command];
  if (!command) {
    throw new CliError(`Comando desconocido: ${parsed.command}. Usa --help.`);
  }

  const cwd = parsed.flags.cwd || process.cwd();

  try {
    return await command({
      cwd,
      flags: parsed.flags,
      args: parsed.args,
    });
  } catch (error) {
    if (error instanceof CliError) {
      console.error(error.message);
      return error.exitCode;
    }
    throw error;
  }
}
