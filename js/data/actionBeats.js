// data/actionBeats.js
// Gesto final de cada personaje (GDD sección 8). Dos tipos de implementación
// bastan para los 5: "hold_release" (Diva) y "multi_click" con distinto
// número de pasos para el resto — el matiz narrativo está en el guion, no en
// la mecánica, que es intencionadamente de fricción mínima.

export const ACTION_BEAT_CONFIG = {
  diva: { type: "hold_release", prompt: "Mantén pulsado para sostener la nota... suelta cuando quieras" },
  dani: { type: "multi_click", steps: 3, prompt: "Toca el riff (clic x3)" },
  starless: { type: "multi_click", steps: 1, prompt: "Mira. Acepta. (clic)" },
  fabs: { type: "multi_click", steps: 4, prompt: "Marca el pulso (clic x4)" },
  adrian: { type: "multi_click", steps: 4, prompt: "Cierra el ciclo (clic x4)" },
};
