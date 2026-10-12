import path from "node:path";
import { MANIFEST_DIR, MANIFEST_FILENAME } from "./constants.js";
import { getPackageVersion } from "./package.js";
import { isFile, readJson, writeJson } from "../utils/fs.js";

export function manifestPath(projectDir) {
  return path.join(projectDir, MANIFEST_DIR, MANIFEST_FILENAME);
}

export async function loadManifest(projectDir) {
  const file = manifestPath(projectDir);
  if (!(await isFile(file))) {
    return null;
  }
  return readJson(file);
}

export async function saveManifest(projectDir, manifest) {
  await writeJson(manifestPath(projectDir), manifest);
}

export async function createManifest({ files }) {
  return {
    packageVersion: await getPackageVersion(),
    installedAt: new Date().toISOString(),
    files,
  };
}

export function toProjectRelative(projectDir, absolutePath) {
  return path.relative(projectDir, absolutePath).split(path.sep).join("/");
}
