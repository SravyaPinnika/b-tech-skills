import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AuthButton } from "@/components/AuthButton";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/courses", label: "Courses" },
  { to: "/interview-prep", label: "Interview Prep" },
  { to: "/profile", label: "Profile" },
  { to: "/jobs", label: "Jobs" },
  { to: "/tools", label: "Tools" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="font-mono text-xs font-bold uppercase tracking-tighter">
            B.Tech <span className="text-primary">Skills</span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <AuthButton />
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="rounded-sm border border-border p-2 md:hidden"
            >
              <span className="block h-[2px] w-4 bg-foreground" />
              <span className="mt-1 block h-[2px] w-4 bg-foreground" />
              <span className="mt-1 block h-[2px] w-4 bg-foreground" />
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border bg-background px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  className="rounded-sm px-2 py-2 text-sm font-semibold text-foreground/90 hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 border-t border-border pt-3">
              <AuthButton />
            </div>
          </div>
        )}
      </header>

      {children}

      <footer className="border-t border-border/50 py-10 text-center">
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          B.Tech Skills — learn, track, get placed
        </div>
      </footer>
    </div>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
