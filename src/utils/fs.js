import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { CliError } from "../core/errors.js";

export async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export async function isDirectory(target) {
  try {
    const info = await stat(target);
    return info.isDirectory();
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export async function isFile(target) {
  try {
    const info = await stat(target);
    return info.isFile();
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export async function readText(target) {
  return readFile(target, "utf8");
}

export async function writeText(target, contents) {
  if (await isDirectory(target)) {
    throw new CliError(
      `No se puede escribir "${target}" porque esa ruta es un directorio. Indica un archivo dentro de esa carpeta.`
    );
  }

  await mkdir(path.dirname(target), { recursive: true });
  try {
    await writeFile(target, contents, "utf8");
  } catch (error) {
    if (error && error.code === "EISDIR") {
      throw new CliError(`No se puede escribir "${target}" porque esa ruta es un directorio.`);
    }
    throw error;
  }
}

export async function readJson(target) {
  const raw = await readText(target);
  return JSON.parse(raw);
}

export async function writeJson(target, value) {
  await writeText(target, `${JSON.stringify(value, null, 2)}\n`);
}
