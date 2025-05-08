import { gameState } from "./gameState.js";

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
  startCellRect,
  endCellRect,
  svgParentRect,
  strokeColor,
  strokeWidth,
  strokeLinecap = "round"
) {
  const x1 = startCellRect.left + startCellRect.width / 2 - svgParentRect.left;
  const y1 = startCellRect.top + startCellRect.height / 2 - svgParentRect.top;
  const x2 = endCellRect.left + endCellRect.width / 2 - svgParentRect.left;
  const y2 = endCellRect.top + endCellRect.height / 2 - svgParentRect.top;

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
