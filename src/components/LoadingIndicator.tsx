import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

type LoadingIndicatorProps = {
  input: string;
};

const longWaitMessages = [
  "I'm thinking deeply about the solution",
  "there are many things to consider",
  "sorry, this is taking a while",
];
export const LoadingIndicator = component$(
  ({ input }: LoadingIndicatorProps) => {
    const waitingIndicator = useSignal(".");
    const longTimeIndicator = useSignal(-1);

      // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
      const intervalId = setInterval(() => {
        if (waitingIndicator.value.length >= 3) {
          waitingIndicator.value = "";
        }
        waitingIndicator.value += ".";
      }, 300);
      const longPollId = setTimeout(() => {
        longTimeIndicator.value += 1;
      }, 2000);
      cleanup(() => {
        clearInterval(intervalId);
        clearInterval(longPollId);
      });
    });
    return (
      <>
        {`${input} ${longTimeIndicator.value === -1 ? "" : longWaitMessages[longTimeIndicator.value]}${waitingIndicator.value}`}
      </>
    );
  },
);
