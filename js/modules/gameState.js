import { elements } from "./domElements.js";

export const gameState = {
  words: new Set([
    "PROJECTS",
    "RESUME",
    "CONTACT",
    "BLOG",
    "ABOUT",
    "DILLONQUIGLEY",
    "MUSIC",
  ]),
  spangram: "DILLONQUIGLEY",
  board: [
    "S",
    "T",
    "Y",
    "E",
    "L",
    "T",
    "C",
    "U",
    "I",
    "G",
    "S",
    "U",
    "E",
    "Q",
    "N",
    "U",
    "I",
    "O",
    "J",
    "O",
    "T",
    "M",
    "C",
    "B",
    "O",
    "L",
    "C",
    "T",
    "N",
    "A",
    "R",
    "P",
    "L",
    "A",
    "O",
    "B",
    "R",
    "S",
    "E",
    "I",
    "C",
    "L",
    "E",
    "U",
    "M",
    "D",
    "G",
    "O",
  ],
  selectedCells: [],
  selectedSet: new Set(),
  isMouseDown: false,
  dragged: false,
  gridCells: [], // This will be populated by createBoard in gridLogic.js
  usedIndices: new Set(),
  foundLines: [],
  foundCount: 0,
  foundWords: new Set(),
  isAutoSolving: false,
};

export function updateCounter() {
  if (elements.wordCounter) {
    elements.wordCounter.textContent = `${gameState.foundCount} of ${gameState.words.size} words found`;
  }
}

export function getSelectedWord() {
  return gameState.selectedCells.map((i) => gameState.board[i]).join("");
}

// Clears only the selection state. UI updates are handled by gridLogic.
export function clearSelectionState() {
  gameState.selectedCells = [];
  gameState.selectedSet.clear();
}
