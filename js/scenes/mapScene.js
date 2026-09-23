// scenes/mapScene.js
// Hub tipo Monkey Island: orden libre entre las 5 salas. La sala final se ve
// pero está bloqueada hasta completar los 5 objetivos (gameState.completeObjective).
//
// Usa el mapa isométrico real como fondo — las posiciones de los iconos están
// ajustadas a mano a la composición de esa imagen (layout irregular, no una
// fórmula genérica como en las salas individuales).

import { CHARACTERS, ALL_MEMBER_IDS } from "../data/characters.js";
import { gameState } from "../engine/gameState.js";
import { eventBus } from "../engine/eventBus.js";
import { loadImage } from "../engine/imageLoader.js";

const ICON_RADIUS = 24;
const BACKGROUND_PATH = "assets/backgrounds/map_hub.png";

// Posiciones fijas en fracción de ancho/alto del canvas, leídas directamente
// sobre la imagen del mapa isométrico (una por cada sala + la central).
const ICON_POSITIONS_FRACTION = {
  diva: { x: 0.144, y: 0.207 },
  dani: { x: 0.411, y: 0.127 },
  starless: { x: 0.779, y: 0.196 },
  fabs: { x: 0.159, y: 0.622 },
  adrian: { x: 0.829, y: 0.657 },
  final: { x: 0.476, y: 0.49 },
};

export class MapScene {
  constructor({ onRoomSelected, onFinalRoomSelected }) {
    this._onRoomSelected = onRoomSelected;
    this._onFinalRoomSelected = onFinalRoomSelected;
    this._finalUnlocked = false;
    this.backgroundImage = null;

    // Evento, no polling: nos enteramos del desbloqueo en cuanto ocurre.
    this._unsubUnlock = eventBus.on("finalRoomUnlocked", () => {
      this._finalUnlocked = true;
      // Sonido disonante grave que se corta abruptamente — placeholder de audio,
      // sustituir por el asset real (GDD sección 5: tono inquietante, no triunfal).
      console.log("[audio] unlock_dissonant.mp3 (placeholder)");
    });
  }

  async load() {
    this.backgroundImage = await loadImage(BACKGROUND_PATH);
  }

  destroy() {
    this._unsubUnlock?.();
  }

  _getIconPositions(width, height) {
    const positions = {};
    for (const [id, frac] of Object.entries(ICON_POSITIONS_FRACTION)) {
      positions[id] = { x: frac.x * width, y: frac.y * height };
    }
    return positions;
  }

  handleClick(x, y, canvasWidth, canvasHeight) {
    const positions = this._getIconPositions(canvasWidth, canvasHeight);

    if (this._finalUnlocked && this._isInside(x, y, positions.final)) {
      this._onFinalRoomSelected();
      return;
    }

    for (const memberId of ALL_MEMBER_IDS) {
      if (this._isInside(x, y, positions[memberId])) {
        this._onRoomSelected(memberId);
        return;
      }
    }
  }

  _isInside(x, y, pos) {
    const dx = x - pos.x;
    const dy = y - pos.y;
    return Math.sqrt(dx * dx + dy * dy) <= ICON_RADIUS;
  }

  render(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);

    if (this.backgroundImage) {
      ctx.drawImage(this.backgroundImage, 0, 0, width, height);
    } else {
      ctx.fillStyle = "#141a2b";
      ctx.fillRect(0, 0, width, height);
    }

    const positions = this._getIconPositions(width, height);

    // Insignias de estado por sala: silueta translúcida = pendiente, color de
    // acento sólido = completado. Deliberadamente pequeñas para no tapar el
    // arte real de cada localización.
    for (const memberId of ALL_MEMBER_IDS) {
      const { x, y } = positions[memberId];
      const character = CHARACTERS[memberId];
      const done = gameState.isObjectiveDone(memberId);

      ctx.beginPath();
      ctx.arc(x, y, ICON_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = done ? character.accentColor : "rgba(20, 22, 30, 0.55)";
      ctx.fill();
      ctx.strokeStyle = "#e8e4da";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;

      ctx.fillStyle = done ? "#0a0c14" : "#e8e4da";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(done ? "✓" : character.name[0], x, y + 1);
      ctx.textBaseline = "alphabetic";
    }

    // Sala final: visible siempre, bloqueada visualmente hasta el evento.
    const finalPos = positions.final;
    ctx.beginPath();
    ctx.arc(finalPos.x, finalPos.y, ICON_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = this._finalUnlocked ? "#c9922e" : "rgba(10, 12, 20, 0.7)";
    ctx.fill();
    ctx.strokeStyle = this._finalUnlocked ? "#e8e4da" : "#4a4f5d";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;

    ctx.fillStyle = this._finalUnlocked ? "#0a0c14" : "#8fa5b8";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this._finalUnlocked ? "♪" : "🔒", finalPos.x, finalPos.y + 1);
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "#e8e4da";
    ctx.font = "13px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`Objetivos completados: ${gameState.globalTension} / 5`, width / 2, height - 12);
  }
}
