// 英会話メモ 単語学習アプリ
// 状態は localStorage に保存し、リロードしても継続する

const STORAGE_KEY = "english-vocab-app-v1";
const VOCAB_URL = "vocab.json"; // 同じディレクトリの vocab.json を読み込む
const REPO_OWNER = "HidekiTakagi";
const REPO_NAME = "english-flashcards";
const PAT_KEY = "english-vocab-app-pat-v1";

let VOCAB = [];

// 状態
const state = {
  order: [],
  currentPos: 0,
  known: {},
  onlyUnknown: false
};

// ---- 初期化 ----
async function init() {
  bindEvents();
  await loadVocab();
  loadState();
  if (state.order.length === 0 || state.order.length !== VOCAB.length) {
    state.order = VOCAB.map((_, i) => i);
  }
  render();
}

async function loadVocab() {
  try {
    // キャッシュ対策のためタイムスタンプを付ける
    const resp = await fetch(`${VOCAB_URL}?t=${Date.now()}`);
    if (!resp.ok) throw new Error("vocab.json の取得に失敗: " + resp.status);
    const data = await resp.json();
    VOCAB = data.words || [];
  } catch (e) {
    console.error(e);
    document.getElementById("word").textContent = "⚠ データ読込エラー";
    document.getElementById("hint-message")?.replaceChildren(
      document.createTextNode("vocab.json を読み込めませんでした。ブラウザではなく Webサーバー経由で開いてください (GitHub Pages の URL など)")
    );
    VOCAB = [];
  }
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
    document.getElementById("word").textContent = VOCAB.length === 0
      ? "単語がまだありません"
      : "🎉 全部覚えました！";
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
  if (state.onlyUnknown) {
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

// ---- 単語追加モーダル ----
function openAddModal() {
  document.getElementById("add-modal").classList.add("open");
  document.getElementById("input-word").focus();
}

function closeAddModal() {
  document.getElementById("add-modal").classList.remove("open");
  document.getElementById("add-form").reset();
  document.getElementById("add-status").textContent = "";
  document.getElementById("add-status").className = "add-status";
}

function getPat() {
  return localStorage.getItem(PAT_KEY) || "";
}

function setPat(token) {
  if (token) localStorage.setItem(PAT_KEY, token);
  else localStorage.removeItem(PAT_KEY);
}

async function configurePat() {
  const current = getPat();
  const msg = current
    ? `現在保存されているトークン: ${current.slice(0, 7)}...${current.slice(-4)}\n\n新しいトークンを入力（空欄で削除）：`
    : "GitHub Personal Access Token を入力してください。\n\n取得方法:\n1. https://github.com/settings/tokens にアクセス\n2. 「Generate new token (classic)」を選択\n3. Note: english-flashcards、Expiration: 90日、Scopes: repo にチェック\n4. 生成されたトークン (ghp_xxx) をここに貼り付け";
  const token = prompt(msg, "");
  if (token === null) return; // キャンセル
  setPat(token.trim());
  alert(token.trim() ? "トークンを保存しました" : "トークンを削除しました");
}

async function submitNewWord(e) {
  e.preventDefault();
  const word = document.getElementById("input-word").value.trim();
  const meaning = document.getElementById("input-meaning").value.trim();
  const example_en = document.getElementById("input-example-en").value.trim();
  const example_ja = document.getElementById("input-example-ja").value.trim();
  const note = document.getElementById("input-note").value.trim();

  if (!word || !meaning) {
    showAddStatus("単語と意味は必須です", "error");
    return;
  }

  let token = getPat();
  if (!token) {
    await configurePat();
    token = getPat();
    if (!token) {
      showAddStatus("トークンが設定されていません", "error");
      return;
    }
  }

  showAddStatus("保存中…", "info");

  try {
    // 現在の vocab.json と SHA を取得
    const getResp = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/vocab.json`,
      { headers: { Authorization: `token ${token}`, Accept: "application/vnd.github+json" } }
    );
    if (!getResp.ok) {
      const err = await getResp.json().catch(() => ({}));
      throw new Error(`vocab.json 取得失敗 (${getResp.status}): ${err.message || ""}`);
    }
    const fileInfo = await getResp.json();
    const currentText = atobUtf8(fileInfo.content.replace(/\n/g, ""));
    const currentData = JSON.parse(currentText);

    // 重複チェック
    if (currentData.words.some(w => w.word.toLowerCase() === word.toLowerCase())) {
      throw new Error(`「${word}」は既に登録されています`);
    }

    // 追加
    const today = new Date().toISOString().slice(0, 10);
    currentData.words.push({
      word, meaning, example_en, example_ja, note, added: today
    });
    currentData.updated = today;

    const newText = JSON.stringify(currentData, null, 2) + "\n";
    const newContentB64 = btoaUtf8(newText);

    // 保存
    const putResp = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/vocab.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Add word: ${word}`,
          content: newContentB64,
          sha: fileInfo.sha
        })
      }
    );
    if (!putResp.ok) {
      const err = await putResp.json().catch(() => ({}));
      throw new Error(`保存失敗 (${putResp.status}): ${err.message || ""}`);
    }

    // ローカルにも反映
    VOCAB = currentData.words;
    state.order = VOCAB.map((_, i) => i);
    state.currentPos = VOCAB.length - 1;
    saveState();
    render();

    showAddStatus("✓ 保存しました（GitHub Pages 反映に1〜2分かかります）", "success");
    setTimeout(closeAddModal, 1800);
  } catch (err) {
    console.error(err);
    showAddStatus("エラー: " + err.message, "error");
  }
}

function showAddStatus(msg, type) {
  const el = document.getElementById("add-status");
  el.textContent = msg;
  el.className = "add-status " + (type || "");
}

// UTF-8 対応 base64
function btoaUtf8(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function atobUtf8(b64) {
  return decodeURIComponent(escape(atob(b64)));
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

  document.getElementById("add-btn").addEventListener("click", openAddModal);
  document.getElementById("close-modal").addEventListener("click", closeAddModal);
  document.getElementById("add-form").addEventListener("submit", submitNewWord);
  document.getElementById("configure-pat").addEventListener("click", configurePat);
  document.getElementById("add-modal").addEventListener("click", (e) => {
    if (e.target.id === "add-modal") closeAddModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (document.getElementById("add-modal").classList.contains("open")) return;
    switch (e.key) {
      case "ArrowRight": next(); break;
      case "ArrowLeft": prev(); break;
      case " ": e.preventDefault(); flip(); break;
      case "k": case "K": markKnown(); break;
      case "u": case "U": markUnknown(); break;
      case "s": case "S": speak(currentVocab()?.vocab?.word); break;
    }
  });

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }
}

init();
