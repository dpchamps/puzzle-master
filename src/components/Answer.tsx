import {component$, type QRL} from "@builder.io/qwik";

export const AnswerComponent = component$(
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