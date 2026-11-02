import type { Text } from "../i18n/lang";

export interface Metric {
  /** Numeric values count up on scroll; text renders as-is. */
  value: number | Text;
  prefix?: string;
  suffix?: string;
  label: Text;
}

export interface Project {
  slug: string;
  title: Text;
  kicker?: string;
  year: string;
  context: Text;
  summary: Text;
  metrics: Metric[];
  points: Text[];
  stack: string[];
  github?: string;
  live?: string;
  media?: { src: string; alt: Text }[];
  mediaCaption?: Text;
}

/** Order matters: each entry maps to the matching 3D formation in three/formations.ts. */
export const featured: Project[] = [
  {
    slug: "skynetics",
    title: { en: "SkyNetics Rescue Drone", ja: "SkyNetics 救助ドローン" },
    year: "2026",
    context: { en: "Team of four, software", ja: "4人チーム・ソフトウェア担当" },
    summary: {
      en: "An autonomous drone that searches avalanche and landslide sites for buried survivors. It fuses thermal imaging, mmWave radar and YOLOv8 vision on a Raspberry Pi 4, fully offline, and streams a live overlay to the pilot's goggles.",
      ja: "雪崩や土砂崩れの現場で、埋もれた生存者を探す自律型ドローン。サーマルカメラ、ミリ波レーダー、YOLOv8による画像認識をRaspberry Pi\u00a04上で融合し、完全オフラインで動作します。パイロットのゴーグルにはライブ映像と検出結果をリアルタイムで表示します。",
    },
    metrics: [
      { value: 30, prefix: "~", suffix: " fps", label: { en: "Live overlay, never blocked by inference", ja: "推論に左右されないライブ映像" } },
      { value: 3, label: { en: "Sensors fused: thermal, radar, RGB", ja: "融合するセンサー：サーマル・レーダー・RGB" } },
      { value: 100, suffix: "%", label: { en: "Offline, on-device inference", ja: "オフライン・端末内で推論" } },
    ],
    points: [
      {
        en: "Three-thread pipeline hands off only the freshest frame, so video holds ~30 fps even when detection stalls.",
        ja: "最新フレームだけを受け渡す3スレッド構成で、検出処理が止まっても映像は約30fpsを維持。",
      },
      {
        en: "Adaptive thermal thresholding on a 32×24 sensor, confidence-weighted fusion and Kalman + SORT tracking.",
        ja: "32×24サーマルセンサーの適応しきい値処理、信頼度で重み付けしたセンサーフュージョン、Kalman + SORTによる追跡。",
      },
    ],
    stack: ["Python", "YOLOv8", "ONNX Runtime", "OpenCV", "Raspberry Pi 4", "Sensor fusion"],
    github: "https://github.com/AnujD21/SkyNetics_RAS_Drone",
    media: [
      {
        src: "/media/drone-thermal.webp",
        alt: { en: "Drone overlay in thermal mode, two people detected and boxed", ja: "サーマルモードの画面。2人を検出して枠で表示" },
      },
      {
        src: "/media/drone-radar.webp",
        alt: { en: "Drone overlay in radar mode, a moving target tracked at 488 cm", ja: "レーダーモードの画面。488cm先の移動目標を追跡" },
      },
    ],
    mediaCaption: {
      en: "Captured from the running system: thermal and radar modes.",
      ja: "実機から取得した画面：サーマルモードとレーダーモード。",
    },
  },
  {
    slug: "chiller",
    title: { en: "Chiller Valve Management", ja: "チラーバルブ管理システム" },
    year: "2025",
    context: { en: "Larsen & Toubro", ja: "Larsen & Toubro" },
    summary: {
      en: "A live digital twin of an industrial chiller network. Plant engineers see and operate more than twenty valves from a React plant map instead of walking the floor to adjust them by hand.",
      ja: "産業用チラー設備のライブ・デジタルツイン。現場を歩いて手で調整する代わりに、エンジニアはReactのプラントマップ上で20以上のバルブを確認・操作できます。",
    },
    metrics: [
      { value: 20, suffix: "+", label: { en: "Valves rendered in real time", ja: "リアルタイム表示するバルブ" } },
      { value: 2, prefix: "<", suffix: "s", label: { en: "Sensor-to-screen latency", ja: "センサーから画面までの遅延" } },
      { value: 60, prefix: "~", suffix: "%", label: { en: "Less operator intervention", ja: "オペレーター介入の削減" } },
    ],
    points: [
      {
        en: "IoT streams for temperature, pressure and flow drive the map, giving full visual control of hot and cold water.",
        ja: "温度・圧力・流量のIoTデータでマップを更新し、冷水と温水の流れをすべて可視化。",
      },
      {
        en: "Virtual valve controls with live state feedback replaced on-site manual adjustment.",
        ja: "状態フィードバック付きの仮想バルブ操作で、現場での手動調整を不要に。",
      },
    ],
    stack: ["Python", "React", "Machine learning", "IoT"],
  },
  {
    slug: "smartinvoice",
    title: { en: "SmartInvoice AI", ja: "SmartInvoice AI" },
    year: "2026",
    context: { en: "Personal project", ja: "個人プロジェクト" },
    summary: {
      en: "An OCR pipeline that turns inconsistent PDF invoices into structured data, and flags the fields it is unsure about instead of hiding them as silent errors.",
      ja: "形式がばらばらなPDF請求書を構造化データに変換するOCRパイプライン。自信のない項目は隠さず、確認が必要な箇所として明示します。",
    },
    metrics: [
      { value: 15, suffix: "+", label: { en: "Structured fields per invoice", ja: "請求書1件あたりの抽出項目" } },
      { value: 89, suffix: "%", label: { en: "Field-level accuracy", ja: "項目単位の精度" } },
      { value: 70, suffix: "%", label: { en: "Faster than manual entry", ja: "手入力と比べた時間短縮" } },
    ],
    points: [
      {
        en: "Explainable confidence per field, so auditors review only the low-confidence extractions.",
        ja: "項目ごとに説明可能な信頼度を付け、監査担当者は信頼度の低い項目だけを確認すれば済みます。",
      },
      {
        en: "Validation and output formatting run automatically across diverse invoice layouts.",
        ja: "さまざまなレイアウトの請求書に対して、検証と出力の整形を自動化。",
      },
    ],
    stack: ["Python", "OCR", "Machine learning", "NLP"],
  },
  {
    slug: "shigotai",
    title: { en: "Shigotai", ja: "Shigotai" },
    kicker: "仕事 + AI",
    year: "2026",
    context: { en: "Personal project", ja: "個人プロジェクト" },
    summary: {
      en: "A career platform for people who want to work at Japanese companies. It matches your profile against live job postings and explains why you match, rather than showing a mystery score.",
      ja: "日本企業で働きたい人のためのキャリアプラットフォーム。プロフィールを公開中の求人と照合し、スコアだけでなく「なぜマッチするのか」を説明します。",
    },
    metrics: [
      { value: 4, label: { en: "Live job-board APIs ingested", ja: "取り込んでいる求人API" } },
      { value: 3, label: { en: "Matching stages: rules, semantic, LLM", ja: "マッチングの段階：ルール・意味・LLM" } },
      { value: 0, label: { en: "API keys needed to run locally", ja: "ローカル実行に必要なAPIキー" } },
    ],
    points: [
      {
        en: "Resume parsing proposes fields for the user to accept, so nothing the model invents reaches a profile.",
        ja: "レジュメの解析結果は提案として表示し、ユーザーが承認する方式。モデルが作り出した情報がプロフィールに入りません。",
      },
      {
        en: "Re-verifies postings over time and notifies you when a job's requirements change enough that you qualify.",
        ja: "求人を定期的に再確認し、応募条件が変わって対象になった時点で通知します。",
      },
    ],
    stack: ["Next.js", "TypeScript", "FastAPI", "SQLAlchemy", "LLM"],
    github: "https://github.com/AnujD21/Shigotai",
    live: "https://shigotai-jobs.vercel.app",
  },
  {
    slug: "edgegrid",
    title: { en: "EdgeGrid", ja: "EdgeGrid" },
    year: "2026",
    context: { en: "Personal project", ja: "個人プロジェクト" },
    summary: {
      en: "A control plane for fleets of mixed edge devices. Devices check in, pull compatible firmware, verify and install it, report progress, and roll back on their own if anything fails.",
      ja: "さまざまなエッジデバイスを管理するコントロールプレーン。デバイスは対応するファームウェアを取得・検証・インストールして進捗を報告し、失敗した場合は自動でロールバックします。",
    },
    metrics: [
      { value: { en: "Auto", ja: "自動" }, label: { en: "Rollback on failed installs", ja: "インストール失敗時のロールバック" } },
      { value: { en: "Live", ja: "ライブ" }, label: { en: "Device health over WebSockets", ja: "WebSocketで届くデバイスの状態" } },
      { value: { en: "Typed", ja: "機種別" }, label: { en: "Firmware matched per device variant", ja: "デバイスの種類ごとにファームウェアを照合" } },
    ],
    points: [
      {
        en: "Django REST API with Celery workers on Redis and Django Channels for real-time status.",
        ja: "Django REST API、Redis上のCeleryワーカー、Django Channelsによるリアルタイムな状態通知。",
      },
      {
        en: "Device-agent simulator and a full audit trail of releases, deployments and rollbacks.",
        ja: "デバイスエージェントのシミュレーターと、リリース・配信・ロールバックの監査ログ。",
      },
    ],
    stack: ["React", "TypeScript", "Django REST", "PostgreSQL", "Celery", "Docker"],
    github: "https://github.com/AnujD21/EdgeGrid",
  },
];
