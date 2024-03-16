import fs from "fs/promises";
import path from "path";
import assert from "assert";
import { systemPrompt } from "~/utilities/system-prompt";
import {createDataSynchronizer} from "~/utilities/data-fetcher";

const epochStart = "3/14/2024";

const getData = createDataSynchronizer(60 * 1000 * 5);

function daysBetween() {
  return `${Math.round(Math.abs(Date.now() - +new Date(epochStart)) / 8.64e7)}`.padStart(
    4,
    "0",
  );
}

const getTodaysPuzzle = (data: Record<string, unknown>) => {
  const day = daysBetween();
  const puzzle = data[`puzzle-${day}`] || data["puzzle-0001"];
  assert(puzzle !== null && typeof puzzle === "object");
  assert("question" in puzzle && Array.isArray(puzzle.question));
  assert("answer" in puzzle && typeof puzzle.answer === "string");
  assert("title" in puzzle && typeof puzzle.title === "string");

  return {
    day,
    puzzleQuestion: puzzle.question,
    puzzleAnswer: puzzle.answer,
    title: puzzle.title,
  };
};

export const fetchQuestionData = async () => {
  const data = await getData();
  const systemPromptDynamic = data.systemPrompt;
  const { day, puzzleQuestion, puzzleAnswer, title } = getTodaysPuzzle(data);

  return {
    day,
    title,
    systemPrompt:
      typeof systemPromptDynamic !== "undefined"
        ? systemPromptDynamic
        : systemPrompt.trim(),
    puzzleQuestion,
    puzzleAnswer,
  };
};

export const getPrompt = (
  puzzleQuestion: string,
  puzzleAnswer: string,
  playerAnswer: string,
) => {
  return `Puzzle:\n\n${puzzleQuestion}\n\nTextbook Answer:\n\n${puzzleAnswer}\n\nPlayer Answer:\n\n${playerAnswer}`;
};
