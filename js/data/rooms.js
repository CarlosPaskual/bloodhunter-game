// data/rooms.js
// Un puzzleType por sala, todos convergen en gameState.completeObjective().
// Solo "reread" (Diva) está implementado end-to-end en este prototipo; el
// resto queda declarado como referencia de datos para cuando se implementen
// sus handlers — el 90% del código de gestión de estado ya es compartido.

export const ROOM_PUZZLES = {
  diva: {
    puzzleType: "reread",
    dialoguePath: "js/data/dialogue/diva.json",
    trigger: { object: "notebook", requiredInteractions: 2 },
  },
  dani: {
    puzzleType: "observation",
    dialoguePath: "js/data/dialogue/dani.json", // pendiente de crear
    trigger: { object: "misplaced_case" },
  },
  starless: {
    puzzleType: "timing_compare",
    dialoguePath: "js/data/dialogue/starless.json", // pendiente de crear
    trigger: { objects: ["mirror_1", "mirror_2", "mirror_3"], correctId: "mirror_2" },
  },
  fabs: {
    puzzleType: "audio_compare",
    dialoguePath: "js/data/dialogue/fabs.json", // pendiente de crear
    trigger: { objects: ["pipe_1", "pipe_2", "pipe_3"], correctId: "pipe_3" },
  },
  adrian: {
    puzzleType: "find_and_play",
    dialoguePath: "js/data/dialogue/adrian.json", // pendiente de crear
    trigger: { object: "demo_tape" },
  },
};
