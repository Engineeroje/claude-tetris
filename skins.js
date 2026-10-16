'use strict';

// Skins visuales. Debe cargarse ANTES de game.js.
// Usa shineColor (game.js) y COLORS (game.js) de forma perezosa, en tiempo de dibujo.

const SKIN_KEY = 'tetris-skin';
const SKIN_DEFAULT = 'retro';

function roundRectPath(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

const SKINS = {
  retro: {
    // Idéntico al dibujo original: colores planos + brillo superior.
    get colors() { return COLORS; },
    drawBlock(context, x, y, colorIndex, size, alpha) {
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.colors[colorIndex];
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      context.fillStyle = shineColor;
      context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
      context.globalAlpha = 1;
    },
  },

  neon: {
    colors: [null, '#00fff7', '#fff700', '#d400ff', '#39ff14', '#ff0055', '#0099ff', '#ff8800', '#ffffff'],
    drawBlock(context, x, y, colorIndex, size, alpha) {
      const color = this.colors[colorIndex];
      context.globalAlpha = alpha ?? 1;
      context.shadowColor = color;
      context.shadowBlur = size * 0.5;
      context.fillStyle = color;
      context.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
      context.shadowBlur = 0;
      // núcleo brillante del tubo
      context.globalAlpha = (alpha ?? 1) * 0.5;
      context.fillStyle = '#ffffff';
      context.fillRect(x * size + size * 0.35, y * size + size * 0.35, size * 0.3, size * 0.3);
      context.globalAlpha = 1;
    },
  },

  pastel: {
    colors: [null, '#b5ead7', '#fff1a8', '#e0bbe4', '#c7f9cc', '#ffb3ba', '#bae1ff', '#ffdfba', '#d8d8e8'],
    drawBlock(context, x, y, colorIndex, size, alpha) {
      const px = x * size + 1, py = y * size + 1, s = size - 2;
      context.globalAlpha = alpha ?? 1;
      roundRectPath(context, px, py, s, s, size * 0.2);
      context.fillStyle = this.colors[colorIndex];
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      context.stroke();
      // reflejo suave
      roundRectPath(context, px + 4, py + 3, s - 8, 5, 2);
      context.fillStyle = 'rgba(255, 255, 255, 0.45)';
      context.fill();
      context.globalAlpha = 1;
    },
  },

  pixel: {
    colors: [null, '#00b8d4', '#ffc107', '#8e24aa', '#43a047', '#e53935', '#1e88e5', '#fb8c00', '#90a4ae'],
    drawBlock(context, x, y, colorIndex, size, alpha) {
      const px = x * size + 1, py = y * size + 1, s = size - 2;
      const p = Math.max(2, Math.round(size / 10)); // tamaño de "píxel"
      const n = Math.floor(s / p);
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.colors[colorIndex];
      context.fillRect(px, py, s, s);
      // bisel: luz arriba-izquierda, sombra abajo-derecha
      context.fillStyle = 'rgba(255, 255, 255, 0.45)';
      context.fillRect(px, py, s, p);
      context.fillRect(px, py, p, s);
      context.fillStyle = 'rgba(0, 0, 0, 0.35)';
      context.fillRect(px, py + s - p, s, p);
      context.fillRect(px + s - p, py, p, s);
      // textura: píxeles oscuros en patrón interno
      context.fillStyle = 'rgba(0, 0, 0, 0.18)';
      for (let i = 2; i < n - 2; i++)
        for (let j = 2; j < n - 2; j++)
          if ((i + j) % 3 === 0) context.fillRect(px + i * p, py + j * p, p, p);
      context.globalAlpha = 1;
    },
  },
};

const skinSelect = document.getElementById('skin-select');
let activeSkinName = SKIN_DEFAULT;
let activeSkin = SKINS[SKIN_DEFAULT];

function hasSkin(name) {
  return Object.prototype.hasOwnProperty.call(SKINS, name);
}

function loadSkin() {
  try {
    const saved = localStorage.getItem(SKIN_KEY);
    if (saved && hasSkin(saved)) return saved;
  } catch (e) {}
  return SKIN_DEFAULT;
}

function applySkin(name) {
  const key = hasSkin(name) ? name : SKIN_DEFAULT;
  activeSkinName = key;
  activeSkin = SKINS[key];
  document.documentElement.dataset.skin = key;
  skinSelect.value = key;
  try { localStorage.setItem(SKIN_KEY, key); } catch (e) {}
  // redibuja al instante (importa en pausa o game over); current no existe aún en el arranque
  if (typeof current !== 'undefined' && current) {
    draw();
    drawNext();
  }
}

skinSelect.addEventListener('change', () => {
  applySkin(skinSelect.value);
  skinSelect.blur();
});
