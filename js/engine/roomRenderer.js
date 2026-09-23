// engine/roomRenderer.js
// Una ÚNICA función de renderizado de sala para las 5 localizaciones,
// parametrizada por accentColor + distortionLevel, tal y como exige el GDD
// (sección 6/9: evitar 5 salas con lógica de dibujado distinta).
//
// ARTE: todo lo dibujado aquí es geometría placeholder (rectángulos, texto)
// para validar la arquitectura. Sustituir por sprites/fondos pixel-art reales
// sin tocar la lógica de distorsión.

export function renderRoom(ctx, { width, height, accentColor, distortionLevel, label, backgroundImage }) {
  ctx.clearRect(0, 0, width, height);

  if (backgroundImage) {
    // Arte real disponible: se dibuja a pantalla completa, sin placeholder
    // ni etiquetas de desarrollo — la distorsión sigue aplicándose igual.
    ctx.drawImage(backgroundImage, 0, 0, width, height);
  } else {
    // Fondo base — paleta azul-violeta desaturada de atardecer (GDD sección 4).
    ctx.fillStyle = "#1a2438";
    ctx.fillRect(0, 0, width, height);

    // Placeholder de "prop" central con el acento de color del personaje.
    ctx.fillStyle = accentColor;
    ctx.fillRect(width / 2 - 40, height / 2 - 60, 80, 120);

    ctx.fillStyle = "#e8e4da";
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, width / 2, 40);
    ctx.font = "11px monospace";
    ctx.fillText("[placeholder de arte — sustituir por pixel art]", width / 2, height - 20);
  }

  if (distortionLevel > 0) {
    applyDistortion(ctx, width, height, distortionLevel);
  }
}

/**
 * Distorsión barata en Canvas2D vía manipulación de ImageData:
 * ruido + viñeta creciente con distortionLevel (0-3). Sin WebGL.
 */
function applyDistortion(ctx, width, height, level) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const noiseAmount = level * 6; // sube con el nivel

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * noiseAmount;
    data[i] = clampByte(data[i] + noise);
    data[i + 1] = clampByte(data[i + 1] + noise);
    data[i + 2] = clampByte(data[i + 2] + noise);
  }

  ctx.putImageData(imageData, 0, 0);

  // Viñeta simple, crece con el nivel de distorsión.
  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, height / 3,
    width / 2, height / 2, height * 0.75
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, `rgba(0,0,0,${0.15 * level})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function clampByte(v) {
  return Math.max(0, Math.min(255, v));
}
