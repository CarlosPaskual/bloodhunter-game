// data/roomAssets.js
// Fuente única de verdad de qué arte real existe ya para cada sala. Mientras
// una entrada no exista aquí, la sala sigue usando el placeholder geométrico
// de roomRenderer.js — así se puede avanzar sala por sala sin bloquear nada.

export const ROOM_ASSETS = {
  adrian: {
    background: "assets/backgrounds/adrian_backline.png",
    sprite: "assets/characters/adrian.png",
  },
  diva: {
    background: "assets/backgrounds/diva_vocal_booth.png",
    sprite: "assets/characters/diva.png",
  },
  dani: {
    background: "assets/backgrounds/dani_guitar_workshop.png",
    sprite: "assets/characters/dani.png",
  },
  starless: {
    background: "assets/backgrounds/starless_mirror_backstage.png",
    sprite: "assets/characters/starless.png",
  },
  fabs: {
    background: "assets/backgrounds/fabs_boiler_room.png",
    sprite: "assets/characters/fabs.png",
  },
};
