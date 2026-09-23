// scenes/finalActIntroScene.js
// Beats 1-3 del Acto 3 (entrada a la sala conjunta, lectura del capítulo
// final, debate breve) — fijos, idénticos sin importar quién se elija luego
// como protagonista. Al terminar, cede el control a la pantalla del pentáculo.

import { DialogueSystem } from "../engine/dialogueSystem.js";
import { renderRoom } from "../engine/roomRenderer.js";
import { renderDialogueBox } from "../engine/dialogueBoxRenderer.js";
import { loadImage } from "../engine/imageLoader.js";

const DIALOGUE_PATH = "js/data/dialogue/act3.json";
const BACKGROUND_PATH = "assets/backgrounds/act3_recording_room.png";
const RECORDING_ROOM_ACCENT = "#c9922e"; // ámbar — convergencia de las 5 salas, sin acento de un único personaje

export class FinalActIntroScene {
  constructor({ onComplete }) {
    this._onComplete = onComplete;
    this.backgroundImage = null;
    this.dialogueSystem = new DialogueSystem();
    this.dialogueSystem.onScriptEnd = () => this._onComplete();
  }

  async load() {
    const [data, background] = await Promise.all([
      fetch(DIALOGUE_PATH).then((res) => res.json()),
      loadImage(BACKGROUND_PATH),
    ]);
    this.backgroundImage = background;
    this.dialogueSystem.load(data.intro);
  }

  handleClick() {
    this.dialogueSystem.advanceOrSkip();
  }

  update(deltaMs) {
    this.dialogueSystem.update(deltaMs);
  }

  render(ctx, width, height) {
    renderRoom(ctx, {
      width,
      height,
      accentColor: RECORDING_ROOM_ACCENT,
      distortionLevel: 0, // sala de grabación conjunta: sin distorsión, es el punto de convergencia
      label: "Sala de grabación conjunta",
      backgroundImage: this.backgroundImage,
    });
    renderDialogueBox(ctx, { width, height, dialogueSystem: this.dialogueSystem });
  }
}
