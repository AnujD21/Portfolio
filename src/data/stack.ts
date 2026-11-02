import {
  siDjango,
  siDocker,
  siFastapi,
  siNextdotjs,
  siNumpy,
  siOnnx,
  siOpencv,
  siOpenjdk,
  siPandas,
  siPostgresql,
  siPython,
  siRaspberrypi,
  siReact,
  siRedis,
  siScikitlearn,
  siTailwindcss,
  siTensorflow,
  siTypescript,
  siUltralytics,
  siMysql,
  siNodedotjs,
} from "simple-icons";
import type { Text } from "../i18n/lang";

export interface Logo {
  title: string;
  path: string;
}

export const logos: Logo[] = [
  siPython,
  siTensorflow,
  siScikitlearn,
  siOpencv,
  siUltralytics,
  siOnnx,
  siPandas,
  siNumpy,
  siRaspberrypi,
  siReact,
  siTypescript,
  siNextdotjs,
  siNodedotjs,
  siTailwindcss,
  siFastapi,
  siDjango,
  siPostgresql,
  siMysql,
  siRedis,
  siDocker,
  siOpenjdk,
].map(({ title, path }) => ({ title, path }));

export interface StackGroup {
  title: Text;
  /** Product names stay as plain strings; descriptive items carry both languages. */
  items: (string | Text)[];
}

export const stackGroups: StackGroup[] = [
  { title: { en: "Languages", ja: "言語" }, items: ["Python", "Java", "JavaScript", "TypeScript", "SQL"] },
  {
    title: { en: "ML and vision", ja: "機械学習・画像認識" },
    items: ["Scikit-learn", "TensorFlow", "YOLOv8", "ONNX Runtime", "OpenCV", "Pandas", "NumPy"],
  },
  {
    title: { en: "Web", ja: "Web" },
    items: ["React", "Next.js", "Node.js", "Tailwind CSS", { en: "HTML5 and CSS3", ja: "HTML5・CSS3" }],
  },
  {
    title: { en: "Backend and data", ja: "バックエンド・データ" },
    items: ["FastAPI", "Django REST", "PostgreSQL", "MySQL", { en: "Redis and Celery", ja: "Redis・Celery" }, "Docker"],
  },
  {
    title: { en: "Edge and IoT", ja: "エッジ・IoT" },
    items: [
      "Raspberry Pi",
      { en: "Thermal imaging", ja: "サーマルイメージング" },
      { en: "mmWave radar", ja: "ミリ波レーダー" },
      { en: "Sensor fusion", ja: "センサーフュージョン" },
      { en: "Live telemetry", ja: "ライブテレメトリ" },
    ],
  },
];
