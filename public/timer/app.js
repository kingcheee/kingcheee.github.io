/* ── Turtle Timer — app.js ── */
'use strict';

const $ = (id) => document.getElementById(id);
const pad2 = (n) => String(n).padStart(2, '0');
const HOUR_MS = 60 * 60 * 1000;
const MAX_MIN = 99 * 60 + 59;

// H:MM:SS when `hours` is set, otherwise MM:SS (minutes may run past 59)
function formatClock(totalSec, hours) {
  const s = totalSec % 60;
  if (!hours) return pad2(Math.floor(totalSec / 60)) + ':' + pad2(s);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return h + ':' + pad2(m) + ':' + pad2(s);
}

// H:MM:SS → .long, HH:MM:SS → .xlong (smaller digits so the line still fits)
function sizeClass(el, text) {
  el.classList.toggle('long', text.length === 7);
  el.classList.toggle('xlong', text.length >= 8);
}

function setTitle(text) {
  document.title = text ? text + ' · Turtle Timer' : 'Turtle Timer';
}

/* ════════════════════════════════════════════════════════
   Timer
   ════════════════════════════════════════════════════════ */
let state = 'idle';            // 'idle' | 'running' | 'paused' | 'completed'
let endTime = 0;               // absolute ms when the countdown finishes
let pausedRemaining = 0;       // ms left when paused
let durationMs = 25 * 60 * 1000;
let showHours = false;         // format is fixed per run so digits never jump in size
let intervalId = null;         // display refresh
let deadlineId = null;         // one-shot completion (survives background throttling)

const timerDisplay = $('timer-display');
const statusLabel = $('status-label');
const btnStart = $('btn-start');
const btnPause = $('btn-pause');
const btnReset = $('btn-reset');
const hourInput = $('hour-input');
const minInput = $('min-input');
const btnInc = $('btn-inc');
const btnDec = $('btn-dec');
const completionBanner = $('completion-banner');

function renderTimer(remainingMs) {
  const text = formatClock(Math.max(0, Math.ceil(remainingMs / 1000)), showHours);
  timerDisplay.textContent = text;
  sizeClass(timerDisplay, text);
  if (mode === 'timer') setTitle(state === 'running' || state === 'paused' ? text : '');
}

function updateTimerUI() {
  const labels = { idle: 'Ready', running: 'Focusing', paused: 'Paused', completed: 'Done' };
  statusLabel.textContent = labels[state];
  btnStart.textContent = state === 'paused' ? 'Resume' : 'Start';
  btnStart.disabled = (state === 'running');
  btnPause.disabled = (state !== 'running');
  btnReset.disabled = (state === 'idle');
  const locked = (state !== 'idle');
  [hourInput, minInput, btnInc, btnDec].forEach((el) => { el.disabled = locked; });
  completionBanner.hidden = (state !== 'completed');
}

function clearTimers() {
  clearInterval(intervalId);
  clearTimeout(deadlineId);
  intervalId = deadlineId = null;
}

function armTimers(remainingMs) {
  intervalId = setInterval(tick, 200);
  // setInterval gets throttled to once a minute in long-hidden tabs; a single
  // setTimeout scheduled from a user gesture does not, so completion stays on time.
  deadlineId = setTimeout(tick, remainingMs + 5);
}

function start() {
  if (state === 'running') return;
  if (state === 'completed') state = 'idle';   // Start after Done = run again

  if (state === 'idle') {
    const minutes = readMinutes();
    writeMinutes(minutes);
    durationMs = minutes * 60 * 1000;
    showHours = durationMs >= HOUR_MS;
    endTime = Date.now() + durationMs;
  } else {                                     // paused
    endTime = Date.now() + pausedRemaining;
  }

  state = 'running';
  updateTimerUI();
  renderTimer(endTime - Date.now());
  armTimers(endTime - Date.now());

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  unlockAudio();
}

