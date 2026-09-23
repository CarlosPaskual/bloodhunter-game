// data/characters.js
// Fuente única de verdad reutilizada por: render de sprites, iconos del mapa,
// pantalla de selección de personaje (pentáculo) y UI de diálogo.
// Ver GDD sección 4 (fichas de personaje) y sección 9 (UI/UX - pentáculo).

export const CHARACTERS = {
  diva: {
    name: "Diva Satánica",
    accentColor: "#6b1620",
    prop: "pendant",
    locationId: "vocal_booth",
    vertex: "TOP",
  },
  fabs: {
    name: "Fabs Tejeda",
    accentColor: "#2d4a35",
    prop: "earring_glint",
    locationId: "boiler_room",
    vertex: "UPPER_LEFT",
  },
  starless: {
    name: "G. Starless",
    accentColor: "#8fa5b8",
    prop: "bracelets",
    locationId: "mirror_backstage",
    vertex: "UPPER_RIGHT",
  },
  dani: {
    name: "Dani Arcos",
    accentColor: "#c9922e",
    prop: "guitar_pick",
    locationId: "guitar_workshop",
    vertex: "LOWER_LEFT",
  },
  adrian: {
    name: "Adrián Perales",
    accentColor: "#b5541f",
    prop: "drumsticks",
    locationId: "backline_storage",
    vertex: "LOWER_RIGHT",
  },
};

export const ALL_MEMBER_IDS = Object.keys(CHARACTERS);

// Ángulos del pentáculo (grados, 0° = derecha, sentido horario en canvas).
// TOP arriba, resto en orden de "lectura visual" según la referencia confirmada.
export const VERTEX_ANGLES = {
  TOP: -90,
  UPPER_LEFT: 198,
  UPPER_RIGHT: -18,
  LOWER_LEFT: 126,
  LOWER_RIGHT: 54,
};

export function getVertexPosition(vertexName, centerX, centerY, radius) {
  const rad = (VERTEX_ANGLES[vertexName] * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY + radius * Math.sin(rad),
  };
}
