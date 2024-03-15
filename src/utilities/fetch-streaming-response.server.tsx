import { server$ } from "@builder.io/qwik-city";
import { fetchQuestionData, getPrompt } from "~/utilities/answer-builder";
import { createResponseStream } from "~/anthropic";

export type QuestionData = Awaited<ReturnType<typeof fetchQuestionData>>;

export const fetchResponse = server$(async function* (
  questionData: QuestionData,
  answer: string,
) {
  const prompt = getPrompt(
    questionData.puzzleQuestion.join("\n"),
    questionData.puzzleAnswer,
    answer,
  );
  const x = await createResponseStream(questionData.systemPrompt, prompt);

  yield* x;
});
