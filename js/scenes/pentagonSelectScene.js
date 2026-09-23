// scenes/pentagonSelectScene.js
// Pantalla de selección de protagonista para el Acto 3 (GDD sección 9).
// El trazado del pentáculo se calcula de forma genérica a partir de los
// ángulos ya definidos en characters.js — si el día de mañana cambia el
// mapeo de vértices, esta escena no necesita tocarse.

import { CHARACTERS, ALL_MEMBER_IDS, VERTEX_ANGLES, getVertexPosition } from "../data/characters.js";

const VERTEX_RADIUS = 42;

export class PentagonSelectScene {
  constructor({ onSelected }) {
    this._onSelected = onSelected;
    this._hoveredMemberId = null;
  }

  _getLayout(width, height) {
    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const radius = Math.min(width, height) * 0.32;
    const positions = {};
    for (const memberId of ALL_MEMBER_IDS) {
      positions[memberId] = getVertexPosition(CHARACTERS[memberId].vertex, centerX, centerY, radius);
    }
    return { centerX, centerY, radius, positions };
  }

  /**
   * Aristas del pentáculo (patrón 5/2, la "estrella" real, no solo el
   * contorno del pentágono). Se calculan ordenando los vértices por ángulo y
   * conectando cada uno con el que está 2 posiciones más allá — genérico,
   * no depende de los nombres concretos de los vértices.
   */
  _getStarEdges() {
    const sorted = Object.entries(VERTEX_ANGLES)
      .map(([name, deg]) => [name, ((deg % 360) + 360) % 360])
      .sort((a, b) => a[1] - b[1])
      .map(([name]) => name);

    const edges = [];
    for (let i = 0; i < sorted.length; i++) {
      edges.push([sorted[i], sorted[(i + 2) % sorted.length]]);
    }
    return edges;
  }

  handleMouseMove(x, y, width, height) {
    const { positions } = this._getLayout(width, height);
    this._hoveredMemberId = ALL_MEMBER_IDS.find((id) => this._isInside(x, y, positions[id])) ?? null;
  }

  handleClick(x, y, width, height) {
    const { positions } = this._getLayout(width, height);
    const clicked = ALL_MEMBER_IDS.find((id) => this._isInside(x, y, positions[id]));
    if (clicked) this._onSelected(clicked);
  }

  _isInside(x, y, pos) {
    const dx = x - pos.x;
    const dy = y - pos.y;
    return Math.sqrt(dx * dx + dy * dy) <= VERTEX_RADIUS;
  }

  update() {}

  render(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0a0c14";
    ctx.fillRect(0, 0, width, height);

    const { centerX, centerY, radius, positions } = this._getLayout(width, height);

    // Círculo exterior
    ctx.strokeStyle = "#2d3a52";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + VERTEX_RADIUS * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    // Trazos del pentáculo — apunta hacia arriba (GDD sección 9: decisión
    // deliberada de no forzar una lectura de "pacto", esa ambigüedad vive en
    // el texto, no en la iconografía).
    const vertexOfHovered = this._hoveredMemberId ? CHARACTERS[this._hoveredMemberId].vertex : null;
    for (const [a, b] of this._getStarEdges()) {
      const isHighlighted = vertexOfHovered && (a === vertexOfHovered || b === vertexOfHovered);
      const memberForColor = isHighlighted ? this._hoveredMemberId : null;
      ctx.strokeStyle = memberForColor ? CHARACTERS[memberForColor].accentColor : "#3a3f4d";
      ctx.lineWidth = isHighlighted ? 3 : 1.5;
      const posA = getVertexPosition(a, centerX, centerY, radius);
      const posB = getVertexPosition(b, centerX, centerY, radius);
      ctx.beginPath();
      ctx.moveTo(posA.x, posA.y);
      ctx.lineTo(posB.x, posB.y);
      ctx.stroke();
    }
    ctx.lineWidth = 1;

    // Retratos en cada vértice (placeholder: círculo con inicial + acento).
    for (const memberId of ALL_MEMBER_IDS) {
      const character = CHARACTERS[memberId];
      const { x, y } = positions[memberId];
      const isHovered = memberId === this._hoveredMemberId;

      ctx.beginPath();
      ctx.arc(x, y, VERTEX_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = character.accentColor;
      ctx.fill();
      ctx.strokeStyle = isHovered ? "#e8e4da" : "#0a0c14";
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.stroke();
      ctx.lineWidth = 1;

      ctx.fillStyle = "#0a0c14";
      ctx.font = "bold 26px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(character.name[0], x, y);
      ctx.textBaseline = "alphabetic";

      ctx.fillStyle = isHovered ? character.accentColor : "#8fa5b8";
      ctx.font = "12px monospace";
      const labelY = y > centerY ? y + VERTEX_RADIUS + 18 : y - VERTEX_RADIUS - 10;
      ctx.fillText(character.name, x, labelY);
    }

    ctx.fillStyle = "#e8e4da";
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Elige con quién grabar el cierre", width / 2, 34);
  }
}
