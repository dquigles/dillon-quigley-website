import { CONFIG } from "./config.js";
import {
  gameState,
  updateCounter,
  getSelectedWord,
  clearSelectionState,
} from "./gameState.js";
import { elements } from "./domElements.js";
import { isAdjacent, createSvgLine } from "./utils.js";
import { createSideCard, animateCascadePick } from "./animations.js";
import { typeText, deleteText } from "./typingText.js";

export function updateLines() {
  elements.svg.innerHTML = "";
  gameState.foundLines.forEach((line) => elements.svg.appendChild(line));

  for (let i = 0; i < gameState.selectedCells.length - 1; i++) {
    const startIndex = gameState.selectedCells[i];
    const endIndex = gameState.selectedCells[i + 1];

    const line = createSvgLine(
      startIndex,
      endIndex,
      elements.grid,
      elements.svg,
      "#e1dfd1",
      CONFIG.LINE_WIDTH
    );
    elements.svg.appendChild(line);
  }
}

function drawFoundLines(cells, isSpangram) {
  for (let i = 0; i < cells.length - 1; i++) {
    const startIndex = cells[i];
    const endIndex = cells[i + 1];
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
}

function updateSelectedClass() {
  gameState.gridCells.forEach((cell, i) => {
    const sel = gameState.selectedSet.has(i);
    cell.classList.toggle("selected", sel);
    if (!sel && !cell.classList.contains("found")) {
      cell.style.transform = "scale(1)";
    }
  });

  if (gameState.selectedCells.length) {
    const last = gameState.selectedCells.slice(-1)[0];
    const cell = gameState.gridCells[last];
    cell.style.transform = `scale(${CONFIG.CELL_SCALE})`;
    setTimeout(
      () => (cell.style.transform = "scale(1)"),
      CONFIG.ANIMATION_DURATION
    );
  }
}

export function clearSelectionDisplay() {
  clearSelectionState();
  updateSelectedClass();
  if (elements.wordDisplay) elements.wordDisplay.textContent = "\u200b";
  updateLines();
}

export function checkAllWordsFound() {
  if (gameState.foundWords.size === gameState.words.size) {
    animateCascadePick();

    if (elements.typingHintText) {
      deleteText(undefined, () => {
        typeText("congrats!", undefined, () => {
          setTimeout(() => {
            if (elements.typingHintText) {
              elements.typingHintText.classList.add("fade-out");
            }
          }, 3000);
        });
      });
    }

    if (elements.hint) {
      elements.hint.classList.add("fade-out");
    }
    if (elements.autoSolveBtn) {
      elements.autoSolveBtn.classList.add("fade-out");
      elements.autoSolveBtn.disabled = true;
    }
    return true;
  }
  return false;
}

export function submitWord() {
  const word = getSelectedWord();
  if (gameState.words.has(word) && !gameState.foundWords.has(word)) {
    const isSpangram = word === gameState.spangram;

    gameState.selectedCells.forEach((i) => {
      const cell = gameState.gridCells[i];
      cell.classList.remove("selected");
      cell.classList.add("found", "pick");
      if (isSpangram) cell.classList.add("spangram");
      gameState.usedIndices.add(i);
    });

    setTimeout(() => {
      gameState.selectedCells.forEach((i) => {
        gameState.gridCells[i].classList.remove("pick");
      });
    }, 300);

    drawFoundLines([...gameState.selectedCells], isSpangram);
    gameState.foundCount++;
    gameState.foundWords.add(word);
    updateCounter();
    createSideCard(word);

    clearSelectionDisplay();
    checkAllWordsFound();
  } else {
    if (elements.wordDisplay) {
      elements.wordDisplay.classList.add("shake");
      setTimeout(
        () => elements.wordDisplay.classList.remove("shake"),
        CONFIG.ANIMATION_DURATION
      );
    }
    clearSelectionDisplay();
  }
}

function selectCell(cellElement) {
  const index = +cellElement.dataset.index;
  const row = +cellElement.dataset.row;
  const col = +cellElement.dataset.col;

  const currentLastSelected =
    gameState.selectedCells.length > 0
      ? gameState.selectedCells[gameState.selectedCells.length - 1]
      : null;

  if (gameState.selectedSet.has(index)) {
    if (index === currentLastSelected) {
      gameState.tapCandidateForSubmit = index;
    } else {
      gameState.tapCandidateForSubmit = null;
    }
    const idxInSelectedCells = gameState.selectedCells.indexOf(index);
    gameState.selectedCells = gameState.selectedCells.slice(
      0,
      idxInSelectedCells + 1
    );
    gameState.selectedSet = new Set(gameState.selectedCells);
  } else if (
    gameState.selectedCells.length === 0 ||
    isAdjacent(row, col, currentLastSelected)
  ) {
    gameState.selectedCells.push(index);
    gameState.selectedSet.add(index);
    gameState.tapCandidateForSubmit = null;
  } else {
    gameState.tapCandidateForSubmit = null;
    return;
  }

  updateSelectedClass();
  updateLines();
  if (elements.wordDisplay)
    elements.wordDisplay.textContent = getSelectedWord() || "Strands";

  // Auto-submit if word is 14 letters or longer
  const currentWord = getSelectedWord();
  if (currentWord.length >= 14) {
    // Check if the word is known before attempting to submit,
    // to avoid submitting partial non-words if a known 14+ letter word is a prefix of an even longer unknown sequence.
    // However, the original submitWord() already handles unknown words by shaking.
    // So, direct submission is fine.
    submitWord();
  }
}

export function handleGridEvent(e) {
  if (gameState.isAutoSolving) return;

  let cell;
  const eventType = e.type;

  if (eventType === "touchstart" || eventType === "touchmove") {
    if (e.touches && e.touches.length > 0) {
      const targetElement = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY
      );
      if (targetElement) {
        cell = targetElement.closest(".cell");
      }
    }
  } else {
    cell = e.target.closest(".cell");
  }

  if (!cell || cell.classList.contains("found")) {
    return;
  }

  if (eventType === "touchstart" || eventType === "touchmove") {
    e.preventDefault();
  }

  const index = +cell.dataset.index;

  try {
    switch (eventType) {
      case "mousedown":
      case "touchstart":
        gameState.isMouseDown = true;
        gameState.dragged = false;
        selectCell(cell);
        break;
      case "mouseover":
        if (gameState.isMouseDown) {
          gameState.dragged = true;
          selectCell(cell);
        }
        break;
      case "touchmove":
        if (gameState.isMouseDown) {
          gameState.dragged = true;
          selectCell(cell);
        }
        break;
      case "click":
        if (!gameState.dragged) {
          selectCell(cell);
        }
        break;
      case "dblclick":
        const lastSelectedMouse = gameState.selectedCells.slice(-1)[0];
        if (index === lastSelectedMouse && gameState.selectedCells.length > 0) {
          if (getSelectedWord()) {
            submitWord();
          }
        }
        break;
    }
  } catch (error) {
    console.error("Error handling grid event:", error);
    clearSelectionDisplay();
  }
}

export function createBoard() {
  gameState.board.forEach((letter, i) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = letter;
    cell.dataset.index = i;
    cell.dataset.row = Math.floor(i / CONFIG.GRID_SIZE);
    cell.dataset.col = i % CONFIG.GRID_SIZE;
    elements.grid.appendChild(cell);
    gameState.gridCells.push(cell);
  });
  updateCounter();
}
