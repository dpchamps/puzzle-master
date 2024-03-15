import fs from "fs/promises";
import path from "path";
import assert from "assert";

const epochStart = "3/14/2024";

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
  const QUESTIONS_PATH = process.env.QUESTIONS_PATH || "";
  const RESOLVED_QUESTIONS_PATH = path.resolve(QUESTIONS_PATH);
  console.log(`Fetching question data from ${RESOLVED_QUESTIONS_PATH}`);
  const data = JSON.parse(await fs.readFile(RESOLVED_QUESTIONS_PATH, "utf-8"));
  assert(typeof data.systemPrompt === "string", "");
  const systemPrompt = data.systemPrompt;
  const { day, puzzleQuestion, puzzleAnswer, title } = getTodaysPuzzle(data);

  return {
    day,
    title,
    systemPrompt,
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
