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
  title: string;
  items: string[];
}

export const stackGroups: StackGroup[] = [
  { title: "Languages", items: ["Python", "Java", "JavaScript", "TypeScript", "SQL"] },
  {
    title: "ML and vision",
    items: ["Scikit-learn", "TensorFlow", "YOLOv8", "ONNX Runtime", "OpenCV", "Pandas", "NumPy"],
  },
  { title: "Web", items: ["React", "Next.js", "Node.js", "Tailwind CSS", "HTML5 and CSS3"] },
  {
    title: "Backend and data",
    items: ["FastAPI", "Django REST", "PostgreSQL", "MySQL", "Redis and Celery", "Docker"],
  },
  {
    title: "Edge and IoT",
    items: ["Raspberry Pi", "Thermal imaging", "mmWave radar", "Sensor fusion", "Live telemetry"],
  },
];
