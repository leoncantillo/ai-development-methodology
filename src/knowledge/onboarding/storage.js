import path from "node:path";
import { mkdir, rm } from "node:fs/promises";
import {
  ONBOARDING_DIR,
  ONBOARDING_PROGRESS_FILENAME,
  ONBOARDING_RESPONSES_FILENAME,
} from "../../core/constants.js";
import { isDirectory, isFile, readJson, writeJson } from "../../utils/fs.js";

export function onboardingDirPath(projectDir) {
  return path.join(projectDir, ONBOARDING_DIR);
}

export function progressFilePath(projectDir) {
  return path.join(projectDir, ONBOARDING_DIR, ONBOARDING_PROGRESS_FILENAME);
}

export function responsesFilePath(projectDir) {
  return path.join(projectDir, ONBOARDING_DIR, ONBOARDING_RESPONSES_FILENAME);
}

export async function hasOnboardingSession(projectDir) {
  const pPath = progressFilePath(projectDir);
  return isFile(pPath);
}

export async function loadProgress(projectDir) {
  const file = progressFilePath(projectDir);
  if (!(await isFile(file))) {
    return null;
  }
  return readJson(file);
}

export async function saveProgress(projectDir, progress) {
  const dir = onboardingDirPath(projectDir);
  await mkdir(dir, { recursive: true });
  await writeJson(progressFilePath(projectDir), progress);
}

export async function loadResponses(projectDir) {
  const file = responsesFilePath(projectDir);
  if (!(await isFile(file))) {
    return {};
  }
  return (await readJson(file)) || {};
}

export async function saveResponses(projectDir, responses) {
  const dir = onboardingDirPath(projectDir);
  await mkdir(dir, { recursive: true });
  await writeJson(responsesFilePath(projectDir), responses);
}

export async function recordAnswer(
  projectDir,
  questionId,
  responseData,
  { nextQuestionId = null, completed = false } = {}
) {
  const currentResponses = await loadResponses(projectDir);
  currentResponses[questionId] = {
    ...responseData,
    answeredAt: responseData.answeredAt || new Date().toISOString(),
  };
  await saveResponses(projectDir, currentResponses);

  let currentProgress = await loadProgress(projectDir);
  if (!currentProgress) {
    currentProgress = {
      startedAt: new Date().toISOString(),
      history: [],
      currentQuestionId: questionId,
      completed: false,
    };
  }

  if (!currentProgress.history.includes(questionId)) {
    currentProgress.history.push(questionId);
  }

  currentProgress.currentQuestionId = nextQuestionId;
  currentProgress.completed = completed;
  currentProgress.updatedAt = new Date().toISOString();

  await saveProgress(projectDir, currentProgress);
  return { responses: currentResponses, progress: currentProgress };
}

export async function clearOnboardingSession(projectDir) {
  const dir = onboardingDirPath(projectDir);
  if (await isDirectory(dir)) {
    await rm(dir, { recursive: true, force: true });
  }
}
