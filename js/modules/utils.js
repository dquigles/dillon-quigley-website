import { gameState } from "./gameState.js";

export function isAdjacent(row, col, lastIndex) {
  const cell = gameState.gridCells[lastIndex];
  if (!cell) return false; // Should not happen if logic is correct
  const r = +cell.dataset.row;
  const c = +cell.dataset.col;
  const rowDiff = Math.abs(row - r);
  const colDiff = Math.abs(col - c);
  return rowDiff <= 1 && colDiff <= 1 && rowDiff + colDiff !== 0;
}
