import type { Text } from "../i18n/lang";
import type { Metric } from "./projects";

export interface ExperienceEntry {
  role: Text;
  org: string;
  location: Text;
  period: Text;
  tags: string[];
  metrics: Metric[];
  points: Text[];
}

export const experience: ExperienceEntry[] = [
  {
    role: { en: "Software Engineering Intern", ja: "ソフトウェアエンジニア（インターン）" },
    org: "Larsen & Toubro",
    location: { en: "Chennai", ja: "チェンナイ" },
    period: { en: "Jun 2025 - Jul 2025", ja: "2025年6月〜7月" },
    tags: ["Python", "Scikit-learn", "IoT", "React"],
    metrics: [
      { value: 40, prefix: "~", suffix: "%", label: { en: "Faster fault detection", ja: "障害検知の高速化" } },
      { value: 10, suffix: "+", label: { en: "Live sensor devices ingested", ja: "データを取り込んだセンサー機器" } },
      { value: 5, prefix: "<", suffix: " min", label: { en: "Failure response, down from hours", ja: "障害対応時間（数時間から短縮）" } },
      { value: 45, label: { en: "Days from start to production", ja: "開始から本番稼働までの日数" } },
    ],
    points: [
      {
        en: "Built a Scikit-learn pipeline that classifies and predicts sensor anomalies in industrial chiller systems.",
        ja: "Scikit-learnで、産業用チラーのセンサー異常を分類・予測するパイプラインを構築。",
      },
      {
        en: "Engineered a real-time ingestion layer for live feeds from 10+ devices, powering the operations team's daily React dashboard.",
        ja: "10台以上の機器からのデータをリアルタイムで取り込む基盤を開発し、運用チームが毎日使うReactダッシュボードに接続。",
      },
      {
        en: "Replaced manual inspection with an automated ML-driven alert system.",
        ja: "手作業による点検を、機械学習による自動アラートシステムに置き換え。",
      },
      {
        en: "Shipped production software alongside mechanical and electrical engineers across three functional teams.",
        ja: "機械・電気のエンジニアと協力し、3つの部門にまたがる本番用ソフトウェアをリリース。",
      },
    ],
  },
];
