// engine/dialogueSystem.js
// Máquina de estados finita (FSM) independiente del render de sala.
// Consume guiones en JSON (ver /js/data/dialogue/*.json) y no conoce nada de
// ECS ni de Canvas — solo texto, retratos y avance secuencial.
//
// Tipos de nodo soportados:
//   { speaker, portrait, text, typewriterSpeed? }   -> línea normal
//   { type: "ACTION_BEAT", memberId, onComplete }   -> pausa el guion y delega
//                                                      en un handler externo
//   { type: "NARRATION", text }                     -> texto sin retrato (ej.
//                                                      cierres de acto)

const DEFAULT_TYPEWRITER_SPEED = 35; // ms por carácter

export class DialogueSystem {
  /**
   * @param {object} deps
   * @param {(memberId: string, onDone: (info: {hesitationMs:number}) => void) => void} deps.runActionBeat
   *        Handler inyectado por la escena que sepa ejecutar el gesto concreto
   *        de cada personaje (ver sección "Action Beat" del GDD). El sistema
   *        de diálogo no conoce los gestos, solo delega y espera onDone().
   */
  constructor({ runActionBeat } = {}) {
    this._script = [];
    this._index = -1;
    this._runActionBeat = runActionBeat ?? ((memberId, onDone) => onDone({ hesitationMs: 0 }));

    this._currentText = "";
    this._targetText = "";
    this._typeTimer = 0;
    this._typeSpeed = DEFAULT_TYPEWRITER_SPEED;
    this._isTyping = false;
    this._waitingForActionBeat = false;

    this.currentPortrait = null;
    this.currentSpeaker = null;
    this.currentIsCodec = false; // homenaje visual a las llamadas de radio de MGS
    this.onScriptEnd = null; // callback opcional, asignado por la escena
  }

  get isActive() {
    return this._index >= 0 && this._index < this._script.length;
  }

  get displayedText() {
    return this._currentText;
  }

  get isTyping() {
    return this._isTyping;
  }

  load(script) {
    this._script = script;
    this._index = -1;
    this._advance();
  }

  /** Avanza al siguiente nodo. Si el texto actual aún se está escribiendo,
   *  lo completa de golpe en vez de saltar de línea (patrón estándar de
   *  point & click: primer clic completa, segundo clic avanza). */
  advanceOrSkip() {
    if (this._waitingForActionBeat) return; // el Action Beat manda mientras dure
    if (this._isTyping) {
      this._completeTypingInstantly();
      return;
    }
    this._advance();
  }

  update(deltaMs) {
    if (!this._isTyping) return;
    this._typeTimer += deltaMs;
    while (this._typeTimer >= this._typeSpeed && this._currentText.length < this._targetText.length) {
      this._typeTimer -= this._typeSpeed;
      this._currentText = this._targetText.slice(0, this._currentText.length + 1);
    }
    if (this._currentText.length >= this._targetText.length) {
      this._isTyping = false;
    }
  }

  _completeTypingInstantly() {
    this._currentText = this._targetText;
    this._isTyping = false;
  }

  _advance() {
    this._index += 1;
    if (this._index >= this._script.length) {
      this.currentSpeaker = null;
      this.currentPortrait = null;
      this.currentIsCodec = false;
      this._currentText = "";
      this.onScriptEnd?.();
      return;
    }

    const node = this._script[this._index];

    if (node.type === "ACTION_BEAT") {
      this._waitingForActionBeat = true;
      this._runActionBeat(node.memberId, (info) => {
        this._waitingForActionBeat = false;
        // El resultado (hesitationMs) es puramente cosmético según el GDD:
        // nunca debe alterar qué nodo viene a continuación.
        this._advance();
      });
      return;
    }

    this.currentSpeaker = node.speaker ?? null;
    this.currentPortrait = node.type === "NARRATION" ? null : (node.portrait ?? node.speaker ?? null);
    this.currentIsCodec = Boolean(node.isCodec);
    this._targetText = node.text;
    this._currentText = "";
    this._typeTimer = 0;
    this._typeSpeed = node.typewriterSpeed ?? DEFAULT_TYPEWRITER_SPEED;
    this._isTyping = true;
  }
}
