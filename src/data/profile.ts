import type { Lang, Text } from "../i18n/lang";

export const profile = {
  name: "Anuj Das",
  nameJa: "アヌジ・ダス",
  role: { en: "AI and ML Engineer", ja: "AI・機械学習エンジニア" } satisfies Text,
  availability: { en: "Open to AI, ML and full-stack roles", ja: "AI・ML・フルスタック職を探しています" } satisfies Text,
  email: "anujdas2109@gmail.com",
  linkedin: "https://www.linkedin.com/in/anujdas2109",
  github: "https://github.com/AnujD21",
  resume: "/Anuj_Das_Resume.pdf",
};

/** Sentences with one highlighted phrase. Split into parts because word order differs by language. */
export type Rich = { text: string; hl?: boolean }[];

export const intro: Record<Lang, Rich> = {
  en: [
    { text: "I build vision, sensor-fusion and edge systems that keep working when the " },
    { text: "network doesn't.", hl: true },
  ],
  ja: [
    { text: "ネットワークが途切れても", hl: true },
    // U+2060 (word joiner) keeps "エッジAI" on one line.
    { text: "動き続ける、画像認識とエッジ\u2060AIのシステムを作っています。" },
  ],
};

export const manifesto: Record<Lang, Rich> = {
  en: [
    {
      text: "I'm a computer science engineer specialising in AI and machine learning. The part I love is when a model leaves the notebook and has to ",
    },
    { text: "survive the real world", hl: true },
    {
      text: ": a drone searching debris with no internet, a chiller plant run from a browser, an invoice nobody has to retype.",
    },
  ],
  ja: [
    { text: "AI・機械学習を専攻するコンピュータサイエンスのエンジニアです。一番好きなのは、モデルがノートブックを飛び出して" },
    { text: "現実の世界で試される", hl: true },
    {
      text: "瞬間です。インターネットのない瓦礫の上を探すドローン、ブラウザから操作するチラープラント、もう誰も打ち直さなくていい請求書。",
    },
  ],
};

export const facts: { label: Text; value: Text }[] = [
  { label: { en: "Based in", ja: "拠点" }, value: { en: "Chennai, India", ja: "インド・チェンナイ" } },
  { label: { en: "Studying", ja: "専攻" }, value: { en: "B.E. CSE, AI and ML", ja: "コンピュータサイエンス（AI・ML）" } },
  { label: { en: "Graduating", ja: "卒業予定" }, value: { en: "2027, CGPA 8.63", ja: "2027年・CGPA 8.63" } },
  { label: { en: "Speaks", ja: "言語" }, value: { en: "English, Hindi, 日本語", ja: "英語・ヒンディー語・日本語" } },
];
