# Bloodhunter — Terror Psicológico

Videojuego pixel-art de terror psicológico en HTML5/JavaScript vanilla (Canvas2D, sin frameworks ni build step), protagonizado por la banda real de death metal **Bloodhunter**.

## Premisa

La banda encuentra un libro prohibido. Usarlo para componer mejora radicalmente su música — pero a un coste ambiguo que el juego nunca confirma del todo. El disco resultante es su obra maestra.

Referencias de diseño: **Metal Gear** (narrativa cinemática, homenaje a los codec calls) y **Monkey Island** (exploración tipo hub, diálogo como mecánica central, sin combate).

## Cómo jugar / probarlo localmente

El juego usa módulos ES (`import`/`export`), por lo que **no funciona abriendo `index.html` directamente** (los navegadores bloquean módulos sobre `file://`). Hay que servirlo por HTTP:

```bash
# Desde la raíz del proyecto
python3 -m http.server 8000
# Abrir http://localhost:8000 en el navegador
```

O con la extensión **Live Server** de VS Code (clic derecho sobre `index.html` → "Open with Live Server").

## Estructura del proyecto

```
├── index.html
├── style.css
├── assets/
│   ├── backgrounds/     # fondos de sala (arte real, se añaden progresivamente)
│   └── characters/      # sprites de personaje (arte real, se añaden progresivamente)
├── js/
│   ├── main.js          # punto de entrada, gestor de escenas
│   ├── engine/           # game loop, event bus, estado global, diálogo, render, audio
│   ├── data/             # fuente de verdad: personajes, puzles, guion (JSON), assets por sala
│   └── scenes/           # mapa, las 5 salas, pentáculo de selección, Acto 3
```

**Arquitectura clave:** todo el guion vive en JSON (`js/data/dialogue/*.json`), separado del motor. Las 5 salas comparten una única clase base (`BaseRoomScene`) y un único sistema de render de sala (`renderRoom`) — añadir arte real a una sala es cuestión de una entrada en `js/data/roomAssets.js`, sin tocar código.

## Estado actual

- [x] Motor: game loop, event bus, estado global (objetivos, tensión, distorsión por sala)
- [x] Sistema de diálogo con efecto typewriter y retratos
- [x] Acto 1 (el hallazgo) jugable, con arte real del Almacén
- [x] Las 5 salas del Acto 2 jugables de extremo a extremo, todas con fondo y sprite reales (Diva, Dani, Starless, Fabs, Adrián)
- [x] Mapa/hub con arte real (mapa isométrico del local) y desbloqueo de sala final
- [x] Pantalla de selección de personaje (pentáculo) para el Acto 3
- [x] Acto 3 completo (clímax, reacciones, cierre), con arte real de la sala de grabación conjunta
- [x] Los 3 actos encadenados de principio a fin: Acto 1 → mapa → 5 salas → Acto 3 → fin
- [ ] Retratos de diálogo dedicados (por ahora la caja de diálogo sigue mostrando un cuadrado de color con la inicial del personaje, no un retrato real)
- [ ] Corregir el sprite de Starless (pelo demasiado similar al de Dani — ver nota en el repo)
- [ ] Audio real (solo la sala de Fabs tiene audio real por proximidad; el resto son marcadores)

## Nota sobre el uso de nombres e imágenes reales

Este es un proyecto oficial hecho con la participación de la banda, usando sus nombres reales. La trama es una leyenda ficcionalizada protagonizada por la banda (en la línea de proyectos como GWAR o Dethklok), no una biografía literal.
