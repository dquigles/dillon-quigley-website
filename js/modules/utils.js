import { gameState } from "./gameState.js";
import { CONFIG } from "./config.js";

export function isAdjacent(row, col, lastIndex) {
  const cell = gameState.gridCells[lastIndex];
  if (!cell) return false;
  const r = +cell.dataset.row;
  const c = +cell.dataset.col;
  const rowDiff = Math.abs(row - r);
  const colDiff = Math.abs(col - c);
  return rowDiff <= 1 && colDiff <= 1 && rowDiff + colDiff !== 0;
}

export function createSvgLine(
  startIndex,
  endIndex,
  gridElement,
  svgElement,
  strokeColor,
  strokeWidth,
  strokeLinecap = "round"
) {
  const computedStyle = getComputedStyle(gridElement);
  const cellSizeStr = computedStyle.getPropertyValue("--cell-size").trim();
  const gridGapStr = computedStyle.getPropertyValue("--grid-gap").trim();

  const cellSizePx = parseFloat(cellSizeStr);
  const gridGapPx = parseFloat(gridGapStr);

  if (isNaN(cellSizePx) || isNaN(gridGapPx)) {
    console.error(
      "Failed to parse cell size or grid gap from CSS variables. Lines may not draw correctly.",
      { cellSizeStr, gridGapStr }
    );
  }

  const gridContainerRect = gridElement.getBoundingClientRect();
  const svgParentRect = svgElement.getBoundingClientRect();
  const gridSize = CONFIG.GRID_SIZE;

  const startRow = Math.floor(startIndex / gridSize);
  const startCol = startIndex % gridSize;
  const endRow = Math.floor(endIndex / gridSize);
  const endCol = endIndex % gridSize;

  const x1_relative_to_grid =
    startCol * (cellSizePx + gridGapPx) + cellSizePx / 2;
  const y1_relative_to_grid =
    startRow * (cellSizePx + gridGapPx) + cellSizePx / 2;
  const x2_relative_to_grid =
    endCol * (cellSizePx + gridGapPx) + cellSizePx / 2;
  const y2_relative_to_grid =
    endRow * (cellSizePx + gridGapPx) + cellSizePx / 2;

  const x1 = gridContainerRect.left + x1_relative_to_grid - svgParentRect.left;
  const y1 = gridContainerRect.top + y1_relative_to_grid - svgParentRect.top;
  const x2 = gridContainerRect.left + x2_relative_to_grid - svgParentRect.left;
  const y2 = gridContainerRect.top + y2_relative_to_grid - svgParentRect.top;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", strokeColor);
  line.setAttribute("stroke-width", strokeWidth);
  line.setAttribute("stroke-linecap", strokeLinecap);
  return line;
}
