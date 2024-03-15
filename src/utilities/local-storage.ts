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