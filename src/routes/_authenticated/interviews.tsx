import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { INTERVIEW_KINDS, branchInfo, type InterviewKind } from "@/data/branches";
import { getInterviewSet, gradeMockAnswer, type MockFeedback } from "@/lib/interview.functions";
import { getMyProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/interviews")({
  head: () => ({ meta: [
    { title: "Interview Preparation & Mock Practice | B.Tech Skills" },
    { name: "description", content: "Practice branch-specific technical, HR, coding, mock and company interview questions." },
    { property: "og:title", content: "B.Tech Interview Preparation" },
    { property: "og:description", content: "Branch-specific interview questions, model answers and AI feedback." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: InterviewsPage,
});

function InterviewsPage() {
  const loadProfile = useServerFn(getMyProfile);
  const loadSet = useServerFn(getInterviewSet);
  const gradeAnswer = useServerFn(gradeMockAnswer);
  const [kind, setKind] = useState<InterviewKind>("technical");
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<MockFeedback | null>(null);
  const profile = useQuery({ queryKey: ["my-profile"], queryFn: () => loadProfile(), retry: false });
  const questions = useQuery({ queryKey: ["interview-set", profile.data?.branch, kind], queryFn: () => loadSet({ data: { branch: profile.data?.branch ?? "cse", kind } }), enabled: Boolean(profile.data), retry: false });
  const branch = branchInfo(profile.data?.branch);
  const practiceQuestion = questions.data?.questions[0];

  async function submitMock() {
    if (!practiceQuestion || !answer.trim()) return;
    setGrading(true);
    try { setFeedback(await gradeAnswer({ data: { branch: branch.id, question: practiceQuestion.question, answer } })); } finally { setGrading(false); }
  }

  return <AppShell><main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
    <header className="border-b border-border pb-5"><p className="font-mono text-[10px] uppercase tracking-widest text-primary">Interview room</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{branch.label} interview preparation</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Learn what a strong answer includes, then practise speaking it in your own words.</p></header>
    <nav className="flex flex-wrap gap-2">{INTERVIEW_KINDS.filter((item) => item.id !== "company").map((item) => <Button key={item.id} variant={kind === item.id ? "default" : "secondary"} size="sm" onClick={() => { setKind(item.id); setFeedback(null); }}>{item.label}</Button>)}</nav>
    {!profile.isPending && !profile.data && <section className="border border-border bg-card p-8 text-center"><p className="text-sm text-muted-foreground">Complete your profile to get branch-specific interview questions.</p><Button asChild className="mt-4"><Link to="/profile">Complete profile</Link></Button></section>}
    {(profile.isPending || questions.isPending) && <p className="text-sm text-muted-foreground">Preparing your interview set…</p>}
    {questions.isError && <p role="alert" className="border-l-2 border-destructive pl-3 text-sm text-destructive">{questions.error instanceof Error ? questions.error.message : "Questions could not be loaded."}</p>}
    {questions.data && <><section><h2 className="text-2xl font-black">{questions.data.title}</h2><p className="mt-2 text-sm text-muted-foreground">{questions.data.intro}</p><div className="mt-4 space-y-3">{questions.data.questions.map((item, index) => <details key={item.question} className="border border-border bg-card p-4"><summary className="cursor-pointer list-none font-semibold"><span className="mr-2 font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>{item.question}</summary><div className="mt-4 border-t border-border pt-4"><p className="text-sm leading-relaxed">{item.answer}</p><p className="mt-3 text-xs text-muted-foreground"><strong className="text-foreground">What they check:</strong> {item.tip}</p></div></details>)}</div></section>
      {kind === "mock" && practiceQuestion && <section className="border-t border-border pt-6"><h2 className="text-xl font-black">Answer the first question</h2><p className="mt-2 text-sm">{practiceQuestion.question}</p><Textarea className="mt-4 min-h-36" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type the answer you would give aloud…" /><Button className="mt-3" onClick={submitMock} disabled={grading || !answer.trim()}>{grading ? "Reviewing…" : "Get feedback"}</Button>{feedback && <div className="mt-5 border-l-2 border-primary bg-card p-5"><p className="text-3xl font-black text-primary">{feedback.score}/10</p><h3 className="mt-4 font-bold">Strong points</h3><ul className="mt-2 list-disc pl-5 text-sm">{feedback.strengths.map((item) => <li key={item}>{item}</li>)}</ul><h3 className="mt-4 font-bold">Improve next</h3><ul className="mt-2 list-disc pl-5 text-sm">{feedback.improvements.map((item) => <li key={item}>{item}</li>)}</ul><h3 className="mt-4 font-bold">Model answer</h3><p className="mt-2 text-sm leading-relaxed">{feedback.modelAnswer}</p></div>}</section>}
    </>}
  </main></AppShell>;
}