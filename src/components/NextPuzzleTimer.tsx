import {component$, useSignal, useVisibleTask$} from "@builder.io/qwik";
import {server$, ServerQRL} from "@builder.io/qwik-city";
import {timeUntilNextPuzzle, getResetDate} from "~/utilities/answer-builder";

const timeStringFromDifference = (difference: number) => {
    const hoursRemaining = Math.floor(difference / 3600000);
    const minutesRemaining = Math.floor((difference / 60000) - (hoursRemaining * 60));
    const secondsRemaining = Math.floor(difference / 1000) - (Math.floor(difference / 60000) * 60);

    return `${hoursRemaining}:${String(minutesRemaining).padStart(2, "0")}:${String(secondsRemaining).padStart(2, "0")}`
}

const getNextDateString = server$(() => {
    return timeUntilNextPuzzle()
});

const getResetDateFromServer = server$(() => {
    return getResetDate().toLocaleString("en-US", {timeZoneName: "short"})
});

export const NextPuzzleTimer = component$((props: {onTimerReset?: ServerQRL<() => void>}) => {
    const counter = useSignal("");
    const epoch = useSignal(0);
    const difference = useSignal(0);
    const resetDate = useSignal("");

    useVisibleTask$(async ({cleanup}) => {
        resetDate.value = await getResetDateFromServer();
        difference.value = await getNextDateString();
        counter.value = timeStringFromDifference(difference.value);
        epoch.value = performance.now();
        const serverTimeFetchInterval = setInterval(async () => {
            difference.value = await getNextDateString();
        }, 30_000);

        const clientCounterInterval = setInterval(() => {
            const delta = performance.now() - epoch.value;
            epoch.value = performance.now();
            difference.value -= delta;
            counter.value = timeStringFromDifference(difference.value);
            if(difference.value <= 0){
                props.onTimerReset?.();
            }
        }, 1000);


        cleanup(() => {
            clearInterval(serverTimeFetchInterval);
            clearInterval(clientCounterInterval);
        });
    }, {strategy: "document-ready"});
    return (
        <p class={'text-lg'}>Next Puzzle At {resetDate.value} ({counter.value})</p>
    )
})