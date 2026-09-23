// scenes/baseRoomScene.js
// Lógica común a las 5 salas: carga de guion JSON, avance de diálogo, render
// de fondo + caja de diálogo, y el mecanismo genérico de Action Beat (solo
// algunas salas lo usan; las que no, simplemente nunca invocan runActionBeat).
//
// Cada sala concreta (RoomScene de Diva, DaniRoomScene, etc.) extiende esta
// clase e implementa solo lo que la hace distinta: qué objetos son
// interactuables (getHitboxes), qué pasa al pulsarlos (onObjectClick) y qué
// segmento de guion sigue a cada uno (onDialogueSegmentEnd).

import { CHARACTERS } from "../data/characters.js";
import { ROOM_ASSETS } from "../data/roomAssets.js";
import { gameState } from "../engine/gameState.js";
import { DialogueSystem } from "../engine/dialogueSystem.js";
import { renderRoom } from "../engine/roomRenderer.js";
import { renderDialogueBox } from "../engine/dialogueBoxRenderer.js";
import { loadImage } from "../engine/imageLoader.js";
import { ROOM_PUZZLES } from "../data/rooms.js";

export class BaseRoomScene {
  constructor({ memberId, onExit }) {
    this.memberId = memberId;
    this._onExit = onExit;
    this.character = CHARACTERS[memberId];
    this.puzzleConfig = ROOM_PUZZLES[memberId];
    this.dialogueData = null;
    this.activeSegment = null;
    this.backgroundImage = null; // se rellena en load() si hay arte real disponible
    this.characterSprite = null;

    this._pendingActionBeatDone = null; // solo lo usan las salas con Action Beat

    this.dialogueSystem = new DialogueSystem({
      runActionBeat: (memberId, onDone) => {
        this._pendingActionBeatDone = onDone;
        this.onActionBeatStarted?.(memberId);
      },
    });
    this.dialogueSystem.onScriptEnd = () => this.onDialogueSegmentEnd(this.activeSegment);
  }

  async load() {
    const [dialogueData] = await Promise.all([
      fetch(this.puzzleConfig.dialoguePath).then((res) => res.json()),
      this._loadRoomAssets(),
    ]);
    this.dialogueData = dialogueData;
    this.playSegment(this.getInitialSegment());
  }

  /** Carga fondo/sprite reales si ya existen para esta sala en ROOM_ASSETS.
   *  Mientras no existan, ambos quedan en null y renderRoom usa el
   *  placeholder geométrico de siempre — así el motor funciona igual de bien
   *  con arte real que sin él, sala por sala. */
  async _loadRoomAssets() {
    const assets = ROOM_ASSETS[this.memberId];
    if (!assets) return;
    const [background, sprite] = await Promise.all([
      assets.background ? loadImage(assets.background) : Promise.resolve(null),
      assets.sprite ? loadImage(assets.sprite) : Promise.resolve(null),
    ]);
    this.backgroundImage = background;
    this.characterSprite = sprite;
  }

  /** Sobrescribir si la sala no empieza por "entrance". */
  getInitialSegment() {
    return "entrance";
  }

  playSegment(segmentKey) {
    this.activeSegment = segmentKey;
    this.dialogueSystem.load(this.dialogueData[segmentKey]);
  }

  /** Marca el objetivo de esta sala como completado y avisa al estado global. */
  completeObjective() {
    gameState.completeObjective(this.memberId);
  }

  exitRoom() {
    this._onExit();
  }

  // --- Métodos que cada sala concreta DEBE o PUEDE sobrescribir ---

  /** @returns {Object<string, {x,y,w,h,label}>} hitboxes de objetos interactuables */
  getHitboxes() {
    return {};
  }

  /** Se llama al pulsar un objeto interactuable (solo si no hay diálogo activo). */
  onObjectClick(_objectId) {}

  /** Se llama cuando un segmento de guion termina de reproducirse. */
  onDialogueSegmentEnd(_segmentKey) {}

  /** Dibujo adicional específico de la sala (hitboxes, indicadores propios). */
  renderExtra(_ctx, _width, _height) {}

  /** Actualización adicional específica de la sala (temporizadores, etc.). */
  updateExtra(_deltaMs) {}

  // --- Interacción genérica ---

  handleClick(x, y) {
    if (this.dialogueSystem.isActive) {
      this.dialogueSystem.advanceOrSkip();
      return;
    }
    const hitboxes = this.getHitboxes();
    for (const [id, box] of Object.entries(hitboxes)) {
      if (this._isInsideHitbox(x, y, box)) {
        this.onObjectClick(id);
        return;
      }
    }
  }

  handleMouseDown() {
    this._holdStartTime = performance.now();
    this.onMouseDown?.();
  }

  handleMouseUp() {
    if (this._pendingActionBeatDone) {
      const hesitationMs = performance.now() - (this._holdStartTime ?? performance.now());
      const done = this._pendingActionBeatDone;
      this._pendingActionBeatDone = null;
      done({ hesitationMs });
    }
    this.onMouseUp?.();
  }

  handleMouseMove(x, y) {
    this.onMouseMove?.(x, y);
  }

  _isInsideHitbox(x, y, box) {
    return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
  }

  update(deltaMs) {
    this.dialogueSystem.update(deltaMs);
    this.updateExtra(deltaMs);
  }

  render(ctx, width, height) {
    const distortionLevel = gameState.getDistortionLevel(this.memberId);
    renderRoom(ctx, {
      width,
      height,
      accentColor: this.character.accentColor,
      distortionLevel,
      label: this.character.name,
      backgroundImage: this.backgroundImage,
    });

    if (this.characterSprite) {
      this._drawCharacterSprite(ctx, width, height);
    }

    this.renderExtra(ctx, width, height);

    renderDialogueBox(ctx, { width, height, dialogueSystem: this.dialogueSystem });
  }

  /** Posición/escala por defecto del sprite en la escena — de pie, en el
   *  tercio izquierdo, apoyado en el suelo. Una sala concreta puede
   *  sobrescribir este método si su composición necesita otra posición. */
  _drawCharacterSprite(ctx, width, height) {
    const targetHeight = height * 0.62;
    const targetWidth = this.characterSprite.width * (targetHeight / this.characterSprite.height);
    const x = width * 0.22;
    const y = height - targetHeight - 15;
    ctx.drawImage(this.characterSprite, x, y, targetWidth, targetHeight);
  }

  destroy() {}
}
