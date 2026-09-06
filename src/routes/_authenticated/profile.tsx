import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  LANGUAGES,
  PROFILE_BRANCHES,
  TARGET_ROLES,
  YEARS,
  useProfile,
  type ProfileBranch,
  type StudentProfile,
  type TargetRole,
  type Year,
} from "@/lib/profile";

const SKILL_TAGS = [
  "Problem solving",
  "DSA basics",
  "OOP",
  "SQL queries",
  "HTML/CSS",
  "React",
  "Node/Express",
  "Git & GitHub",
  "Linux",
  "Pandas / NumPy",
  "Machine learning",
  "Cloud basics",
];

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Create Your Student Profile — B.Tech Skills" },
      {
        name: "description",
        content:
          "Tell us your branch, year, known languages and target role so your learning roadmap and placement readiness are personalised to you.",
      },
      { property: "og:title", content: "Create Your Student Profile — B.Tech Skills" },
      {
        property: "og:description",
        content:
          "Set your branch, year, target job role and weekly study time to unlock a personalised B.Tech placement roadmap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { profile, hydrated, save } = useProfile();

  const [name, setName] = useState("");
  const [branch, setBranch] = useState<ProfileBranch>("CSE");
  const [year, setYear] = useState<Year>("2nd Year");
  const [role, setRole] = useState<TargetRole>("Software Developer");
  const [languages, setLanguages] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [hours, setHours] = useState(10);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setBranch(profile.branch);
    setYear(profile.year);
    setRole(profile.targetRole);
    setLanguages(profile.languages);
    setSkills(profile.skills);
    setHours(profile.weeklyHours);
  }, [profile]);

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: StudentProfile = {
      name: name.trim() || "Student",
      branch,
      year,
      languages,
      skills,
      targetRole: role,
      weeklyHours: hours,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    };
    save(next);
    navigate({ to: "/dashboard" });
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:py-12">
        <header>
          <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">
            {profile ? "Edit your profile" : "Create your profile"}
          </h1>
          <p className="mt-2 max-w-[52ch] text-sm text-muted-foreground">
            Seven quick answers. Everything after this — your roadmap, dashboard and what to learn
            next — is built from them.
          </p>
        </header>

        <form onSubmit={submit} className="space-y-8">
          <Field label="Your name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dhanush"
              className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>

          <Field label="B.Tech branch">
            <Chips
              options={[...PROFILE_BRANCHES]}
              selected={[branch]}
              onSelect={(v) => setBranch(v as ProfileBranch)}
            />
          </Field>

          <Field label="Current year">
            <Chips options={[...YEARS]} selected={[year]} onSelect={(v) => setYear(v as Year)} />
          </Field>

          <Field label="Target job role">
            <Chips
              options={[...TARGET_ROLES]}
              selected={[role]}
              onSelect={(v) => setRole(v as TargetRole)}
            />
          </Field>

          <Field label="Programming languages you know">
            <Chips
              options={[...LANGUAGES]}
              selected={languages}
              onSelect={(v) => toggle(languages, v, setLanguages)}
            />
          </Field>

          <Field label="Skills you already have">
            <Chips
              options={SKILL_TAGS}
              selected={skills}
              onSelect={(v) => toggle(skills, v, setSkills)}
            />
          </Field>

          <Field label={`Weekly study time — ${hours} hours`}>
            <input
              type="range"
              min={2}
              max={40}
              step={1}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </Field>

          <button
            type="submit"
            disabled={!hydrated}
            className="w-full rounded-sm bg-primary px-5 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
          >
            {profile ? "Save profile" : "Build my roadmap"}
          </button>
        </form>
      </main>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chips({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
