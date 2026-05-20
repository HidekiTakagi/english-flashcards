// 単語データ
// 元ファイル: 260520メモ.txt（2026-05-20 英会話セッション）
// note フィールドに「typo修正」「推定」と書いてある単語は、要確認のもの。
const VOCAB = [
  {
    word: "bucket list",
    meaning: "死ぬまでにやりたいことのリスト",
    example_en: "Visiting Kyoto in autumn is on my bucket list.",
    example_ja: "秋に京都を訪れることは、私のやりたいことリストに入っています。",
    note: ""
  },
  {
    word: "hay fever",
    meaning: "花粉症",
    example_en: "I get terrible hay fever every spring.",
    example_ja: "毎年春になると、ひどい花粉症になります。",
    note: ""
  },
  {
    word: "allergy to pollen",
    meaning: "花粉アレルギー（花粉症）",
    example_en: "She has a severe allergy to pollen during cedar season.",
    example_ja: "彼女はスギの季節になると、ひどい花粉アレルギーになります。",
    note: ""
  },
  {
    word: "villa",
    meaning: "別荘",
    example_en: "They own a small villa near the lake.",
    example_ja: "彼らは湖の近くに小さな別荘を持っています。",
    note: ""
  },
  {
    word: "rental villa",
    meaning: "貸別荘",
    example_en: "We booked a rental villa for our summer vacation.",
    example_ja: "夏休みに貸別荘を予約しました。",
    note: ""
  },
  {
    word: "hustle and bustle",
    meaning: "(都会などの)喧騒、賑わい",
    example_en: "It's very quiet, and I really like being able to get away from the hustle and bustle of the city.",
    example_ja: "とても静かで、都会の喧騒から離れられるのが本当に気に入っています。",
    note: "セッション中の例文から抽出"
  },
  {
    word: "intermediary",
    meaning: "仲介者、仲介役",
    example_en: "The lawyer acted as an intermediary between the two companies.",
    example_ja: "弁護士は2社の間で仲介役を務めました。",
    note: ""
  },
  {
    word: "destruction",
    meaning: "破壊",
    example_en: "The storm caused massive destruction to the coastal town.",
    example_ja: "嵐は沿岸の町に甚大な破壊をもたらしました。",
    note: "元メモ「destraction」のtypoを修正"
  },
  {
    word: "basic",
    meaning: "基本的な、基礎の",
    example_en: "You need to master the basic grammar first.",
    example_ja: "まずは基本的な文法をマスターする必要があります。",
    note: "元メモ「basical」を「basic」に修正（推定）"
  },
  {
    word: "roller coaster",
    meaning: "ジェットコースター、(比喩で)激しい浮き沈み",
    example_en: "Last year was a real roller coaster for our business.",
    example_ja: "去年は私たちのビジネスにとってまさにジェットコースターのような一年でした。",
    note: ""
  },
  {
    word: "unstable",
    meaning: "不安定な",
    example_en: "The political situation in the region remains unstable.",
    example_ja: "その地域の政治情勢は依然として不安定です。",
    note: ""
  },
  {
    word: "get relief",
    meaning: "安堵する、楽になる、(痛みなどから)解放される",
    example_en: "I took some medicine and finally got relief from the headache.",
    example_ja: "薬を飲んで、ようやく頭痛から解放されました。",
    note: ""
  },
  {
    word: "depress",
    meaning: "落ち込ませる、憂鬱にする",
    example_en: "Rainy days always depress me.",
    example_ja: "雨の日はいつも私を憂鬱にさせます。",
    note: ""
  },
  {
    word: "ruins",
    meaning: "遺跡、廃墟",
    example_en: "We visited the ancient ruins of Rome last summer.",
    example_ja: "去年の夏、私たちはローマの古代遺跡を訪れました。",
    note: ""
  },
  {
    word: "traditional",
    meaning: "伝統的な",
    example_en: "She wore a traditional kimono to the ceremony.",
    example_ja: "彼女は式典に伝統的な着物を着て行きました。",
    note: ""
  },
  {
    word: "switch",
    meaning: "切り替える、スイッチ",
    example_en: "Let's switch to a different topic.",
    example_ja: "別の話題に切り替えましょう。",
    note: "元メモ「swich」のtypoを修正"
  },
  {
    word: "goal",
    meaning: "目標、ゴール",
    example_en: "My goal this year is to read 30 books.",
    example_ja: "今年の私の目標は30冊の本を読むことです。",
    note: ""
  },
  {
    word: "fair share",
    meaning: "公平な分け前、相応の分担",
    example_en: "Everyone should do their fair share of the housework.",
    example_ja: "誰もが家事の公平な分担をすべきです。",
    note: "元メモ「fare care」を「fair share」と推定（要確認）"
  },
  {
    word: "confess",
    meaning: "告白する、白状する",
    example_en: "He confessed that he had forgotten her birthday.",
    example_ja: "彼は彼女の誕生日を忘れていたと白状しました。",
    note: ""
  },
  {
    word: "invite",
    meaning: "招待する",
    example_en: "They invited us to their wedding next month.",
    example_ja: "彼らは来月の結婚式に私たちを招待してくれました。",
    note: "元メモ「invate」を「invite」と推定（要確認）"
  }
];
