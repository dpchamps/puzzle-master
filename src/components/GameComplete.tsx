import {component$} from "@builder.io/qwik";
import copyToClipboard from "copy-to-clipboard";

const winCondition = "That's right. Great job solving the puzzle".toLowerCase();
const clarificationCondition =
    "Not quite. There's a better solution.".toLowerCase();

export const containsWinCondition = (responses: string[]) =>
    responses.join(" ").toLowerCase().includes(winCondition);

export const GameCompleteComponent = component$((props: { puzzleNumber: string, responses: string[] }) => {
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