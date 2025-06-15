import { CONFIG } from "./config.js";
import { gameState } from "./gameState.js";

export async function createSideCard(word) {
  const baseCard = document.createElement("div");
  baseCard.className = "side-card";

  const positionMap = {
    ABOUT: "aboutZone",
    CONTACT: "contactZone",
    MUSIC: "musicZone",
    BLOG: "blogZone",
    PROJECTS: "projectsZone",
    RESUME: "resumeZone",
    DILLONQUIGLEY: "dillonQuigleyZone",
  };

  const zoneName = positionMap[word];
  if (!zoneName) {
    console.warn(`No zone defined for word: ${word}`);
    return;
  }

  const zone = document.getElementById(zoneName);
  if (!zone) {
    console.warn(`Zone element not found for ID: ${zoneName}`);
    return;
  }

  const existingCard = zone.querySelector(".side-card");
  if (existingCard) {
    existingCard.remove();
  }

  const card = baseCard.cloneNode(true);
  card.id = `card-${word}`;

  try {
    const response = await fetch(`cards/${word.toLowerCase()}Card.html`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const htmlContent = await response.text();
    card.innerHTML = htmlContent;
  } catch (error) {
    console.error(`Failed to load content for ${word}:`, error);
    card.innerHTML = `<p>Error loading content for ${word}.</p>`;
  }

  let animationClass;
  const isMobileView = window.matchMedia("(max-width: 768px)").matches;

  if (isMobileView) {
    animationClass = "slide-right";
  } else {
    animationClass = "slide-right";
    if (word === "DILLONQUIGLEY" || word === "ABOUT" || word === "BLOG") {
      animationClass = "slide-left";
    } else if (word === "PROJECTS") {
      animationClass = "slide-bottom";
    }
  }

  card.classList.add(animationClass);
  zone.appendChild(card);

  card.addEventListener(
    "animationend",
    () => card.classList.remove(animationClass),
    { once: true }
  );
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

/* 
// The following function animateCards() appears to be unused in the project.
// No other files reference it or use the '.slide-target' class it queries.
// Removing it to eliminate dead code.
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
*/
