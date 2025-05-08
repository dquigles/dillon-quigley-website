import { CONFIG } from "./config.js";
import { gameState } from "./gameState.js";

export function createSideCard(word) {
  const baseCard = document.createElement("div");
  baseCard.className = "side-card";
  baseCard.textContent = `${word} section content goes here...`;

  const positionMap = {
    ABOUT: "left-middle",
    CONTACT: "bottom-right",
    MUSIC: "right-middle",
    BLOG: "bottom-left",
    PROJECTS: "bottom-middle",
    RESUME: "top-right",
    DILLONQUIGLEY: "top-left",
  };

  const zones = Array.isArray(positionMap[word])
    ? positionMap[word]
    : [positionMap[word]];

  zones.forEach((zoneName, i) => {
    const zone = document.querySelector(`.card-zone.${zoneName}`);
    if (!zone) return;

    const card = baseCard.cloneNode(true);
    card.id = Array.isArray(positionMap[word])
      ? `card-${word}-${i}`
      : `card-${word}`;

    card.classList.add("slide-right");
    zone.appendChild(card);

    card.addEventListener(
      "animationend",
      () => card.classList.remove("slide-right"),
      { once: true }
    );
  });
}

export function animateSnakeDrop() {
  const cols = CONFIG.GRID_SIZE;
  const total = gameState.board.length;
  const rows = Math.ceil(total / cols);
  const order = [];

  for (let r = rows - 1; r >= 0; r--) {
    if ((rows - 1 - r) % 2 === 0) {
      for (let c = 0; c < cols; c++) order.push(r * cols + c);
    } else {
      for (let c = cols - 1; c >= 0; c--) order.push(r * cols + c);
    }
  }

  order.forEach((idx, i) => {
    if (gameState.gridCells[idx]) {
      const cell = gameState.gridCells[idx];
      cell.style.opacity = "0";
      setTimeout(() => {
        cell.classList.add("drop");
        cell.addEventListener(
          "animationend",
          function onEnd() {
            cell.classList.remove("drop");
            cell.style.opacity = "";
            cell.removeEventListener("animationend", onEnd);
          },
          { once: true }
        );
      }, i * 50);
    }
  });
}

export function animateCascadePick() {
  const cols = CONFIG.GRID_SIZE;
  const total = gameState.board.length;
  const rows = Math.ceil(total / cols);
  const order = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      order.push(r * cols + c);
    }
  }

  setTimeout(() => {
    order.forEach((idx, i) => {
      if (gameState.gridCells[idx]) {
        const cell = gameState.gridCells[idx];
        setTimeout(() => {
          cell.classList.add("cascade-pick");
          cell.addEventListener(
            "animationend",
            function onEnd() {
              cell.classList.remove("cascade-pick");
              cell.removeEventListener("animationend", onEnd);
            },
            { once: true }
          );
        }, i * 25);
      }
    });
  }, 300);
}

export function animateCards() {
  const cards = document.querySelectorAll(".slide-target");
  cards.forEach((card, i) => {
    const dir = card.dataset.direction || "up";
    setTimeout(() => {
      card.classList.add(`slide-${dir}`);
      card.addEventListener(
        "animationend",
        () => {
          card.classList.remove(`slide-${dir}`);
        },
        { once: true }
      );
    }, i * 100);
  });
}
