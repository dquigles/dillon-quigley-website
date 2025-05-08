import { CONFIG } from "./config.js";
import {
  gameState,
  updateCounter,
  getSelectedWord,
  clearSelectionState,
} from "./gameState.js";
import { elements } from "./domElements.js";
import { isAdjacent } from "./utils.js";
import { createSideCard, animateCascadePick } from "./animations.js";

export function updateLines() {
  const rects = gameState.gridCells.map((cell) => cell.getBoundingClientRect());
  const svgRect = elements.svg.getBoundingClientRect();
  elements.svg.innerHTML = ""; // Clear previous lines
  gameState.foundLines.forEach((line) => elements.svg.appendChild(line));

  for (let i = 0; i < gameState.selectedCells.length - 1; i++) {
    const startRect = rects[gameState.selectedCells[i]];
    const endRect = rects[gameState.selectedCells[i + 1]];

    const x1 = startRect.left + startRect.width / 2 - svgRect.left;
    const y1 = startRect.top + startRect.height / 2 - svgRect.top;
    const x2 = endRect.left + endRect.width / 2 - svgRect.left;
    const y2 = endRect.top + endRect.height / 2 - svgRect.top;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#e1dfd1");
    line.setAttribute("stroke-width", CONFIG.LINE_WIDTH);
    line.setAttribute("stroke-linecap", "round");
    elements.svg.appendChild(line);
  }
}

function drawFoundLines(cells, isSpangram) {
  const rects = gameState.gridCells.map((cell) => cell.getBoundingClientRect());
  const svgRect = elements.svg.getBoundingClientRect();

  for (let i = 0; i < cells.length - 1; i++) {
    const startRect = rects[cells[i]];
    const endRect = rects[cells[i + 1]];

    const x1 = startRect.left + startRect.width / 2 - svgRect.left;
    const y1 = startRect.top + startRect.height / 2 - svgRect.top;
    const x2 = endRect.left + endRect.width / 2 - svgRect.left;
    const y2 = endRect.top + endRect.height / 2 - svgRect.top;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", isSpangram ? "#f5d547" : "#afdfee");
    line.setAttribute("stroke-width", CONFIG.LINE_WIDTH);
    line.setAttribute("stroke-linecap", "round");
    gameState.foundLines.push(line);
  }
  updateLines(); // Redraw all lines including the new found one
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
  clearSelectionState(); // from gameState.js
  updateSelectedClass();
  if (elements.wordDisplay) elements.wordDisplay.textContent = "\u200b"; // Zero-width space
  updateLines();
}

export function checkAllWordsFound() {
  if (gameState.foundWords.size === gameState.words.size) {
    animateCascadePick();

    if (elements.hint) {
      elements.hint.classList.add("fade-out");
    }
    const autoSolveBtn = document.getElementById("autoSolveBtn");
    if (autoSolveBtn) {
      autoSolveBtn.classList.add("fade-out");
      autoSolveBtn.disabled = true;
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

    if (gameState.foundCount === gameState.words.size) {
      const autoSolveBtn = document.getElementById("autoSolveBtn");
      if (autoSolveBtn) autoSolveBtn.disabled = true; // Should be handled by checkAllWordsFound too
    }
  } else {
    if (elements.wordDisplay) {
      elements.wordDisplay.classList.add("shake");
      setTimeout(
        () => elements.wordDisplay.classList.remove("shake"),
        CONFIG.ANIMATION_DURATION
      );
    }
  }
  clearSelectionDisplay();
  checkAllWordsFound(); // Check for win condition after clearing selection
}

function selectCell(cellElement) {
  const index = +cellElement.dataset.index;
  const row = +cellElement.dataset.row;
  const col = +cellElement.dataset.col;

  if (gameState.selectedSet.has(index)) {
    const idxInSelectedCells = gameState.selectedCells.indexOf(index);
    gameState.selectedCells = gameState.selectedCells.slice(
      0,
      idxInSelectedCells + 1
    );
    gameState.selectedSet = new Set(gameState.selectedCells);
  } else if (
    gameState.selectedCells.length === 0 ||
    isAdjacent(row, col, gameState.selectedCells.slice(-1)[0])
  ) {
    gameState.selectedCells.push(index);
    gameState.selectedSet.add(index);
  } else {
    return; // Not adjacent or invalid selection
  }

  updateSelectedClass();
  updateLines();
  if (elements.wordDisplay)
    elements.wordDisplay.textContent = getSelectedWord() || "Strands";
}

export function handleGridEvent(e) {
  if (gameState.isAutoSolving) return;

  const cell = e.target.closest(".cell");
  if (!cell || cell.classList.contains("found")) return;

  const index = +cell.dataset.index;
  try {
    switch (e.type) {
      case "mousedown":
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
      case "click":
        if (!gameState.dragged) {
          // clearSelectionDisplay(); // Single click now deselects unless it's part of a drag
          selectCell(cell); // Re-evaluate single click behavior if needed
        }
        break;
      case "dblclick":
        const lastSelected = gameState.selectedCells.slice(-1)[0];
        if (index === lastSelected) {
          submitWord();
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
    gameState.gridCells.push(cell); // Populate gameState.gridCells
  });
  updateCounter(); // Initial counter update
}
