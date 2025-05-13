import { elements } from "./domElements.js";

const DEFAULT_TYPE_SPEED = 100;
const DEFAULT_DELETE_SPEED = 70;

function setCaret(show) {
  if (elements.typingHintText) {
    elements.typingHintText.classList.toggle("typing-text-caret", show);
  }
}

export function typeText(textToType, speed = DEFAULT_TYPE_SPEED, callback) {
  if (!elements.typingHintText) {
    if (callback) callback();
    return;
  }

  elements.typingHintText.textContent = "\u200b";
  setCaret(true);

  if (textToType.length === 0) {
    setCaret(false);
    if (callback) callback();
    return;
  }

  let i = 0;
  function typeChar() {
    if (i < textToType.length) {
      if (i === 0) {
        elements.typingHintText.textContent = textToType.charAt(i);
      } else {
        elements.typingHintText.textContent += textToType.charAt(i);
      }
      i++;
      setTimeout(typeChar, speed);
    } else {
      setCaret(false);
      if (callback) callback();
    }
  }
  typeChar();
}

export function deleteText(speed = DEFAULT_DELETE_SPEED, callback) {
  if (!elements.typingHintText) {
    if (callback) callback();
    return;
  }
  let currentText = elements.typingHintText.textContent;
  if (currentText === "\u200b") currentText = "";

  let i = currentText.length;
  setCaret(true);

  function deleteChar() {
    if (i > 0) {
      i--;
      const newText = currentText.substring(0, i);
      elements.typingHintText.textContent = newText === "" ? "\u200b" : newText;
      setTimeout(deleteChar, speed);
    } else {
      elements.typingHintText.textContent = "\u200b";
      setCaret(false);
      if (callback) callback();
    }
  }

  if (i === 0) {
    elements.typingHintText.textContent = "\u200b";
    setCaret(false);
    if (callback) callback();
    return;
  }
  deleteChar();
}
