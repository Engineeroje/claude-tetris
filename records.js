'use strict';

// Tabla de records local (localStorage 'tetris-records').
// Se carga antes que game.js; game.js llama a refreshRecordHint, onGameStart,
// onGameOver y hideRecordsOverlay.

const REC_KEY = 'tetris-records';
const REC_TOP_SIZE = 5;
const REC_NAME_MAX = 12;
const REC_DEFAULT_NAME = 'JUGADOR';

function recDefaults() {
  return { top: [], bestCombo: 0, maxLines: 0 };
}

function recNonNegInt(v) {
  return Number.isInteger(v) && v >= 0 ? v : 0;
}

function recParse(raw) {
  const data = JSON.parse(raw);
  const out = recDefaults();
  if (!data || typeof data !== 'object') return out;
  if (Array.isArray(data.top)) {
    out.top = data.top
      .filter(e => e && typeof e === 'object' && typeof e.name === 'string')
      .map(e => ({
        name: e.name.trim().slice(0, REC_NAME_MAX) || REC_DEFAULT_NAME,
        score: recNonNegInt(e.score),
        lines: recNonNegInt(e.lines),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, REC_TOP_SIZE);
  }
  out.bestCombo = recNonNegInt(data.bestCombo);
  out.maxLines = recNonNegInt(data.maxLines);
  return out;
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(REC_KEY);
    if (raw) return recParse(raw);
  } catch (e) {}
  return recDefaults();
}

function saveRecords() {
  try { localStorage.setItem(REC_KEY, JSON.stringify(recData)); } catch (e) {}
}

let recData = loadRecords();
let recHighlight = -1;   // índice de la fila recién insertada
let recPending = null;   // {score, lines} mientras se espera el nombre

const recHintEl = document.getElementById('record-hint');
const recListEl = document.getElementById('records-list');
const recOverlayListEl = document.getElementById('overlay-records');
const recBestComboEl = document.getElementById('best-combo');
const recMaxLinesEl = document.getElementById('max-lines');
const recOverlayExtraEl = document.getElementById('overlay-extra');
const recFormEl = document.getElementById('record-form');
const recNameInputEl = document.getElementById('name-input');
const recResetBtnEl = document.getElementById('records-reset');

function recQualifies(points) {
  if (points <= 0) return false;
  const top = recData.top;
  return top.length < REC_TOP_SIZE || points > top[top.length - 1].score;
}

function recRenderList(listEl) {
  listEl.replaceChildren();
  if (recData.top.length === 0) {
    const li = document.createElement('li');
    li.className = 'rec-empty';
    li.textContent = 'Sin records aún';
    listEl.appendChild(li);
    return;
  }
  recData.top.forEach((entry, i) => {
    const li = document.createElement('li');
    if (i === recHighlight) li.className = 'rec-new';
    const name = document.createElement('span');
    name.className = 'rec-name';
    name.textContent = entry.name;
    const score = document.createElement('span');
    score.className = 'rec-score';
    score.textContent = entry.score.toLocaleString();
    li.append(name, score);
    listEl.appendChild(li);
  });
}

function recRenderAll() {
  recRenderList(recListEl);
  recRenderList(recOverlayListEl);
  recBestComboEl.textContent = recData.bestCombo;
  recMaxLinesEl.textContent = recData.maxLines;
}

// Llamado desde updateHUD(): indicador en el panel si la puntuación actual entra en el top.
function refreshRecordHint(points) {
  recHintEl.classList.toggle('hidden', !recQualifies(points));
}

// Llamado desde init().
function onGameStart() {
  recPending = null;
  recHighlight = -1;
  recOverlayExtraEl.classList.add('hidden');
  recRenderAll();
}

// Llamado desde endGame().
function onGameOver(points, totalLines, bestCombo) {
  let changed = false;
  if (bestCombo > recData.bestCombo) { recData.bestCombo = bestCombo; changed = true; }
  if (totalLines > recData.maxLines) { recData.maxLines = totalLines; changed = true; }
  if (changed) saveRecords();

  recHintEl.classList.add('hidden');
  recHighlight = -1;
  recRenderAll();

  recPending = recQualifies(points) ? { score: points, lines: totalLines } : null;
  recFormEl.classList.toggle('hidden', !recPending);
  recOverlayExtraEl.classList.remove('hidden');
  if (recPending) {
    recNameInputEl.value = '';
    recNameInputEl.focus();
  }
}

recFormEl.addEventListener('submit', e => {
  e.preventDefault();
  if (!recPending) return;
  const name = recNameInputEl.value.trim().slice(0, REC_NAME_MAX) || REC_DEFAULT_NAME;
  const entry = { name, score: recPending.score, lines: recPending.lines };
  recPending = null;

  // recQualifies() garantiza pos < REC_TOP_SIZE
  let pos = recData.top.findIndex(en => entry.score > en.score);
  if (pos === -1) pos = recData.top.length;
  recData.top.splice(pos, 0, entry);
  recData.top = recData.top.slice(0, REC_TOP_SIZE);
  recHighlight = pos;

  saveRecords();
  recFormEl.classList.add('hidden');
  recRenderAll();
});

recResetBtnEl.addEventListener('click', () => {
  recResetBtnEl.blur();
  if (!confirm('¿Borrar todos los records? Esta acción no se puede deshacer.')) return;
  recData = recDefaults();
  saveRecords();
  recHighlight = -1;
  onGameStart();
  refreshRecordHint(gameOver ? 0 : score);
});

recRenderAll();
