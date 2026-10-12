import { useCallback, useEffect, useState } from "react";
import type { Branch } from "@/data/skills";

export const PROFILE_BRANCHES = [
  "CSE",
  "IT",
  "AIML",
  "Data Science",
  "ECE",
  "EEE",
  "Mechanical",
  "Civil",
  "Other",
] as const;
export type ProfileBranch = (typeof PROFILE_BRANCHES)[number];

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;
export type Year = (typeof YEARS)[number];

export const TARGET_ROLES = [
  "Software Developer",
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Developer",
  "Data Analyst",
  "Data Scientist",
  "AI/ML Engineer",
  "Cloud/DevOps Engineer",
  "Cybersecurity",
  "Other",
] as const;
export type TargetRole = (typeof TARGET_ROLES)[number];

export const LANGUAGES = ["C", "C++", "Java", "Python", "JavaScript", "SQL", "Go", "R"] as const;

export interface StudentProfile {
  name: string;
  branch: ProfileBranch;
  year: Year;
  languages: string[];
  skills: string[];
  targetRole: TargetRole;
  weeklyHours: number;
  createdAt: string;
}

const KEY = "student-profile-v1";

/** Maps every profile branch onto one of the four content tracks. */
export function contentBranch(branch: ProfileBranch): Branch {
  switch (branch) {
    case "IT":
      return "IT";
    case "AIML":
      return "AIML";
    case "Data Science":
      return "DS";
    default:
      return "CSE";
  }
}

export function readProfile(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StudentProfile) : null;
  } catch {
    return null;
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(readProfile());
    setHydrated(true);
  }, []);

  const save = useCallback((next: StudentProfile) => {
    setProfile(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — keep in-memory */
    }
  }, []);

  const clear = useCallback(() => {
    setProfile(null);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { profile, hydrated, save, clear };
}
