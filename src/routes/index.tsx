import {
  component$,
  useStore,
  useTask$,
  $,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { fetchQuestionData } from "~/utilities/answer-builder";
import { AnswerComponent } from "~/components/Answer";
import {
  containsWinCondition,
  GameCompleteComponent,
} from "~/components/GameComplete";
import {
  getResultsFromLocalStorage,
  isFirstTimer,
  writeResultsToLocalStorage,
} from "~/utilities/local-storage";
import {
  fetchResponse,
  type QuestionData,
} from "~/utilities/fetch-streaming-response.server";
import { LoadingIndicator } from "~/components/LoadingIndicator";

export type DataStore = {
  questionData: null | QuestionData;
  answer: string;
  responses: { question: string; answer: string }[];
  thinking: boolean;
  firstTimer: boolean;
};

export default component$(() => {
  const store = useStore<DataStore>({
    questionData: null,
    answer: "",
    responses: [],
    thinking: false,
    firstTimer: false,
  });

  useTask$(async () => {
    store.questionData = await fetchQuestionData();
  });

  const onAnswer = $(async () => {
    if (store.questionData === null) return;
    const answer = store.answer;
    store.answer = "";
    store.thinking = true;
    let ack = false;
    store.responses.push({
      question: answer,
      answer: "Allow me to ponder the orb 🔮👀...",
    });
    try {
      const stream = await fetchResponse(store.questionData, answer);
      for await (const responseFragment of stream) {
        if (responseFragment instanceof Error) {
          throw responseFragment;
        }
        if (responseFragment.type === "content_block_delta") {
          if (!ack) {
            store.responses[store.responses.length - 1].answer =
              responseFragment.delta.text;
          } else {
            store.responses[store.responses.length - 1].answer +=
              responseFragment.delta.text;
          }
          writeResultsToLocalStorage(store.questionData.day, store.responses);
          ack = true;
        }
      }
    } catch (_) {
      store.responses[store.responses.length - 1].answer =
        `Ach! I've failed to deliver my duties. (this means the robot's broken or I ran out of money for the month).`;
    }

    store.thinking = false;
  });

  useVisibleTask$(() => {
    const responses = getResultsFromLocalStorage(store.questionData!.day);

    if (responses) {
      store.responses = responses;
    } else if (isFirstTimer()) {
      store.firstTimer = true;
    }
  });

  return (
    <div class={"container p-5 max-w-xl mx-auto leading-6 text-base"}>
      <h1 class={"text-3xl my-6"}>🧙🏾 Welcome Traveler</h1>
      <details class={"mb-4"} open={store.firstTimer}>
        <summary>Rules</summary>
        <p class={"my-3"}>
          The wise wizard asks you a logic puzzle. You have three chances to get
          it right. Make sure to explain your answer, or he might not accept it.
        </p>
        <p>
          <em>
            The Wise Wizard is still in beta. If you encounter bugs, please file
            at
          </em>
        </p>
        <a href={"https://github.com/dpchamps/wisest-wizard/issues"}>
            https://github.com/dpchamps/wisest-wizard/issues
          </a>
        <p class={"my-3"}>New Puzzle every day.</p>
        <br />
        <hr />
      </details>
      <h2 class={"text-xl my-3"}>
        Puzzle {store.questionData?.day} — {store.questionData?.title}
      </h2>
      {store.questionData?.puzzleQuestion.map((el, i) => (
        <p key={`question-key-${i}`} class={"font-mono my-6"}>
          {el}
        </p>
      ))}

      <div class={"answer-list"}>
        {store.responses.map((response, i) => (
          <ul class={"border-l-4 p-2 m-1"} key={`response-grouping-${i}`}>
            <li class={"font-bold italic my-2"} key={`response-question-${i}`}>
              Answer: {response.question}
            </li>

            <li class={"ml-6 my-2"} key={`response-answer-${i}`}>
              {store.thinking && i === store.responses.length - 1 ? (
                <LoadingIndicator input={"Allow me to ponder the orb 🔮👀"} />
              ) : (
                response.answer
              )}
            </li>
          </ul>
        ))}
      </div>
      {containsWinCondition(store.responses.map(({ answer }) => answer)) ||
      (store.responses.length === 3 && !store.thinking) ? (
        <GameCompleteComponent
          responses={store.responses.map(({ answer }) => answer)}
          puzzleNumber={store.questionData?.day || ""}
        />
      ) : (
        <AnswerComponent
          onClick={onAnswer}
          onValueUpdate={$((value) => {
            store.answer = value;
          })}
          answer={store.answer}
          thinking={store.thinking}
          maxContentLength={550}
        />
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Wisest Wizard",
  meta: [
    {
      name: "The Wisest of Wizards",
      content: "Answer Puzzles",
    },
  ],
};
