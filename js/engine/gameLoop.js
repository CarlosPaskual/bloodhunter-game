// engine/gameLoop.js
// Bucle principal con delta time variable (suficiente para un juego narrativo
// sin física compleja; si en el futuro se añaden mecánicas más sensibles al
// framerate, migrar a un acumulador de paso fijo aquí, en un único sitio).

const MAX_DELTA_MS = 100; // evita "saltos" grandes si la pestaña pierde foco

export class GameLoop {
  constructor({ update, render }) {
    this._update = update;
    this._render = render;
    this._lastTime = 0;
    this._rafId = null;
    this._running = false;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  _tick = (now) => {
    if (!this._running) return;
    const rawDelta = now - this._lastTime;
    this._lastTime = now;
    const deltaMs = Math.min(rawDelta, MAX_DELTA_MS);

    this._update(deltaMs);
    this._render();

    this._rafId = requestAnimationFrame(this._tick);
  };
}
