import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BRANCHES, branchInfo, YEARS, semestersForYear } from "@/data/branches";
import { getMyProfile, saveMyProfile } from "@/lib/profile.functions";

const SKILL_TAGS = [
  "Problem solving",
  "DSA basics",
  "OOP",
  "SQL queries",
  "Web development",
  "Git & GitHub",
  "Linux",
  "Python",
  "Machine learning",
  "Cloud basics",
  "CAD / simulation",
  "Aptitude",
];

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile & Career Goal | B.Tech Skills" },
      { name: "description", content: "Save your B.Tech branch, semester, skills and career goal for a personalised learning roadmap." },
      { property: "og:title", content: "Student Profile — B.Tech Skills" },
      { property: "og:description", content: "Build a personalised B.Tech learning and placement plan from your current profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const loadProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(saveMyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("cse");
  const [year, setYear] = useState(2);
  const [semester, setSemester] = useState(3);
  const [careerGoal, setCareerGoal] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [hours, setHours] = useState(10);

  useEffect(() => {
    let active = true;
    loadProfile()
      .then((profile) => {
        if (!active || !profile) return;
        setName(profile.name);
        setBranch(profile.branch);
        setYear(profile.year);
        setSemester(profile.semester);
        setCareerGoal(profile.career_goal);
        setTargetJob(profile.target_job);
        setLanguages(profile.languages);
        setSkills(profile.skills);
        setHours(profile.weekly_hours);
      })
      .catch((cause) => active && setError(cause instanceof Error ? cause.message : "Your profile could not be loaded."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [loadProfile]);

  const selectedBranch = branchInfo(branch);
  const validSemesters = semestersForYear(year);

  function toggle(list: string[], value: string, set: (values: string[]) => void) {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await saveProfile({
        data: {
          name: name.trim() || "Student",
          branch,
          year,
          semester,
          career_goal: careerGoal.trim(),
          target_job: targetJob.trim(),
          languages,
          skills,
          weekly_hours: hours,
        },
      });
      await navigate({ to: "/roadmap" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AppShell><main className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">Loading your profile…</main></AppShell>;
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:py-12">
        <header className="border-b border-border pb-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Personalisation</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Your student profile</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Your saved profile shapes your semester roadmap, projects, practice and interview preparation on every device.</p>
        </header>

        <form onSubmit={submit} className="space-y-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" maxLength={80} /></Field>
            <Field label="Weekly study time"><div className="flex h-9 items-center gap-4"><input type="range" min={1} max={40} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full accent-primary" /><span className="w-16 text-right text-sm font-bold">{hours} hrs</span></div></Field>
          </div>

          <Field label="B.Tech branch">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {BRANCHES.map((option) => <Choice key={option.id} active={branch === option.id} onClick={() => { setBranch(option.id); setCareerGoal(""); setTargetJob(""); setLanguages([]); }}>{option.label}</Choice>)}
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Current year"><div className="grid grid-cols-4 gap-2">{YEARS.map((value) => <Choice key={value} active={year === value} onClick={() => { setYear(value); setSemester(semestersForYear(value)[0] ?? 1); }}>{value}</Choice>)}</div></Field>
            <Field label="Current semester"><div className="grid grid-cols-2 gap-2">{validSemesters.map((value) => <Choice key={value} active={semester === value} onClick={() => setSemester(value)}>Semester {value}</Choice>)}</div></Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Career goal"><select value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Choose a goal</option>{selectedBranch.careerGoals.map((goal) => <option key={goal}>{goal}</option>)}</select></Field>
            <Field label="Target job"><select value={targetJob} onChange={(e) => setTargetJob(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Choose a target job</option>{selectedBranch.targetJobs.map((job) => <option key={job}>{job}</option>)}</select></Field>
          </div>

          <Field label="Languages and tools you know"><div className="flex flex-wrap gap-2">{selectedBranch.languages.map((item) => <Choice key={item} active={languages.includes(item)} onClick={() => toggle(languages, item, setLanguages)}>{item}</Choice>)}</div></Field>
          <Field label="Current skills"><div className="flex flex-wrap gap-2">{[...new Set([...selectedBranch.skills, ...SKILL_TAGS])].map((item) => <Choice key={item} active={skills.includes(item)} onClick={() => toggle(skills, item, setSkills)}>{item}</Choice>)}</div></Field>
          <Field label="Anything else about your goal"><Textarea value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} placeholder="Choose a goal above or describe your own goal" maxLength={120} /></Field>

          {error && <p role="alert" className="border-l-2 border-destructive pl-3 text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" disabled={saving}>{saving ? "Saving…" : "Save and build my roadmap"}</Button>
        </form>
      </main>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>{children}</label>;
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <Button type="button" variant={active ? "default" : "secondary"} size="sm" onClick={onClick} className="h-auto min-h-8 whitespace-normal">{children}</Button>;
}