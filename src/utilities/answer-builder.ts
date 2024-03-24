import assert from 'assert'
import { systemPrompt } from "~/utilities/system-prompt";
import {createDataSynchronizer} from "~/utilities/data-fetcher";
import DefaultDateDiff from "date-diff";
const epochStart = "3/14/2024";

// @ts-ignore
const DateDiff = DefaultDateDiff.default;

const getData = createDataSynchronizer(60 * 1000 * 5, process.env.QUESTIONS_PATH || "")

function daysBetween() {
  const rightNow = new Date();
  const diff = new DateDiff(rightNow, new Date(epochStart));
  const daysBetween = Math.floor(diff.days()+1);

  return `${daysBetween}`.padStart(4, "0")
}

export const getResetDate = () => {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);

  return next;
}

export const timeUntilNextPuzzle = () => {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);

  const now = new Date();
  const diff = new DateDiff(next, now);

  return diff.difference;
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
      typeof systemPromptDynamic !== "undefined" && typeof systemPromptDynamic === "string"
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
