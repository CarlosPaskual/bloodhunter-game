// main.js
// Gestor de escenas deliberadamente mínimo: solo dos tipos de escena en este
// prototipo (mapa y sala). Si el proyecto crece (pantalla de selección del
// Acto 3, escenas de Acto 1/3), este switch se sustituye por un pequeño
// stack de escenas — no hace falta anticiparlo antes de necesitarlo.

import { GameLoop } from "./engine/gameLoop.js";
import { Act1Scene } from "./scenes/act1Scene.js";
import { MapScene } from "./scenes/mapScene.js";
import { DivaRoomScene } from "./scenes/divaRoomScene.js";
import { DaniRoomScene } from "./scenes/daniRoomScene.js";
import { StarlessRoomScene } from "./scenes/starlessRoomScene.js";
import { FabsRoomScene } from "./scenes/fabsRoomScene.js";
import { AdrianRoomScene } from "./scenes/adrianRoomScene.js";
import { PentagonSelectScene } from "./scenes/pentagonSelectScene.js";
import { FinalActIntroScene } from "./scenes/finalActIntroScene.js";
import { FinalActClimaxScene } from "./scenes/finalActClimaxScene.js";
import { EndScene } from "./scenes/endScene.js";

// Fábrica de escenas de sala — las 5 salas del Acto 2 ya están implementadas.
const ROOM_SCENE_CLASSES = {
  diva: DivaRoomScene,
  dani: DaniRoomScene,
  starless: StarlessRoomScene,
  fabs: FabsRoomScene,
  adrian: AdrianRoomScene,
};

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

let currentScene = null;

function goToAct1() {
  currentScene?.destroy?.();
  const scene = new Act1Scene({ onComplete: goToMap });
  scene.load();
  currentScene = scene;
}

function goToMap() {
  currentScene?.destroy?.();
  const scene = new MapScene({
    onRoomSelected: goToRoom,
    onFinalRoomSelected: goToFinalActIntro,
  });
  scene.load();
  currentScene = scene;
}

function goToPentagon() {
  currentScene?.destroy?.();
  currentScene = new PentagonSelectScene({ onSelected: goToFinalActClimax });
}

function goToFinalActIntro() {
  currentScene?.destroy?.();
  const scene = new FinalActIntroScene({ onComplete: goToPentagon });
  scene.load();
  currentScene = scene;
}

function goToFinalActClimax(protagonistId) {
  currentScene?.destroy?.();
  const scene = new FinalActClimaxScene({ protagonistId, onFinished: goToEnd });
  scene.load();
  currentScene = scene;
}

function goToEnd() {
  currentScene?.destroy?.();
  currentScene = new EndScene({ onRestart: goToMap });
}

function goToRoom(memberId) {
  const SceneClass = ROOM_SCENE_CLASSES[memberId];
  if (!SceneClass) {
    alert(`La sala de "${memberId}" todavía no está implementada.`);
    return;
  }
  currentScene?.destroy?.();
  const room = new SceneClass({ memberId, onExit: goToMap });
  room.load(); // carga async del JSON de diálogo; la sala se renderiza en cuanto resuelve
  currentScene = room;
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  currentScene?.handleClick?.(x, y, canvas.width, canvas.height);
});

canvas.addEventListener("mousedown", () => currentScene?.handleMouseDown?.());
canvas.addEventListener("mouseup", () => currentScene?.handleMouseUp?.());
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  currentScene?.handleMouseMove?.(x, y, canvas.width, canvas.height);
});

const loop = new GameLoop({
  update: (deltaMs) => currentScene?.update?.(deltaMs),
  render: () => {
    if (currentScene?.render) {
      currentScene.render(ctx, canvas.width, canvas.height);
    }
  },
});

goToAct1();
loop.start();
