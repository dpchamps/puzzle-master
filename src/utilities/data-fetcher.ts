import fs from "fs/promises";
import path from "path";
import assert from "assert";

const readDataFromDisk = async (path: string) => {
    console.log(`Fetching question data from ${path}`);

    return JSON.parse(await fs.readFile(path, "utf-8"));
}
export const createDataSynchronizer = (ms: number) => {
    const questionsPath = process.env.QUESTIONS_PATH || "";
    const resolvedQuestionsPath = path.resolve(questionsPath);

    let then = Date.now();
    let data: null|Record<string, unknown> = null;

    process.on("SIGCONT", async () => {
        console.log(`Received SIGCONT, updating data`);
        data = await readDataFromDisk(resolvedQuestionsPath);
    });


    return async () => {
        const now = Date.now();
        if(data === null || (now - then) > ms) {
            data = await readDataFromDisk(resolvedQuestionsPath);
            then = now;
        }
        assert(data !== null);

        return data
    }
}