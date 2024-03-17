import {component$, useSignal, useTask$} from "@builder.io/qwik";
import copyToClipboard from "copy-to-clipboard";
import {server$, ServerQRL} from "@builder.io/qwik-city";
import { timeUntilNextPuzzle} from "~/utilities/answer-builder";

const winCondition = "That's right. Great job solving the puzzle".toLowerCase();
const clarificationCondition =
  "You have not explained with enough clarity. Please expand upon your answer.".toLowerCase();

export const containsWinCondition = (responses: string[]) =>
  responses.join(" ").toLowerCase().includes(winCondition);

const timeStringFromDifference = (difference: number) => {
    const hoursRemaining = Math.floor(difference / 3600000);
    const minutesRemaining = Math.floor((difference / 60000) - (hoursRemaining * 60));
    const secondsRemaining = Math.floor(difference / 1000) - (Math.floor(difference / 60000) * 60);

    return `${hoursRemaining}:${String(minutesRemaining).padStart(2, "0")}:${String(secondsRemaining).padStart(2, "0")}`
}

const getNextDateString = server$(() => {
    return timeUntilNextPuzzle()
})

export const GameCompleteComponent = component$(
  (props: { puzzleNumber: string; responses: string[], onTimerReset: ServerQRL<() => void> }) => {
      const counter = useSignal("");
      const difference = useSignal(0);
      const epoch = useSignal(0);
    const copied = useSignal(false);
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

    useTask$(async ({cleanup}) => {
        difference.value = await getNextDateString();
        counter.value = timeStringFromDifference(difference.value);
        epoch.value = performance.now();
        const serverTimeFetchInterval = setInterval(async () => {
            console.log(difference.value)
            difference.value = await getNextDateString();
            console.log(difference.value)

        }, 30_000);

        const clientCounterInterval = setInterval(() => {
            const delta = performance.now() - epoch.value;
            epoch.value = performance.now();
            difference.value -= delta;
            counter.value = timeStringFromDifference(difference.value);
            if(difference.value <= 0){
                props.onTimerReset();
            }
        }, 1000);


        cleanup(() => {
            clearInterval(serverTimeFetchInterval);
            clearInterval(clientCounterInterval);
        });
    });

    return (
      <>
        <p class={"my-3"}>
          {playerWon
            ? `Who are you so wise in the ways of science?!`
            : `Take some time to dwell upon your misgivings and come back tomorrow fresh.`}
        </p>
        <h3 class={"text-xl"}>Results:</h3>
        <div class={"text-center"}>
          <p class={"my-3"}>{emojiOutput}</p>
          <button
            class={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded`}
            onClick$={() => {
              copyToClipboard(
                `Wisest Wizard Puzzle ${props.puzzleNumber}\n${emojiOutput}\nhttps://wizest-wizard.com`,
              );
              copied.value = true;
            }}
          >
            {copied.value ? `Copied!` : `Copy Result To Clipboard`}
          </button>
        </div>
          <hr class={'my-5'}/>
          <p class={"text-lg"}>Next Puzzle In: {counter.value}</p>
      </>
    );
  },
);
