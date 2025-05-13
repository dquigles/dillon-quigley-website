import { gameState, getSelectedWord } from "./modules/gameState.js";
import { elements } from "./modules/domElements.js";
import {
  createBoard,
  handleGridEvent,
  submitWord as gridSubmitWord,
} from "./modules/gridLogic.js";
import { animateSnakeDrop } from "./modules/animations.js";
import { autoSolveReplay } from "./modules/autoSolve.js";
import { typeText } from "./modules/typingText.js";

if (elements.grid && elements.typingHintText) {
  createBoard();
  animateSnakeDrop();
  typeText("hint: personal website");

  elements.grid.addEventListener("mousedown", handleGridEvent);
  elements.grid.addEventListener("mouseover", handleGridEvent);
  elements.grid.addEventListener("click", handleGridEvent);
  elements.grid.addEventListener("dblclick", handleGridEvent);

  elements.grid.addEventListener("touchstart", handleGridEvent, {
    passive: false,
  });
  elements.grid.addEventListener("touchmove", handleGridEvent, {
    passive: false,
  });
} else {
  console.error("Grid element not found. Game cannot start.");
}

function handleInteractionEnd(e) {
  if (gameState.isAutoSolving) {
    gameState.isMouseDown = false;
    return;
  }

  let interactionEndedOnCell = null;
  if (e.type === "touchend") {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const targetElement = document.elementFromPoint(
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY
      );
      if (targetElement) {
        interactionEndedOnCell = targetElement.closest(".cell");
      }
    }
  }

  if (gameState.isMouseDown && gameState.dragged) {
    if (getSelectedWord()) {
      gridSubmitWord();
    }
  } else if (
    gameState.isMouseDown &&
    !gameState.dragged &&
    e.type === "touchend" &&
    interactionEndedOnCell
  ) {
    const tappedCellIndex = +interactionEndedOnCell.dataset.index;
    if (
      gameState.tapCandidateForSubmit === tappedCellIndex &&
      getSelectedWord()
    ) {
      gridSubmitWord();
    }
  }

  gameState.isMouseDown = false;
  gameState.dragged = false;
  gameState.tapCandidateForSubmit = null;
}

document.body.addEventListener("mouseup", handleInteractionEnd);
document.body.addEventListener("touchend", handleInteractionEnd);

if (elements.autoSolveBtn) {
  elements.autoSolveBtn.addEventListener(
    "click",
    async () => {
      await autoSolveReplay();
    },
    { once: true }
  );
} else {
  console.warn("Auto-solve button not found.");
}
