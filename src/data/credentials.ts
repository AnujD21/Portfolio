import type { Text } from "../i18n/lang";

export interface EducationEntry {
  degree: Text;
  institution: Text;
  period: Text;
  detail?: string;
}

export const education: EducationEntry[] = [
  {
    degree: {
      en: "B.E. Computer Science Engineering, AI and Machine Learning",
      ja: "コンピュータサイエンス工学士（AI・機械学習専攻）",
    },
    institution: { en: "Easwari Engineering College, Chennai", ja: "Easwari Engineering College（チェンナイ）" },
    period: { en: "2023 - 2027", ja: "2023年〜2027年" },
    detail: "CGPA 8.63",
  },
  {
    degree: { en: "Primary and Secondary Education, Class I to XII", ja: "初等・中等教育（1〜12年生）" },
    institution: { en: "Kendriya Vidyalaya No. 1, Mangalore", ja: "Kendriya Vidyalaya No. 1（マンガロール）" },
    period: { en: "2010 - 2023", ja: "2010年〜2023年" },
  },
];

export interface Certification {
  name: Text;
  issuer: Text;
  year?: string;
}

export const certifications: Certification[] = [
  {
    name: { en: "Oracle Certified Professional: Java SE 11 Developer", ja: "Oracle認定資格 Java SE 11 Developer（OCP）" },
    issuer: { en: "Oracle", ja: "Oracle" },
    year: "2026",
  },
  {
    name: { en: "IoT and Privacy in Social Media", ja: "IoT and Privacy in Social Media" },
    issuer: { en: "NPTEL", ja: "NPTEL（インド工科大学のオンライン講座）" },
    year: "2025",
  },
  { name: { en: "JLPT N3", ja: "日本語能力試験 N3" }, issuer: { en: "Japanese-Language Proficiency Test", ja: "JLPT" } },
  { name: { en: "NAT-TEST 3Q", ja: "日本語NAT-TEST 3級" }, issuer: { en: "Japanese language proficiency", ja: "日本語能力の検定試験" } },
];

export interface SpokenLanguage {
  name: Text;
  /** Shown in its own script next to the name, e.g. हिन्दी. Omitted when it would repeat the name. */
  native?: { text: string; lang: string };
  level?: string;
}

export const languages: SpokenLanguage[] = [
  { name: { en: "English", ja: "英語" } },
  { name: { en: "Hindi", ja: "ヒンディー語" }, native: { text: "हिन्दी", lang: "hi" } },
  { name: { en: "Japanese", ja: "日本語" }, native: { text: "日本語", lang: "ja" }, level: "JLPT N3" },
];