function pause() {
  if (state !== 'running') return;
  pausedRemaining = endTime - Date.now();
  state = 'paused';
  clearTimers();
  updateTimerUI();
  renderTimer(pausedRemaining);
}

function reset() {
  clearTimers();
  state = 'idle';
  pausedRemaining = 0;
  showHours = durationMs >= HOUR_MS;
  updateTimerUI();
  renderTimer(durationMs);
}

function tick() {
  if (state !== 'running') return;
  const remaining = endTime - Date.now();
  if (remaining <= 0) { complete(); return; }
  renderTimer(remaining);
}

function complete() {
  clearTimers();
  state = 'completed';
  updateTimerUI();
  renderTimer(0);
  playChime();
  showNotification();
}

// ── h / min fields ──
function fieldValues() {
  const h = parseInt(hourInput.value, 10) || 0;
  const m = parseInt(minInput.value, 10) || 0;
  return [Math.max(0, h), Math.max(0, m)];
}

// Minutes are read raw (not clamped to 59) so typing "90 min" means 1 h 30 min.
function readMinutes() {
  const [h, m] = fieldValues();
  return Math.min(MAX_MIN, Math.max(1, h * 60 + m));
}

function setField(el, v) {               // only touch the field when it actually changes
  if (el.value !== String(v)) el.value = v;
}

function writeMinutes(total) {
  total = Math.min(MAX_MIN, Math.max(1, total));
  setField(hourInput, Math.floor(total / 60));
  setField(minInput, total % 60);
}

function previewDuration() {              // while typing: update the big digits only
  if (state !== 'idle') return;
  durationMs = readMinutes() * 60 * 1000;
  showHours = durationMs >= HOUR_MS;
  renderTimer(durationMs);
}

function normalizeFields() {              // on blur: carry minutes past 59 into hours
  if (state !== 'idle') return;
  const [h, m] = fieldValues();
  if (m > 59 || h > 99) writeMinutes(h * 60 + m);
  else { setField(hourInput, h); setField(minInput, m); }
  previewDuration();
}

function stepMinutes(delta) {
  if (state !== 'idle') return;
  writeMinutes(readMinutes() + delta);
  previewDuration();
}

/* ════════════════════════════════════════════════════════
   Stopwatch
   ════════════════════════════════════════════════════════ */
let swState = 'idle';          // 'idle' | 'running' | 'stopped'
let swStartTime = 0;           // Date.now() minus elapsed at start
let swElapsed = 0;
let swRaf = null;
let swLastTitle = '';

const swDisplay = $('sw-display');
const swMain = $('sw-main');
const swCs = $('sw-cs');
const swStatus = $('sw-status');
const swBtnStart = $('sw-start');
const swBtnStop = $('sw-stop');
const swBtnReset = $('sw-reset');

function renderStopwatch(ms) {
  const hours = ms >= HOUR_MS;
  const main = formatClock(Math.floor(ms / 1000), hours);
  swMain.textContent = main;
  swCs.textContent = '.' + pad2(Math.floor((ms % 1000) / 10));
  sizeClass(swDisplay, main);
  if (mode === 'stopwatch' && main !== swLastTitle) {
    swLastTitle = main;
    setTitle(swState === 'idle' ? '' : main);
  }
}

function updateStopwatchUI() {
  swStatus.textContent = { idle: 'Ready', running: 'Running', stopped: 'Stopped' }[swState];
  swBtnStart.textContent = swState === 'stopped' ? 'Resume' : 'Start';
  swBtnStart.disabled = (swState === 'running');
  swBtnStop.disabled = (swState !== 'running');
  swBtnReset.disabled = (swState === 'idle');
}

function swFrame() {
  renderStopwatch(Date.now() - swStartTime);
  swRaf = requestAnimationFrame(swFrame);
}

function swStart() {
  if (swState === 'running') return;
  swStartTime = Date.now() - swElapsed;
  swState = 'running';
  updateStopwatchUI();
  swFrame();
}

