// scenes/finalActClimaxScene.js
// Beats 4-7 del Acto 3, ya con protagonista elegido. Único punto de todo el
// juego con contenido condicional por personaje (GDD sección 7): el guion
// común usa "{{protagonist}}" como placeholder, sustituido aquí en tiempo de
// carga, y las reacciones de los otros 4 se cargan del bloque correspondiente.

import { CHARACTERS } from "../data/characters.js";
import { ACTION_BEAT_CONFIG } from "../data/actionBeats.js";
import { DialogueSystem } from "../engine/dialogueSystem.js";
import { renderRoom } from "../engine/roomRenderer.js";
import { renderDialogueBox } from "../engine/dialogueBoxRenderer.js";
import { loadImage } from "../engine/imageLoader.js";

const DIALOGUE_PATH = "js/data/dialogue/act3.json";
const BACKGROUND_PATH = "assets/backgrounds/act3_recording_room.png";
const PLACEHOLDER = "{{protagonist}}";

export class FinalActClimaxScene {
  constructor({ protagonistId, onFinished }) {
    this.protagonistId = protagonistId;
    this._onFinished = onFinished;
    this._activeSegment = null;
    this._pendingActionBeatDone = null;
    this._gestureConfig = null;
    this._gestureCount = 0;
    this._gestureStartTime = 0;
    this._holding = false;
    this.backgroundImage = null;

    this.dialogueSystem = new DialogueSystem({
      runActionBeat: (memberId, onDone) => this._startActionBeat(memberId, onDone),
    });
    this.dialogueSystem.onScriptEnd = () => this._onSegmentEnd();
  }

  async load() {
    const [data, background] = await Promise.all([
      fetch(DIALOGUE_PATH).then((res) => res.json()),
      loadImage(BACKGROUND_PATH),
    ]);
    this._data = data;
    this.backgroundImage = background;
    this._playArray("action_sequence", this._substitute(this._data.action_sequence));
  }

  _substitute(script) {
    // Sustitución superficial: solo los campos que pueden llevar el
    // placeholder (speaker, portrait, memberId). El resto del nodo queda igual.
    return script.map((node) => {
      const copy = { ...node };
      for (const field of ["speaker", "portrait", "memberId"]) {
        if (copy[field] === PLACEHOLDER) copy[field] = this.protagonistId;
      }
      return copy;
    });
  }

  _playArray(name, script) {
    this._activeSegment = name;
    this.dialogueSystem.load(script);
  }

  _onSegmentEnd() {
    if (this._activeSegment === "action_sequence") {
      this._playArray("reactions", this._data.reactions[this.protagonistId]);
    } else if (this._activeSegment === "reactions") {
      this._playArray("ending", this._data.ending);
    } else if (this._activeSegment === "ending") {
      this._onFinished();
    }
  }

  _startActionBeat(memberId, onDone) {
    this._gestureConfig = ACTION_BEAT_CONFIG[memberId] ?? { type: "multi_click", steps: 1 };
    this._gestureCount = 0;
    this._gestureStartTime = performance.now();
    this._pendingActionBeatDone = onDone;
  }

  handleClick() {
    if (this._pendingActionBeatDone && this._gestureConfig?.type === "multi_click") {
      this._gestureCount += 1;
      if (this._gestureCount >= this._gestureConfig.steps) {
        this._resolveActionBeat();
      }
      return;
    }
    if (this.dialogueSystem.isActive) {
      this.dialogueSystem.advanceOrSkip();
    }
  }

  handleMouseDown() {
    if (this._pendingActionBeatDone && this._gestureConfig?.type === "hold_release") {
      this._holding = true;
      this._gestureStartTime = performance.now();
    }
  }

  handleMouseUp() {
    if (this._holding) {
      this._holding = false;
      this._resolveActionBeat();
    }
  }

  _resolveActionBeat() {
    const hesitationMs = performance.now() - this._gestureStartTime;
    const done = this._pendingActionBeatDone;
    this._pendingActionBeatDone = null;
    this._gestureConfig = null;
    done({ hesitationMs }); // cosmético únicamente — nunca altera qué línea viene después
  }

  update(deltaMs) {
    this.dialogueSystem.update(deltaMs);
  }

  render(ctx, width, height) {
    const character = CHARACTERS[this.protagonistId];
    renderRoom(ctx, {
      width,
      height,
      accentColor: character.accentColor,
      distortionLevel: 0,
      label: `Grabación final — ${character.name}`,
      backgroundImage: this.backgroundImage,
    });

    if (this._pendingActionBeatDone) {
      let progress = "";
      if (this._gestureConfig.type === "multi_click") {
        progress = ` (${this._gestureCount}/${this._gestureConfig.steps})`;
      } else if (this._holding) {
        progress = " — manteniendo...";
      }
      ctx.fillStyle = "#e8e4da";
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillText(this._gestureConfig.prompt + progress, width / 2, height - 160);
    }

    renderDialogueBox(ctx, { width, height, dialogueSystem: this.dialogueSystem });
  }
}
