import { gameState } from "./modules/gameState.js";
import { elements } from "./modules/domElements.js";
import {
  createBoard,
  handleGridEvent,
  submitWord as gridSubmitWord,
} from "./modules/gridLogic.js";
import { animateSnakeDrop } from "./modules/animations.js";
import { autoSolveReplay } from "./modules/autoSolve.js";

// --- Initialize Game ---
if (elements.grid) {
  createBoard();
  animateSnakeDrop();

  // --- Event Listeners ---
  elements.grid.addEventListener("mousedown", handleGridEvent);
  elements.grid.addEventListener("mouseover", handleGridEvent);
  elements.grid.addEventListener("click", handleGridEvent);
  elements.grid.addEventListener("dblclick", handleGridEvent);
} else {
  console.error("Grid element not found. Game cannot start.");
}

document.body.addEventListener("mouseup", () => {
  if (gameState.isAutoSolving) {
    gameState.isMouseDown = false;
    return;
  }
  if (gameState.isMouseDown && gameState.dragged) {
    gridSubmitWord(); // This will internally call checkAllWordsFound in gridLogic.js
  }
  gameState.isMouseDown = false;
});

const autoSolveBtn = document.getElementById("autoSolveBtn");
if (autoSolveBtn) {
  autoSolveBtn.addEventListener(
    "click",
    async () => {
      // gameState.isAutoSolving is set within autoSolveReplay
      await autoSolveReplay();
      // autoSolveReplay will call checkAllWordsFound (via gridLogic module), which handles button state on win.
    },
    { once: true }
  );
} else {
  console.warn("Auto-solve button not found.");
}
