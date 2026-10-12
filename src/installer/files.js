import { isDirectory, isFile, readText, writeText } from "../utils/fs.js";
import { CliError } from "../core/errors.js";
import { sha256 } from "../core/hash.js";

export async function classifyFile(absolutePath, { templateHash, installedHash }) {
  if (await isDirectory(absolutePath)) {
    throw new CliError(
      `Se esperaba un archivo en "${absolutePath}", pero esa ruta es un directorio.`
    );
  }
  if (!(await isFile(absolutePath))) {
    return "missing";
  }

  const currentHash = sha256(await readText(absolutePath));
  if (currentHash === templateHash) {
    return "current";
  }
  if (installedHash && currentHash === installedHash) {
    return "outdated";
  }
  return "modified";
}

export async function writeManagedFile(absolutePath, content) {
  await writeText(absolutePath, content);
  return sha256(content);
}
