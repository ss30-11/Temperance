'use strict';

// ===================================================
// 1. 要素の取得 & グローバル変数
// ===================================================
const screens = {
  setup: document.getElementById('setup-screen'),
  timer: document.getElementById('timer-screen'),
};
const setupForm = document.getElementById('setup-form');
const desireInput = document.getElementById('desire-input');
const durationTimeInput = document.getElementById('duration-time-input');
const desireDisplay = document.getElementById('desire-display');
const timerDisplay = document.getElementById('timer');

let appData = {};
let timerInterval = null;

// ===================================================
// 2. 初期化処理
// ===================================================
loadData();

// ===================================================
// 3. イベントリスナー
// ===================================================
setupForm.addEventListener('submit', handleSetupSubmit);

// ===================================================
// 4. 関数定義
// ===================================================

function loadData() {
  const savedData = localStorage.getItem('temperanceAppData');
  appData = savedData ? JSON.parse(savedData) : { targetDesire: null, targetEndTime: null };

  if (appData.targetDesire && appData.targetEndTime && appData.targetEndTime > Date.now()) {
    updateDesireDisplay();
    startTimer();
    switchScreen('timer');
  } else {
    switchScreen('setup');
  }
}
function saveData() {
  localStorage.setItem('temperanceAppData', JSON.stringify(appData));
}

function switchScreen(screenKey) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  const nextScreen = screens[screenKey];
  if (nextScreen) nextScreen.classList.add('active');
}

function handleSetupSubmit(event) {
  event.preventDefault();
  appData.targetDesire = desireInput.value;
  const timeValue = durationTimeInput.value; // "HH:MM" または "HH:MM:SS"
  const [hours, minutes, seconds] = timeValue.split(':').map(Number);
  const totalSeconds = (hours * 3600) + (minutes * 60) + (seconds || 0);
  if (totalSeconds <= 0) { alert('目標時間を設定してください。'); return; }

  appData.targetEndTime = Date.now() + (totalSeconds * 1000);
  saveData();
  updateDesireDisplay();
  startTimer();
  switchScreen('timer');
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  updateTimer();
}

function updateTimer() {
  const remainingTime = appData.targetEndTime - Date.now();
  if (remainingTime <= 0) {
    timerDisplay.textContent = "00:00:00";
    clearInterval(timerInterval);

    // 目標達成！データをリセットして設定画面に戻る
    alert("目標達成！素晴らしい！新しい挑戦を始めましょう。");
    appData.targetDesire = null;
    appData.targetEndTime = null;
    saveData();
    switchScreen('setup');
    return;
  }
  timerDisplay.textContent = formatDuration(remainingTime);
}

function updateDesireDisplay() {
  if (desireDisplay) desireDisplay.textContent = appData.targetDesire;
}

function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
