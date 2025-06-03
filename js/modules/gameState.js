/**
 * Manages the state of the Strands game, including the game board,
 * selected cells, found words, and various game flags.
 * Also provides utility functions to interact with the game state.
 */
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
  gridCells: [],
  usedIndices: new Set(),
  foundLines: [],
  foundCount: 0,
  foundWords: new Set(),
  isAutoSolving: false,
  tapCandidateForSubmit: null,
};

export function updateCounter() {
  if (elements.wordCounter) {
    elements.wordCounter.textContent = `${gameState.foundCount} of ${gameState.words.size} words found`;
  }
}

export function getSelectedWord() {
  return gameState.selectedCells.map((i) => gameState.board[i]).join("");
}

export function clearSelectionState() {
  gameState.selectedCells = [];
  gameState.selectedSet.clear();
  gameState.tapCandidateForSubmit = null;
}
