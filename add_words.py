"""vocab.json に単語を追加し、自動で commit & push するスクリプト。

使い方:
  python add_words.py
    対話モードで起動。1単語ずつ入力。

  python add_words.py path/to/memo.txt
    メモファイルから単語を抽出して取り込み。

メモファイルの想定フォーマット (混在OK):
  word : 意味
  word, 意味
  word - 意味
  word（意味なしで取り込む場合）

実行後、自動で git add / commit / push します。GitHub Pages 反映は1〜2分後。
"""

from __future__ import annotations

import datetime
import json
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
VOCAB_FILE = HERE / "vocab.json"

# メモ1行から「単語」と「意味」を抜き出す正規表現群（区切り候補を順に試す）
SEPARATORS = [
    re.compile(r"\s*[:：]\s*"),    # コロン
    re.compile(r"\s*[\-—–]+\s*"),  # ハイフン
    re.compile(r"\s*[,，、]\s*"),  # カンマ
    re.compile(r"\s{2,}"),         # 連続スペース
    re.compile(r"\s*[　]\s*"), # 全角スペース
]


def load_vocab() -> dict:
    if not VOCAB_FILE.exists():
        return {"version": 1, "updated": None, "words": []}
    with VOCAB_FILE.open(encoding="utf-8") as f:
        return json.load(f)


def save_vocab(data: dict) -> None:
    data["updated"] = datetime.date.today().isoformat()
    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    VOCAB_FILE.write_text(text, encoding="utf-8")


def existing_words(data: dict) -> set[str]:
    return {w["word"].strip().lower() for w in data["words"]}


def parse_line(line: str) -> tuple[str, str] | None:
    """1行から (単語, 意味) を抽出。意味なしの場合は (単語, "")."""
    line = line.strip()
    if not line:
        return None
    if line.startswith("#") or line.startswith("//"):
        return None
    for sep in SEPARATORS:
        parts = sep.split(line, maxsplit=1)
        if len(parts) == 2 and parts[0].strip() and parts[1].strip():
            return parts[0].strip(), parts[1].strip()
    # 区切りが見つからない → 全体を単語として扱う（意味は空）
    return line, ""


def parse_memo(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8")
    pairs = []
    for line in text.splitlines():
        pair = parse_line(line)
        if pair:
            pairs.append(pair)
    return pairs


def interactive_input() -> list[tuple[str, str]]:
    print("単語と意味を入力します。空行を入力すると終了します。")
    print("形式: 単語 [Enter] 意味 [Enter]")
    pairs = []
    while True:
        word = input("\n単語 (空欄で終了): ").strip()
        if not word:
            break
        meaning = input("意味      : ").strip()
        pairs.append((word, meaning))
    return pairs


def add_words(data: dict, pairs: list[tuple[str, str]]) -> list[str]:
    """重複を除いて追加。追加した単語のリストを返す。"""
    existing = existing_words(data)
    added = []
    today = datetime.date.today().isoformat()
    for word, meaning in pairs:
        if word.lower() in existing:
            print(f"  - スキップ（既存）: {word}")
            continue
        existing.add(word.lower())
        entry = {
            "word": word,
            "meaning": meaning,
            "example_en": "",
            "example_ja": "",
            "note": "add_words.py で追加（例文未生成）",
            "added": today,
        }
        data["words"].append(entry)
        added.append(word)
        print(f"  + 追加: {word} → {meaning or '(意味なし)'}")
    return added


def run(cmd: list[str]) -> None:
    print(f"$ {' '.join(cmd)}")
    subprocess.run(cmd, cwd=HERE, check=True)


def git_commit_and_push(added: list[str]) -> None:
    if not added:
        print("追加された単語がないので commit はスキップします。")
        return

    msg = f"Add {len(added)} word(s): " + ", ".join(added[:3])
    if len(added) > 3:
        msg += f" and {len(added) - 3} more"

    run(["git", "add", "vocab.json"])
    run(["git", "commit", "-m", msg])
    run(["git", "push"])
    print("\n✓ push 完了。GitHub Pages の反映まで1〜2分待ってください。")


def main() -> int:
    args = sys.argv[1:]
    if args:
        path = Path(args[0])
        if not path.exists():
            print(f"ファイルが見つかりません: {path}", file=sys.stderr)
            return 1
        pairs = parse_memo(path)
        if not pairs:
            print("メモから単語を抽出できませんでした。")
            return 1
        print(f"{path.name} から {len(pairs)} 件抽出しました。")
        for w, m in pairs:
            print(f"  {w} → {m or '(意味なし)'}")
        ans = input("\nこの内容で取り込みますか？ [Y/n]: ").strip().lower()
        if ans and ans not in ("y", "yes"):
            print("中止しました。")
            return 0
    else:
        pairs = interactive_input()
        if not pairs:
            print("入力なし、終了します。")
            return 0

    data = load_vocab()
    added = add_words(data, pairs)
    save_vocab(data)

    if added:
        ans = input(f"\n{len(added)} 件追加しました。git push しますか？ [Y/n]: ").strip().lower()
        if not ans or ans in ("y", "yes"):
            git_commit_and_push(added)
        else:
            print("ローカル保存のみ実施しました。後で手動で push してください。")

    return 0


if __name__ == "__main__":
    sys.exit(main())
