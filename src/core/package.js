import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson } from "../utils/fs.js";

const SRC_DIR = path.dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = path.resolve(SRC_DIR, "..", "..");
export const TEMPLATES_ROOT = path.join(PACKAGE_ROOT, "templates");

let cachedPackage = null;

export async function getPackageInfo() {
  if (!cachedPackage) {
    cachedPackage = await readJson(path.join(PACKAGE_ROOT, "package.json"));
  }
  return cachedPackage;
}

export async function getPackageVersion() {
  const info = await getPackageInfo();
  return info.version;
}
