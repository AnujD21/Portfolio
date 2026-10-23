export interface EducationEntry {
  degree: string;
  institution: string;
  period: string;
  detail?: string;
}

export const education: EducationEntry[] = [
  {
    degree: "B.E. Computer Science Engineering, AI and Machine Learning",
    institution: "Easwari Engineering College, Chennai",
    period: "2023 - 2027",
    detail: "CGPA 8.63",
  },
  {
    degree: "Primary and Secondary Education, Class I to XII",
    institution: "Kendriya Vidyalaya No. 1, Mangalore",
    period: "2010 - 2023",
  },
];

export interface Certification {
  name: string;
  issuer: string;
  year?: string;
}

export const certifications: Certification[] = [
  { name: "Oracle Certified Professional: Java SE 11 Developer", issuer: "Oracle", year: "2026" },
  { name: "IoT and Privacy in Social Media", issuer: "NPTEL", year: "2025" },
  { name: "JLPT N3", issuer: "Japanese-Language Proficiency Test" },
  { name: "NAT-TEST 3Q", issuer: "Japanese language proficiency" },
];

export interface SpokenLanguage {
  name: string;
  native?: string;
  level?: string;
}

export const languages: SpokenLanguage[] = [
  { name: "English" },
  { name: "Hindi", native: "हिन्दी" },
  { name: "Japanese", native: "日本語", level: "JLPT N3" },
];
