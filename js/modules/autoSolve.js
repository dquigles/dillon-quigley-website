import { CONFIG } from "./config.js";
import { gameState, updateCounter } from "./gameState.js";
import { elements } from "./domElements.js";
import { createSideCard } from "./animations.js";
import { createSvgLine } from "./utils.js";
import {
  updateLines,
  checkAllWordsFound,
  clearSelectionDisplay,
} from "./gridLogic.js";

function getNeighbors(index) {
  const r = Math.floor(index / CONFIG.GRID_SIZE);
  const c = index % CONFIG.GRID_SIZE;
  const neighbors = [];
  const ROWS = Math.ceil(gameState.board.length / CONFIG.GRID_SIZE);
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr,
        nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < CONFIG.GRID_SIZE) {
        neighbors.push(nr * CONFIG.GRID_SIZE + nc);
      }
    }
  }
  return neighbors;
}

function findPathForWord(word) {
  const path = [];
  const visited = new Set();
  function dfs(currentIndex, pathIndex) {
    if (pathIndex === word.length) return true;
    for (const neighborIndex of getNeighbors(currentIndex)) {
      if (
        !visited.has(neighborIndex) &&
        gameState.board[neighborIndex] === word[pathIndex]
      ) {
        visited.add(neighborIndex);
        path.push(neighborIndex);
        if (dfs(neighborIndex, pathIndex + 1)) return true;
        visited.delete(neighborIndex);
        path.pop();
      }
    }
    return false;
  }

  for (let i = 0; i < gameState.board.length; i++) {
    if (gameState.board[i] === word[0]) {
      visited.clear();
      visited.add(i);
      path.length = 0;
      path.push(i);
      if (dfs(i, 1)) return [...path];
    }
  }
  return null;
}

export async function autoSolveReplay() {
  gameState.isAutoSolving = true;
  clearSelectionDisplay();
  const LETTER_DELAY = 150;
  const FOUND_DELAY = 250;

  const solveOrder = [
    ...[...gameState.words].filter((w) => w !== gameState.spangram),
    gameState.spangram,
  ];

  for (const word of solveOrder) {
    if (gameState.foundWords.has(word)) continue;
    const path = findPathForWord(word);
    if (!path) continue;

    for (let i = 0; i < path.length; i++) {
      const idx = path[i];
      const cell = gameState.gridCells[idx];

      gameState.selectedCells.push(idx);
      cell.classList.add("pick", "selected");
      updateLines();
      if (elements.wordDisplay) {
        elements.wordDisplay.textContent = path
          .slice(0, i + 1)
          .map((j) => gameState.board[j])
          .join("");
      }
      await new Promise((res) => setTimeout(res, LETTER_DELAY));
      cell.classList.remove("pick");
    }

    await new Promise((res) => setTimeout(res, FOUND_DELAY));
    path.forEach((i) => {
      const cell = gameState.gridCells[i];
      cell.classList.remove("selected");
      cell.classList.add("found", "push");
      if (word === gameState.spangram) cell.classList.add("spangram");
      gameState.usedIndices.add(i);
    });

    setTimeout(() => {
      path.forEach((i) => gameState.gridCells[i].classList.remove("push"));
    }, 300);

    const isSpangram = word === gameState.spangram;
    for (let i = 0; i < path.length - 1; i++) {
      const startIndex = path[i];
      const endIndex = path[i + 1];
      const color = isSpangram ? "#f5d547" : "#afdfee";

      const line = createSvgLine(
        startIndex,
        endIndex,
        elements.grid,
        elements.svg,
        color,
        CONFIG.LINE_WIDTH
      );
      gameState.foundLines.push(line);
    }
    updateLines();

    createSideCard(word);
    gameState.foundCount++;
    gameState.foundWords.add(word);
    updateCounter();
    clearSelectionDisplay();
    await new Promise((res) => setTimeout(res, FOUND_DELAY));
  }

  checkAllWordsFound();
  gameState.isAutoSolving = false;
}
