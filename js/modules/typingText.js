import { elements } from "./domElements.js";

const DEFAULT_TYPE_SPEED = 100; // ms per character
const DEFAULT_DELETE_SPEED = 70; // ms per character

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

  // Ensure the element is cleared to ZWS before starting to type
  elements.typingHintText.textContent = "\u200b";
  setCaret(true);

  if (textToType.length === 0) {
    // If there's nothing to type
    setCaret(false);
    if (callback) callback();
    return;
  }

  let i = 0;
  function typeChar() {
    if (i < textToType.length) {
      if (i === 0) {
        // Replace ZWS with the first character
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
  // If current text is already just a ZWS, consider it empty for deletion purposes.
  if (currentText === "\u200b") currentText = "";

  let i = currentText.length;
  setCaret(true);

  function deleteChar() {
    if (i > 0) {
      i--; // Decrement first to get the new length/index for substring
      const newText = currentText.substring(0, i);
      elements.typingHintText.textContent = newText === "" ? "\u200b" : newText;
      setTimeout(deleteChar, speed);
    } else {
      // All characters are deleted. Ensure it's a zero-width space.
      elements.typingHintText.textContent = "\u200b";
      setCaret(false);
      if (callback) callback();
    }
  }

  if (i === 0) {
    // Already effectively empty (was ZWS or actually empty)
    elements.typingHintText.textContent = "\u200b";
    setCaret(false);
    if (callback) callback();
    return;
  }
  deleteChar();
}
