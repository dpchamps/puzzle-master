export const getResultsFromLocalStorage = (puzzle: string) => {
  const maybePuzzle = window.localStorage.getItem(puzzle);
  if (maybePuzzle === null) return null;
  try {
    return JSON.parse(maybePuzzle);
  } catch (_) {
    return null;
  }
};

export const writeResultsToLocalStorage = <
  T extends Record<string, unknown> | unknown[],
>(
  puzzle: string,
  results: T,
) => {
  window.localStorage.setItem(puzzle, JSON.stringify(results, null, 1));
};

export const getAllPuzzlesFromLocalStorage = () => {
  return Object.entries(window.localStorage).map(([key, value]) => [key, JSON.parse(value)] as const)

}

export const isFirstTimer = () => window.localStorage.length === 0;
