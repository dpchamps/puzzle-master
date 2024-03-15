import {
  component$,
  useStore,
  useTask$,
  QRL,
  $,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { server$ } from "@builder.io/qwik-city";
import { fetchQuestionData, getPrompt } from "~/answer-builder";
import { createResponseStream } from "~/anthropic";
import copyToClipboard from "copy-to-clipboard";


type QuestionData = Awaited<ReturnType<typeof fetchQuestionData>>;

type DataStore = {
  questionData: null | QuestionData;
  answer: string;
  responses: { question: string; answer: string }[];
  thinking: boolean;
};

const fetchResponse = server$(async function* (
  questionData: QuestionData,
  answer: string,
) {
  const prompt = getPrompt(
    questionData.puzzleQuestion.join('\n'),
    questionData.puzzleAnswer,
    answer,
  );
  const x = await createResponseStream(questionData.systemPrompt, prompt);

  yield* x;
});

const AnswerComponent = component$(
  (store: {
    onClick: QRL<() => Promise<void>>;
    onValueUpdate: QRL<(v: string) => void>;
    answer: string;
    thinking: boolean;
  }) => {
    return (
      <div class={'answer-box'}>
          <div>
              <label for={"answer text-lg font-bold"}>Answer: </label>
          </div>
          <div class={'input-fields'}>
              <textarea
                  class={'resize-none rounded-m py-2 p-1 bg-slate-50'}
                  id={"answer"}
                  value={store.answer}
                  onInput$={(_, el) => store.onValueUpdate(el.value)}
              />
              <button
                  class={'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'}
                  disabled={store.thinking}
                  onClick$={store.onClick}
              >
                  Answer
              </button>
          </div>

      </div>
    );
  },
);

const winCondition = "That's right. Great job solving the puzzle".toLowerCase();
const clarificationCondition =
  "Not quite. There's a better solution.".toLowerCase();

const getResultsFromLocalStorage = (puzzle: string) => {
  const maybePuzzle = window.localStorage.getItem(puzzle);
  if (maybePuzzle === null) return null;
  try {
    return JSON.parse(maybePuzzle);
  } catch (_) {
    return null;
  }
};

const writeResultsToLocalStorage = (
  puzzle: string,
  results: DataStore["responses"],
) => {
  window.localStorage.setItem(puzzle, JSON.stringify(results, null, 1));
};

const containsWinCondition = (responses: string[]) =>
  responses.join(" ").toLowerCase().includes(winCondition);

const GameCompleteComponent = component$((props: { puzzleNumber: string, responses: string[] }) => {
  const playerWon = containsWinCondition(props.responses);
  const emojiOutput = props.responses
    .map((response) => {
      if (response.toLowerCase().includes(winCondition)) {
        return "✅";
      } else if (response.toLowerCase().includes(clarificationCondition)) {
        return "❓";
      } else {
        return "❌";
      }
    })
    .join(" ");

  return (
    <>
      <p class={'my-3'}>
        {playerWon
          ? `Who are you so wise in the ways of science?!`
          : `Take some time to dwell upon your misgivings and come back tomorrow fresh.`}
      </p>
      <h3 class={'text-xl'}>Results:</h3>

        <div class={'text-center'}>
            <p class={'my-3'}>{emojiOutput}</p>
            <button class={'bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'} onClick$={() => {
                copyToClipboard(`Riddles Puzzle ${props.puzzleNumber}\n${emojiOutput}`)
            }}>Copy Result To Clipboard</button>
        </div>

    </>
  );
});

export default component$(() => {
  const store = useStore<DataStore>({
    questionData: null,
    answer: "",
    responses: [],
    thinking: false,
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
    const stream = await fetchResponse(store.questionData, answer);
    for await (const responseFragment of stream) {
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

    store.thinking = false;
  });

  useVisibleTask$(() => {
    const responses = getResultsFromLocalStorage(store.questionData!.day);
    if (responses) {
      store.responses = responses;
    }
  });

  return (
    <div class={"container p-3 max-w-xl mx-auto leading-6 text-base font-sans "}>
      <h1 class={'text-3xl my-6'}>🧙🏾 Welcome, Traveller</h1>
      <details class={'mb-4'}>
        <summary>Rules</summary>
        <p class={'my-3'}>
          The wise wizard asks you a logic puzzle. You have three chances to get
          it right. Make sure to explain your answer, or he might not accept it. New Puzzle every day.
        </p>
        <hr />
      </details>
      <h2 class={'text-xl my-3'}>
        Puzzle {store.questionData?.day} — {store.questionData?.title}
      </h2>
        {
            store.questionData?.puzzleQuestion.map((el, i) =>
                <p key={`question-key-${i}`} class={'font-mono my-6'}>{el}</p>
            )
        }

      <div class={"answer-list"}>
        {store.responses.map((response, i) => (
          <ul class={'border-l-4 p-2 m-1'} key={`response-grouping-${i}`}>
            <li class={'font-bold italic my-2'} key={`response-question-${i}`}>Answer: {response.question}</li>
            <li class={'ml-6 my-2'} key={`response-answer-${i}`}>{response.answer}</li>
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
        />
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Puzzle Master",
  meta: [
    {
      name: "The Puzzle Master",
      content: "Answer Puzzles",
    },
  ],
};
