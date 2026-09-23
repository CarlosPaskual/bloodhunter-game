// engine/imageLoader.js
// Carga perezosa y cacheada de imágenes (fondos, sprites). Cada ruta se
// carga una sola vez aunque varias escenas la pidan; el resultado es una
// promesa reutilizable, no la imagen directamente, para que llamadas
// concurrentes a la misma ruta no disparen cargas duplicadas.

const cache = new Map();

export function loadImage(path) {
  if (cache.has(path)) return cache.get(path);

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${path}`));
    img.src = path;
  });

  cache.set(path, promise);
  return promise;
}
