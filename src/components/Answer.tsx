import {component$, type QRL, useSignal, useVisibleTask$} from "@builder.io/qwik";

// 500/131
// 131 = 3.8
// 32  = 15.6

// avg 9.7

export const AnswerComponent = component$(
  (store: {
    onClick: QRL<() => Promise<void>>;
    onValueUpdate: QRL<(v: string) => void>;
    answer: string;
    thinking: boolean;
    maxContentLength: number;
  }) => {
    const contentLength = useSignal(0);
    const lineHeight = useSignal(0);
    const textAreaRef = useSignal<Element>();
    const textAreaWidth = useSignal(0);

      // eslint-disable-next-line qwik/no-use-visible-task
      useVisibleTask$(({cleanup}) => {
          const ta = textAreaRef.value;
          const evtListener = () => {
              if(ta){
                  textAreaWidth.value = ta.getBoundingClientRect().width;
              }
          }
          if(ta){
              textAreaWidth.value = ta.getBoundingClientRect().width;
              window.addEventListener("resize", evtListener);
          }

          cleanup(() => window.removeEventListener("resize", evtListener));

      });

    return (
      <div class={"answer-box"}>
        <div>
          <label for={"answer text-lg font-bold"}>
            Answer:{" "}
            {contentLength.value === 0
              ? ""
              : `(${contentLength.value} / ${store.maxContentLength})`}
          </label>
        </div>
        <div class={"input-fields"}>
          <textarea
              ref={textAreaRef}
            maxLength={store.maxContentLength}
            class={
              "resize-none rounded-m py-2 p-1 dark:bg-slate-50 dark:text-slate-800"
            }
            style={`height: ${150+Math.max(lineHeight.value - 4, 0) * 23}px`}
            id={"answer"}
            value={store.answer}
            onInput$={(_, el) => {
              lineHeight.value = el.value.split("\n").reduce((acc, el) => acc+1+Math.floor(el.length/(textAreaWidth.value/8.4)), 0);

              contentLength.value = el.value.length;
              return store.onValueUpdate(el.value);
            }}
          />
          <button
            class={
              "bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
            }
            disabled={store.thinking}
            onClick$={() => {
              contentLength.value = 0;
              return store.onClick();
            }}
          >
            Answer
          </button>
        </div>
      </div>
    );
  },
);
