'use strict';

// Menú de pausa (overlay #pause-menu). Se carga antes de game.js y usa
// togglePause() / init() de game.js. El nivel elegido aplica a la próxima partida.
const START_LEVEL_KEY = 'tetris-start-level';
const MAX_START_LEVEL = 15;

const pauseMenu = document.getElementById('pause-menu');
const pauseMain = document.getElementById('pause-main');
const pauseControls = document.getElementById('pause-controls');
const pauseResumeBtn = document.getElementById('pause-resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const pauseControlsBtn = document.getElementById('pause-controls-btn');
const pauseBackBtn = document.getElementById('pause-back-btn');
const startLevelSelect = document.getElementById('start-level');

function loadStartLevel() {
  let v = NaN;
  try { v = parseInt(localStorage.getItem(START_LEVEL_KEY), 10); } catch (e) {}
  return Number.isInteger(v) && v >= 1 && v <= MAX_START_LEVEL ? v : 1;
}

function saveStartLevel(lv) {
  try { localStorage.setItem(START_LEVEL_KEY, String(lv)); } catch (e) {}
}

let nextStartLevel = loadStartLevel();

function showPauseView(controls) {
  pauseMain.classList.toggle('hidden', controls);
  pauseControls.classList.toggle('hidden', !controls);
}

function openPauseMenu() {
  startLevelSelect.value = String(nextStartLevel);
  showPauseView(false);
  pauseMenu.classList.remove('hidden');
  pauseResumeBtn.focus();
}

function closePauseMenu() {
  pauseMenu.classList.add('hidden');
  showPauseView(false);
}

for (let n = 1; n <= MAX_START_LEVEL; n++) {
  const opt = document.createElement('option');
  opt.value = String(n);
  opt.textContent = String(n);
  startLevelSelect.appendChild(opt);
}

pauseResumeBtn.addEventListener('click', () => togglePause());
pauseRestartBtn.addEventListener('click', () => init());
pauseControlsBtn.addEventListener('click', () => showPauseView(true));
pauseBackBtn.addEventListener('click', () => showPauseView(false));
startLevelSelect.addEventListener('change', () => {
  nextStartLevel = parseInt(startLevelSelect.value, 10);
  saveStartLevel(nextStartLevel);
});
