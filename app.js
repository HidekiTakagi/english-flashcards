// 英会話メモ 単語学習アプリ
// 状態は localStorage に保存し、リロードしても継続する

const STORAGE_KEY = "english-vocab-app-v1";

// 状態
const state = {
  order: [],          // 表示順 (VOCAB のインデックス配列)
  currentPos: 0,      // order の中での現在位置
  known: {},          // { word: true } 形式で覚えた単語を記録
  onlyUnknown: false  // 覚えていない単語のみフィルター
};

// ---- 初期化 ----
function init() {
  loadState();
  if (state.order.length === 0 || state.order.length !== VOCAB.length) {
    state.order = VOCAB.map((_, i) => i);
  }
  bindEvents();
  render();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
  } catch (e) {
    console.warn("状態の復元に失敗しました", e);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---- 表示対象の単語リスト ----
function getActiveOrder() {
  if (!state.onlyUnknown) return state.order;
  return state.order.filter(i => !state.known[VOCAB[i].word]);
}

function currentVocab() {
  const active = getActiveOrder();
  if (active.length === 0) return null;
  const pos = Math.min(state.currentPos, active.length - 1);
  return { vocab: VOCAB[active[pos]], pos, total: active.length };
}

// ---- 描画 ----
function render() {
  const card = document.getElementById("card");
  card.classList.remove("flipped");

  const current = currentVocab();
  if (!current) {
    document.getElementById("word").textContent = "🎉 全部覚えました！";
    document.getElementById("word-back").textContent = "";
    document.getElementById("meaning").textContent = "";
    document.getElementById("example-en-text").textContent = "";
    document.getElementById("example-ja").textContent = "";
    document.getElementById("note").textContent = "";
    document.getElementById("progress-text").textContent = "0 / 0";
    updateKnownCount();
    return;
  }

  const { vocab, pos, total } = current;
  document.getElementById("word").textContent = vocab.word;
  document.getElementById("word-back").textContent = vocab.word;
  document.getElementById("meaning").textContent = vocab.meaning;
  document.getElementById("example-en-text").textContent = vocab.example_en || "";
  document.getElementById("example-ja").textContent = vocab.example_ja || "";
  document.getElementById("note").textContent = vocab.note ? "📝 " + vocab.note : "";

  document.getElementById("progress-text").textContent = `${pos + 1} / ${total}`;

  if (state.known[vocab.word]) {
    card.classList.add("is-known");
  } else {
    card.classList.remove("is-known");
  }

  updateKnownCount();
}

function updateKnownCount() {
  const count = Object.keys(state.known).filter(k => state.known[k]).length;
  document.getElementById("known-count").textContent = `覚えた: ${count} / ${VOCAB.length}`;
}

// ---- 操作 ----
function flip() {
  document.getElementById("card").classList.toggle("flipped");
}

function next() {
  const active = getActiveOrder();
  if (active.length === 0) return;
  state.currentPos = (state.currentPos + 1) % active.length;
  saveState();
  render();
}

function prev() {
  const active = getActiveOrder();
  if (active.length === 0) return;
  state.currentPos = (state.currentPos - 1 + active.length) % active.length;
  saveState();
  render();
}

function markKnown() {
  const current = currentVocab();
  if (!current) return;
  state.known[current.vocab.word] = true;
  saveState();
  // フィルターONの場合は同じ位置に次の単語が来るのでrender後にcurrentPosを調整する必要なし
  if (state.onlyUnknown) {
    // フィルター時はそのまま表示更新（位置同じで違う単語が出る）
    const active = getActiveOrder();
    if (state.currentPos >= active.length) state.currentPos = 0;
    render();
  } else {
    next();
  }
}

function markUnknown() {
  const current = currentVocab();
  if (!current) return;
  delete state.known[current.vocab.word];
  saveState();
  next();
}

function shuffle() {
  for (let i = state.order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.order[i], state.order[j]] = [state.order[j], state.order[i]];
  }
  state.currentPos = 0;
  saveState();
  render();
}

function reset() {
  if (!confirm("学習状況（覚えた単語）をリセットしますか？")) return;
  state.known = {};
  state.currentPos = 0;
  state.order = VOCAB.map((_, i) => i);
  saveState();
  render();
}

function toggleFilter(e) {
  state.onlyUnknown = e.target.checked;
  state.currentPos = 0;
  saveState();
  render();
}

// ---- 発音 (Web Speech API) ----
function speak(text) {
  if (!text || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.9;
  // 利用可能なら英語の音声を選択
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith("en"));
  if (enVoice) utter.voice = enVoice;
  window.speechSynthesis.speak(utter);
}

function speakCurrentWord(e) {
  e.stopPropagation();
  const current = currentVocab();
  if (current) speak(current.vocab.word);
}

function speakCurrentExample(e) {
  e.stopPropagation();
  const current = currentVocab();
  if (current && current.vocab.example_en) speak(current.vocab.example_en);
}

// ---- イベント登録 ----
function bindEvents() {
  document.getElementById("card").addEventListener("click", flip);
  document.getElementById("flip-btn").addEventListener("click", flip);
  document.getElementById("prev-btn").addEventListener("click", prev);
  document.getElementById("next-btn").addEventListener("click", next);
  document.getElementById("known-btn").addEventListener("click", markKnown);
  document.getElementById("unknown-btn").addEventListener("click", markUnknown);
  document.getElementById("shuffle-btn").addEventListener("click", shuffle);
  document.getElementById("reset-btn").addEventListener("click", reset);
  document.getElementById("only-unknown").addEventListener("change", toggleFilter);
  document.getElementById("speak-word").addEventListener("click", speakCurrentWord);
  document.getElementById("speak-example").addEventListener("click", speakCurrentExample);

  // キーボードショートカット
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    switch (e.key) {
      case "ArrowRight": next(); break;
      case "ArrowLeft": prev(); break;
      case " ": e.preventDefault(); flip(); break;
      case "k": case "K": markKnown(); break;
      case "u": case "U": markUnknown(); break;
      case "s": case "S": speak(currentVocab()?.vocab?.word); break;
    }
  });

  // 音声リストの非同期ロード対応
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }
}

// 初期化（vocab.js 読込済前提）
init();
