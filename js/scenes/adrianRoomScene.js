// scenes/adrianRoomScene.js
// Quinta y última sala sobre BaseRoomScene. Puzle `find_and_play`: encontrar
// la cinta y reproducirla. Deliberadamente el más simple de los 5 (GDD
// sección 6: "coherente con repetición/insistencia, no con astucia").
//
// Primera sala con arte real integrado (ver ROOM_ASSETS en data/roomAssets.js):
// las coordenadas de los hitboxes están ajustadas a la composición real del
// fondo generado (el reproductor coincide con el amplificador de la derecha;
// la cinta se sitúa entre las cajas centrales, ya que el fondo no incluye un
// prop de cinta dibujado aparte — es una zona de "pixel hunting" clásica de
// aventura gráfica hasta que se genere un sprite de cinta independiente).
//
// Particularidad narrativa: el bucle de batería se corta SOLO al terminar el
// guion de escucha, sin que el jugador pulse nada para detenerlo — es la
// única sala donde una acción de juego ocurre sin input directo del jugador.

import { BaseRoomScene } from "./baseRoomScene.js";
import { HumOscillator } from "../engine/humOscillator.js";

const TAPE_HITBOX = { x: 430, y: 260, w: 80, h: 90, label: "Cinta demo (entre las cajas)" };
const PLAYER_HITBOX = { x: 520, y: 220, w: 150, h: 170, label: "Reproductor" };

// Pulso grave simple para simular el bucle de batería sonando de fondo
// mientras se reproduce la cinta — no es música real, es un zumbido rítmico
// placeholder (sustituir por el audio real de la demo cuando exista).
const LOOP_FREQ = 90;
const LOOP_VOLUME = 0.05;

export class AdrianRoomScene extends BaseRoomScene {
  constructor(args) {
    super(args);
    this._tapeFound = false;
    this._hum = new HumOscillator();
  }

  getHitboxes() {
    const boxes = {};
    if (!this._tapeFound) boxes.tape = TAPE_HITBOX;
    else boxes.player = PLAYER_HITBOX;
    return boxes;
  }

  onObjectClick(objectId) {
    if (objectId === "tape") {
      this.playSegment("found_tape");
    } else if (objectId === "player") {
      this._hum.setTarget(LOOP_FREQ, LOOP_VOLUME); // arranca el "bucle"
      this.playSegment("play_tape");
    }
  }

  onDialogueSegmentEnd(segmentKey) {
    if (segmentKey === "found_tape") {
      this._tapeFound = true;
    } else if (segmentKey === "play_tape") {
      // Corte automático del bucle — sin acción explícita del jugador, tal y
      // como exige el guion. Ocurre en cuanto el guion termina de mostrarse.
      this._hum.setTarget(0, 0);
      this.completeObjective();
      this.playSegment("closing");
    } else if (segmentKey === "closing") {
      this.exitRoom();
    }
  }

  renderExtra(ctx, width, height) {
    for (const [, box] of Object.entries(this.getHitboxes())) {
      ctx.strokeStyle = "#e8e4da";
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      ctx.setLineDash([]);
      ctx.fillStyle = "#e8e4da";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(box.label, box.x + box.w / 2, box.y - 6);
    }
  }

  destroy() {
    this._hum.stop();
  }
}
