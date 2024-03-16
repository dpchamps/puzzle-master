import { server$ } from "@builder.io/qwik-city";
import { type fetchQuestionData, getPrompt } from "~/utilities/answer-builder";
import { createResponseStream } from "~/anthropic";

export type QuestionData = Awaited<ReturnType<typeof fetchQuestionData>>;

export const fetchResponse = server$(async function* (
  questionData: QuestionData,
  answer: string,
) {
  try {
    const prompt = getPrompt(
      questionData.puzzleQuestion.join("\n"),
      questionData.puzzleAnswer,
      answer,
    );
    yield* await createResponseStream(questionData.systemPrompt, prompt);
  } catch (_) {
    yield new Error(`Backend Error Occurred`);
  }
});
