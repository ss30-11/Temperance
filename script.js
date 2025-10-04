'use strict';

// 1. 要素の取得 & グローバル変数
const screens = {
  setup: document.getElementById('setup-screen'),
  timer: document.getElementById('timer-screen'),
  result: document.getElementById('result-screen'),
};
const setupForm = document.getElementById('setup-form');
const desireInput = document.getElementById('desire-input');
const durationTimeInput = document.getElementById('duration-time-input');
const desireDisplay = document.getElementById('desire-display');
const timerDisplay = document.getElementById('timer');
const resetBtn = document.getElementById('reset-btn');
const reviewTextareas = document.querySelectorAll('#timer-screen .review-steps textarea');
const resultButtons = document.querySelectorAll('.result-buttons .btn');
const resultMessage = document.querySelector('.result-message');

let appData = {};
let timerInterval = null;

// 2. 初期化処理
loadData();

// 3. イベントリスナー
setupForm.addEventListener('submit', handleSetupSubmit);
resetBtn.addEventListener('click', handleGiveUp);
resultButtons.forEach(button => {
  button.addEventListener('click', () => handleResultSelection(button.dataset.result));
});

// 4. 関数定義
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
  const [hours, minutes, seconds] = durationTimeInput.value.split(':').map(Number);
  const totalSeconds = (hours * 3600) + (minutes * 60) + (seconds || 0);
  if (totalSeconds <= 0) { alert('向き合う時間を設定してください。'); return; }

  appData.targetEndTime = Date.now() + (totalSeconds * 1000);
  saveData();
  updateDesireDisplay();
  startTimer();
  switchScreen('timer');
}

function handleGiveUp() {
  if (confirm("本当にギブアップしますか？")) {
    showResultScreen("fail");
  }
}

function handleResultSelection(result) {
  // ここに将来的に履歴を保存するロジックを追加できる
  // const record = { result, notes: ... };
  // appData.history.push(record);

  // アプリの状態をリセット
  appData.targetDesire = null;
  appData.targetEndTime = null;
  saveData();

  // フォームをリセットして設定画面に戻る
  reviewTextareas.forEach(textarea => textarea.value = '');
  switchScreen('setup');
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
    showResultScreen("succeed"); // 時間満了＝成功
    return;
  }
  timerDisplay.textContent = formatDuration(remainingTime);
}

function showResultScreen(resultType) {
  let message = "";
  if (resultType === "succeed") {
    message = "素晴らしい！見事に衝動の波を乗り越えましたね。この成功体験が、あなたの心の筋肉を確実に鍛えています。";
  } else { // fail or postpone
    message = "お疲れ様でした。一度立ち止まって、このアプリを起動したこと自体が素晴らしい第一歩です。";
  }
  resultMessage.textContent = message;
  switchScreen('result');
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
