// engine/humOscillator.js
// Encapsula un GainNode + OscillatorNode para el zumbido grave de la sala de
// Fabs (GDD sección 6: "puede implementarse con Web Audio API estándar, sin
// necesidad de audio espacial 3D"). El AudioContext se crea de forma perezosa
// en el primer setTarget(), ya que los navegadores exigen un gesto del
// usuario antes de permitir reproducir audio.

export class HumOscillator {
  constructor() {
    this._ctx = null;
    this._osc = null;
    this._gain = null;
  }

  _ensureStarted() {
    if (this._ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return; // navegador sin soporte — el puzle sigue siendo jugable sin audio
    this._ctx = new AudioCtx();
    this._osc = this._ctx.createOscillator();
    this._osc.type = "sine";
    this._gain = this._ctx.createGain();
    this._gain.gain.value = 0;
    this._osc.connect(this._gain).connect(this._ctx.destination);
    this._osc.start();
  }

  /** Transición suave a una frecuencia/volumen objetivo (evita "clicks" audibles). */
  setTarget(frequencyHz, volume) {
    this._ensureStarted();
    if (!this._ctx) return;
    const now = this._ctx.currentTime;
    this._osc.frequency.setTargetAtTime(frequencyHz, now, 0.05);
    this._gain.gain.setTargetAtTime(volume, now, 0.08);
  }

  /** Corte abrupto (no gradual) — usado cuando se manipula la válvula. */
  cutAbruptly() {
    if (!this._gain || !this._ctx) return;
    this._gain.gain.cancelScheduledValues(this._ctx.currentTime);
    this._gain.gain.setValueAtTime(0, this._ctx.currentTime);
  }

  stop() {
    if (this._osc) {
      try { this._osc.stop(); } catch (_) { /* ya detenido */ }
      this._osc.disconnect();
    }
    this._gain?.disconnect();
    this._ctx?.close();
    this._ctx = null;
    this._osc = null;
    this._gain = null;
  }
}
