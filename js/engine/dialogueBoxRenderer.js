// engine/dialogueBoxRenderer.js
// UI de diálogo: retrato SIEMPRE visible (decisión de GDD sección 9), nombre
// del hablante en su color de acento, texto con el progreso de typewriter
// que ya gestiona DialogueSystem (esta función solo dibuja, no calcula texto).

import { CHARACTERS } from "../data/characters.js";

const BOX_HEIGHT = 130;
const PORTRAIT_SIZE = 90;
const PADDING = 16;

export function renderDialogueBox(ctx, { width, height, dialogueSystem }) {
  if (!dialogueSystem.isActive) return;

  const boxY = height - BOX_HEIGHT;
  const isCodec = dialogueSystem.currentIsCodec;

  // Caja de fondo — el codec call usa un tono azulado y borde parpadeante,
  // homenaje a las llamadas de radio de MGS (sin reproducir su UI original).
  ctx.fillStyle = isCodec ? "rgba(8, 20, 30, 0.95)" : "rgba(10, 12, 20, 0.92)";
  ctx.fillRect(0, boxY, width, BOX_HEIGHT);
  if (isCodec) {
    ctx.strokeStyle = "#3fa0c9";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, boxY + 2, width - 4, BOX_HEIGHT - 4);
    ctx.lineWidth = 1;
    ctx.fillStyle = "#3fa0c9";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("◉ LLAMADA", PADDING, boxY + 14);
  }

  const speakerId = dialogueSystem.currentSpeaker;
  const character = speakerId ? CHARACTERS[speakerId] : null;

  // Retrato (placeholder: cuadrado con el color de acento + inicial del nombre).
  // Siempre se dibuja si hay hablante, incluso si el retrato real aún no existe.
  if (character) {
    const px = PADDING;
    const py = boxY + (BOX_HEIGHT - PORTRAIT_SIZE) / 2;
    ctx.fillStyle = character.accentColor;
    ctx.fillRect(px, py, PORTRAIT_SIZE, PORTRAIT_SIZE);
    ctx.strokeStyle = "#e8e4da";
    ctx.strokeRect(px, py, PORTRAIT_SIZE, PORTRAIT_SIZE);
    ctx.fillStyle = "#0a0c14";
    ctx.font = "bold 36px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(character.name[0], px + PORTRAIT_SIZE / 2, py + PORTRAIT_SIZE / 2);
    ctx.textBaseline = "alphabetic";

    // Nombre del hablante, en su color de acento.
    ctx.fillStyle = character.accentColor;
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "left";
    ctx.fillText(character.name, px + PORTRAIT_SIZE + PADDING, boxY + 24);
  }

  // Texto (typewriter ya resuelto por DialogueSystem — aquí solo se pinta).
  const textX = PADDING + PORTRAIT_SIZE + PADDING;
  const textY = boxY + 50;
  const maxWidth = width - textX - PADDING;

  ctx.fillStyle = "#e8e4da";
  ctx.font = "15px monospace";
  ctx.textAlign = "left";
  wrapText(ctx, dialogueSystem.displayedText, textX, textY, maxWidth, 20);

  // Indicador de "continuar" cuando el texto ha terminado de escribirse.
  if (!dialogueSystem.isTyping) {
    ctx.fillStyle = "#8fa5b8";
    ctx.font = "12px monospace";
    ctx.textAlign = "right";
    ctx.fillText("▸ clic para continuar", width - PADDING, height - PADDING);
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
}