function swStop() {
  if (swState !== 'running') return;
  cancelAnimationFrame(swRaf);
  swElapsed = Date.now() - swStartTime;
  swState = 'stopped';
  updateStopwatchUI();
  renderStopwatch(swElapsed);
}

function swReset() {
  cancelAnimationFrame(swRaf);
  swElapsed = 0;
  swState = 'idle';
  updateStopwatchUI();
  renderStopwatch(0);
}

/* ════════════════════════════════════════════════════════
   Sound + notification
   ════════════════════════════════════════════════════════ */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function unlockAudio() {                  // call from a user gesture
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
  } catch (e) { /* no audio */ }
}

// Soft bell: E5 G5 C6 twice, each note plucked with an exponential decay.
function playChime() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime + 0.05;
    const freqs = [659.25, 783.99, 1046.5];
    [0, 0.18, 0.36, 1.1, 1.28, 1.46].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freqs[i % 3];
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = t0 + offset;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      osc.start(t);
      osc.stop(t + 0.75);
    });
  } catch (e) {
    console.warn('Sound playback failed:', e);
  }
}

function showNotification() {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const n = new Notification('Turtle Timer', {
      body: 'done. take a break.',
      tag: 'turtle-timer'               // replaces the previous one instead of stacking
    });
    n.onclick = () => { window.focus(); n.close(); };
  } catch (e) {
    console.warn('Notification failed:', e);
  }
}

/* ════════════════════════════════════════════════════════
   Mode tabs — both clocks keep running while hidden
   ════════════════════════════════════════════════════════ */
let mode = 'timer';
const panels = {
  timer: { tab: $('tab-timer'), panel: $('panel-timer') },
  stopwatch: { tab: $('tab-stopwatch'), panel: $('panel-stopwatch') }
};

function showMode(next) {
  mode = next;
  Object.entries(panels).forEach(([name, { tab, panel }]) => {
    const active = name === next;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    panel.hidden = !active;
  });
  swLastTitle = '';
  if (mode === 'timer') renderTimer(state === 'running' ? endTime - Date.now() : state === 'paused' ? pausedRemaining : durationMs);
  else renderStopwatch(swState === 'running' ? Date.now() - swStartTime : swElapsed);
}

/* ════════════════════════════════════════════════════════
   Events
   ════════════════════════════════════════════════════════ */
btnStart.addEventListener('click', start);
btnPause.addEventListener('click', pause);
btnReset.addEventListener('click', reset);
btnInc.addEventListener('click', () => stepMinutes(5));
btnDec.addEventListener('click', () => stepMinutes(-5));
[hourInput, minInput].forEach((el) => {
  el.addEventListener('input', previewDuration);
  el.addEventListener('blur', normalizeFields);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { el.blur(); start(); } });
});

swBtnStart.addEventListener('click', swStart);
swBtnStop.addEventListener('click', swStop);
swBtnReset.addEventListener('click', swReset);

Object.entries(panels).forEach(([name, { tab }]) => {
  tab.addEventListener('click', () => showMode(name));
});

// Space = start/stop, R = reset (not while typing in a field)
document.addEventListener('keydown', (e) => {
  if (e.target.matches('input') || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === 'Space') {
    e.preventDefault();
    if (mode === 'timer') (state === 'running' ? pause : start)();
    else (swState === 'running' ? swStop : swStart)();
  } else if (e.key === 'r' || e.key === 'R') {
    (mode === 'timer' ? reset : swReset)();
  }
});

// Coming back to the tab: redraw right away instead of waiting for the next tick
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (state === 'running') tick();
  if (swState === 'running') renderStopwatch(Date.now() - swStartTime);
});

/* ── Init ── */
updateTimerUI();
renderTimer(durationMs);
updateStopwatchUI();
renderStopwatch(0);
