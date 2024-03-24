import {component$, useSignal, useStore, useVisibleTask$} from "@builder.io/qwik";
import {getAllPuzzlesFromLocalStorage} from "~/utilities/local-storage";
import {winCondition} from "~/components/GameComplete";

type Stats = {
    gamesPlayed: number,
    wins: number,
    losses: number,
    avgGuesses: number,
    totalGuesses: number,
    totalWordCount: number,
    avgWordCount: number
}

const toDisplayKey = (key: keyof Stats) => {
    switch (key) {
        case "gamesPlayed": return "Total Games Played";
        case "avgGuesses": return "Average Number of Guesses";
        case "wins": return "Wins";
        case "losses": return "Losses";
        case "totalGuesses": return "Total Number of Guesses";
        case "totalWordCount": return "Total Word Count";
        case "avgWordCount": return "Average Word Count";
    }
}

const defaultStats = (): Stats => ({
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    avgGuesses: 0,
    totalGuesses: 0,
    totalWordCount: 0,
    avgWordCount: 0
});

const getWordCountFromResults = (results: Array<{question?: string, answer?: string}>) => {
    return results.flatMap((result) => {
        return result.question?.split(" ").map((x) => x.trim()).filter(Boolean)
    }).length
}

const intoStatsObject = (localStorageEntries: (readonly [string, Array<{question?: string, answer?: string}>])[]): Stats => {
    const stats = localStorageEntries.reduce(
        (stats, [, results]) => {
            stats.gamesPlayed += 1;
            stats.totalGuesses += results.length;
            stats.totalWordCount += getWordCountFromResults(results);
            if(results.some((result) => result.answer?.toLowerCase().includes(winCondition))){
                stats.wins += 1;
            } else {
                stats.losses += 1;
            }
            return stats
        },
        defaultStats()
    );

    stats.avgGuesses = stats.gamesPlayed === 0 ? 0 : Math.floor(stats.totalGuesses / stats.gamesPlayed);
    stats.avgWordCount = stats.gamesPlayed === 0 ? 0 : Math.floor(stats.totalWordCount / stats.gamesPlayed);

    return stats;
}

const isKeyOf = <T extends Record<string, unknown>, U extends keyof T & string>(x: string, y: T): x is U => {
    return x in y;
}

export const StatsTable = component$(() => {
    const puzzleStats = useStore<Stats>(defaultStats);
    const statsLoaded = useSignal(false);
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
        const results = getAllPuzzlesFromLocalStorage();
        const statsObject = intoStatsObject(results);
        Object.entries(statsObject).forEach(([k, v]) => {
            if(isKeyOf(k, puzzleStats)){
                puzzleStats[k] = v;
            }
        });
        statsLoaded.value = true;
    }, {strategy: "document-ready"});


    return (
        <div>
            <table class={'table-auto w-full'}>
                <tbody>
                {Object.entries(puzzleStats).map(([key, value], i) => {
                    return (
                        <tr key={`${key}-${i}`}>
                            <td class={'font-bold text-left p-2 pl-0'}>{toDisplayKey(key as keyof Stats)}</td>
                            <td class={'text-left p-2 text-right'}>{value}</td>
                        </tr>
                    )
                })}

                </tbody>
            </table>
            <hr class={"my-6"}/>
        </div>
        
    )
})