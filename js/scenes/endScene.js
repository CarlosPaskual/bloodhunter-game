// scenes/endScene.js
// Cierre puramente narrativo — sin puntuación ni "game over" (GDD sección 8).
// El clic para volver al mapa es solo comodidad de testing; en una build
// final esto podría ser créditos o simplemente quedarse en negro.

export class EndScene {
  constructor({ onRestart }) {
    this._onRestart = onRestart;
  }

  handleClick() {
    this._onRestart();
  }

  update() {}

  render(ctx, width, height) {
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#e8e4da";
    ctx.font = "28px monospace";
    ctx.textAlign = "center";
    ctx.fillText("FIN", width / 2, height / 2 - 10);
    ctx.font = "12px monospace";
    ctx.fillStyle = "#8fa5b8";
    ctx.fillText("(clic para volver al mapa — solo para pruebas)", width / 2, height / 2 + 30);
  }
}
