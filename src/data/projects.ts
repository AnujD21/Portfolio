export interface Metric {
  /** Numeric values count up on scroll; strings render as-is. */
  value: number | string;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface Project {
  slug: string;
  title: string;
  kicker?: string;
  year: string;
  context: string;
  summary: string;
  metrics: Metric[];
  points: string[];
  stack: string[];
  github?: string;
  live?: string;
  media?: { src: string; alt: string }[];
  mediaCaption?: string;
}

/** Order matters: each entry maps to the matching 3D formation in three/formations.ts. */
export const featured: Project[] = [
  {
    slug: "skynetics",
    title: "SkyNetics Rescue Drone",
    year: "2026",
    context: "Team of four, software",
    summary:
      "An autonomous drone that searches avalanche and landslide sites for buried survivors. It fuses thermal imaging, mmWave radar and YOLOv8 vision on a Raspberry Pi 4, fully offline, and streams a live overlay to the pilot's goggles.",
    metrics: [
      { value: 30, prefix: "~", suffix: " fps", label: "Live overlay, never blocked by inference" },
      { value: 3, label: "Sensors fused: thermal, radar, RGB" },
      { value: 100, suffix: "%", label: "Offline, on-device inference" },
    ],
    points: [
      "Three-thread pipeline hands off only the freshest frame, so video holds ~30 fps even when detection stalls.",
      "Adaptive thermal thresholding on a 32×24 sensor, confidence-weighted fusion and Kalman + SORT tracking.",
    ],
    stack: ["Python", "YOLOv8", "ONNX Runtime", "OpenCV", "Raspberry Pi 4", "Sensor fusion"],
    github: "https://github.com/AnujD21/SkyNetics_RAS_Drone",
    media: [
      { src: "/media/drone-thermal.webp", alt: "Drone overlay in thermal mode, two people detected and boxed" },
      { src: "/media/drone-radar.webp", alt: "Drone overlay in radar mode, a moving target tracked at 488 cm" },
    ],
    mediaCaption: "Captured from the running system: thermal and radar modes.",
  },
  {
    slug: "chiller",
    title: "Chiller Valve Management",
    year: "2025",
    context: "Larsen & Toubro",
    summary:
      "A live digital twin of an industrial chiller network. Plant engineers see and operate more than twenty valves from a React plant map instead of walking the floor to adjust them by hand.",
    metrics: [
      { value: 20, suffix: "+", label: "Valves rendered in real time" },
      { value: 2, prefix: "<", suffix: "s", label: "Sensor-to-screen latency" },
      { value: 60, prefix: "~", suffix: "%", label: "Less operator intervention" },
    ],
    points: [
      "IoT streams for temperature, pressure and flow drive the map, giving full visual control of hot and cold water.",
      "Virtual valve controls with live state feedback replaced on-site manual adjustment.",
    ],
    stack: ["Python", "React", "Machine learning", "IoT"],
  },
  {
    slug: "smartinvoice",
    title: "SmartInvoice AI",
    year: "2026",
    context: "Personal project",
    summary:
      "An OCR pipeline that turns inconsistent PDF invoices into structured data, and flags the fields it is unsure about instead of hiding them as silent errors.",
    metrics: [
      { value: 15, suffix: "+", label: "Structured fields per invoice" },
      { value: 89, suffix: "%", label: "Field-level accuracy" },
      { value: 70, suffix: "%", label: "Faster than manual entry" },
    ],
    points: [
      "Explainable confidence per field, so auditors review only the low-confidence extractions.",
      "Validation and output formatting run automatically across diverse invoice layouts.",
    ],
    stack: ["Python", "OCR", "Machine learning", "NLP"],
  },
  {
    slug: "shigotai",
    title: "Shigotai",
    kicker: "仕事 + AI",
    year: "2026",
    context: "Personal project",
    summary:
      "A career platform for people who want to work at Japanese companies. It matches your profile against live job postings and explains why you match, rather than showing a mystery score.",
    metrics: [
      { value: 4, label: "Live job-board APIs ingested" },
      { value: 3, label: "Matching stages: rules, semantic, LLM" },
      { value: 0, label: "API keys needed to run locally" },
    ],
    points: [
      "Resume parsing proposes fields for the user to accept, so nothing the model invents reaches a profile.",
      "Re-verifies postings over time and notifies you when a job's requirements change enough that you qualify.",
    ],
    stack: ["Next.js", "TypeScript", "FastAPI", "SQLAlchemy", "LLM"],
    github: "https://github.com/AnujD21/Shigotai",
  },
  {
    slug: "edgegrid",
    title: "EdgeGrid",
    year: "2026",
    context: "Personal project",
    summary:
      "A control plane for fleets of mixed edge devices. Devices check in, pull compatible firmware, verify and install it, report progress, and roll back on their own if anything fails.",
    metrics: [
      { value: "Auto", label: "Rollback on failed installs" },
      { value: "Live", label: "Device health over WebSockets" },
      { value: "Typed", label: "Firmware matched per device variant" },
    ],
    points: [
      "Django REST API with Celery workers on Redis and Django Channels for real-time status.",
      "Device-agent simulator and a full audit trail of releases, deployments and rollbacks.",
    ],
    stack: ["React", "TypeScript", "Django REST", "PostgreSQL", "Celery", "Docker"],
    github: "https://github.com/AnujD21/EdgeGrid",
  },
];
