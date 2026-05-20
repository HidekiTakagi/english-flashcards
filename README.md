# 英会話メモ 単語学習アプリ

英会話セッションで気になった単語・表現を覚えるためのフラッシュカード Web アプリ。

- 公開URL: <https://hidekitakagi.github.io/english-flashcards/>
- リポジトリ: <https://github.com/HidekiTakagi/english-flashcards>

## 機能

- 単語・例文（英日）の表裏フラッシュカード
- Web Speech API で発音再生（単語・例文）
- 覚えた／まだのマーキング、シャッフル、絞り込み
- localStorage で学習進捗を保存（端末ごと独立）
- ブラウザから直接単語追加（GitHub Contents API 経由）

## ファイル

```
英語学習/
├── index.html          # メイン UI
├── style.css           # スタイル
├── app.js              # アプリロジック・GitHub API 連携
├── vocab.json          # 単語データ（Source of Truth）
├── add_words.py        # ターミナルから単語追加するスクリプト
└── README.md
```

## 単語を追加する 3 つの方法

### A. Claude Code に頼む（一番簡単）

1. メモを `英語学習` フォルダにテキストファイル (`YYMMDDメモ.txt` 等) として保存
2. Claude Code を起動して「新しいメモから単語を追加して」と伝える
3. 例文生成・誤字修正・重複チェック・push まで自動で実行

### B. Web アプリ上から追加（スマホからもOK）

1. アプリ右上の **「+ 単語追加」** をクリック
2. 単語・意味・例文を入力 → **保存** ボタン
3. 初回は GitHub Personal Access Token (PAT) の入力を求められる
4. 1〜2 分後に GitHub Pages に反映

**PAT の取得手順（初回のみ）**

1. <https://github.com/settings/tokens> にアクセス（GitHub にログインしておく）
2. 右上 **「Generate new token」** → **「Generate new token (classic)」** を選択
3. 各項目を入力：
   - **Note**: `english-flashcards`
   - **Expiration**: 任意（90日推奨。期限切れ時は再生成）
   - **Select scopes**: **`repo`** にチェック（これだけで OK）
4. 一番下の **「Generate token」** をクリック
5. 表示された `ghp_xxxxxxxx...` をコピー（**この画面を閉じると二度と見られません**）
6. アプリで **「+ 単語追加」** を押し、**「🔑 GitHubトークン設定」** にトークンを貼り付け
7. 以降はブラウザの localStorage に保存され自動的に使われる

**注意点**

- PAT は書き込み権限を持つので、他人に共有しないこと
- 共有 PC やスマホでは使わないこと（localStorage に残るため）
- トークンが漏れた／不要になったら <https://github.com/settings/tokens> から **Revoke**

### C. ターミナルから `add_words.py` で追加

Claude Code 不要で更新したいとき用。

```powershell
# 対話モード（1単語ずつ入力）
python add_words.py

# メモファイルから一括取り込み
python add_words.py 260601メモ.txt
```

メモファイルの形式は柔軟（混在可）：
```
word : 意味
word - 意味
word, 意味
word（意味なしで可）
```

実行すると：
1. 抽出結果を表示 → 確認
2. `vocab.json` に追記（重複は自動スキップ）
3. `git add → commit → push` まで自動

※ B と違い、例文は空のまま追加されます。後でアプリの編集機能や Claude Code で補完してください。

## ローカルでの動作確認

`vocab.json` を `fetch()` で読み込むので、ブラウザで `index.html` をダブルクリックしても動きません。
ローカル確認時は簡易サーバーを使ってください：

```powershell
cd C:\Users\takag\英語学習
python -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

通常利用は GitHub Pages の URL でOK：
<https://hidekitakagi.github.io/english-flashcards/>
