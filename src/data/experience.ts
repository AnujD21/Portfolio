import type { Metric } from "./projects";

export interface ExperienceEntry {
  role: string;
  org: string;
  location: string;
  period: string;
  tags: string[];
  metrics: Metric[];
  points: string[];
}

export const experience: ExperienceEntry[] = [
  {
    role: "Software Engineering Intern",
    org: "Larsen & Toubro",
    location: "Chennai",
    period: "Jun 2025 - Jul 2025",
    tags: ["Python", "Scikit-learn", "IoT", "React"],
    metrics: [
      { value: 40, prefix: "~", suffix: "%", label: "Faster fault detection" },
      { value: 10, suffix: "+", label: "Live sensor devices ingested" },
      { value: 5, prefix: "<", suffix: " min", label: "Failure response, down from hours" },
      { value: 45, label: "Days from start to production" },
    ],
    points: [
      "Built a Scikit-learn pipeline that classifies and predicts sensor anomalies in industrial chiller systems.",
      "Engineered a real-time ingestion layer for live feeds from 10+ devices, powering the operations team's daily React dashboard.",
      "Replaced manual inspection with an automated ML-driven alert system.",
      "Shipped production software alongside mechanical and electrical engineers across three functional teams.",
    ],
  },
];
