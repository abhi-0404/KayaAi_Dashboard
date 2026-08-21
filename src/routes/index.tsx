import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Blocks,
  Boxes,
  FileStack,
  Gauge,
  HardHat,
  Loader2,
  Radio,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AuthPanel, type AuthMode } from "@/components/auth-panel";
import { useAuth } from "@/components/auth-context";
import { DEV_AUTH_BYPASS } from "@/lib/dev-auth";
import dashboardImage from "@/assets/kaya-ai-dashboard-image.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kaya AI — Smart Glasses Construction Command Center" },
      {
        name: "description",
        content:
          "Kaya AI turns Meta Smart Glasses into a live construction command center: hazard detection, worker telemetry, blueprint approvals and AI site reports in real time.",
      },
      { property: "og:title", content: "Kaya AI — Construction Command Center" },
      {
        property: "og:description",
        content:
          "Live hazard detection, worker telemetry and AI site reports streamed from smart glasses to one operational view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: Radio,
    title: "Live smart-glasses feeds",
    body: "Stream first-person video, voice transcripts and AI detections from every crew member on site.",
  },
  {
    icon: TriangleAlert,
    title: "Hazard detection in 1.2s",
    body: "Computer vision flags missing PPE, fall risk and exclusion-zone breaches before they escalate.",
  },
  {
    icon: FileStack,
    title: "Blueprint approvals",
    body: "Version-controlled drawings with AI risk analysis and a clean admin approval trail.",
  },
  {
    icon: Gauge,
    title: "Workforce telemetry",
    body: "Battery, location, session length and productivity signals for every connected worker.",
  },
  {
    icon: Sparkles,
    title: "AI site reports",
    body: "Daily narrative reports generated from sessions, issues and progress — no manual write-ups.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    body: "Admin and Supervisor roles with approval gating, audit logging and least-privilege defaults.",
  },
] as const;

const stats = [
  ["42 ms", "Edge stream latency"],
  ["31", "Glasses in fleet"],
  ["1.2 s", "Hazard alert time"],
  ["24/7", "Site coverage"],
] as const;

const steps = [
  {
    icon: Boxes,
    step: "01",
    title: "Pair the glasses",
    body: "Enrol Meta Smart Glasses to a project and crew. Devices stream over your existing site network.",
  },
  {
    icon: Blocks,
    step: "02",
    title: "AI watches the work",
    body: "Detections, voice notes and progress signals flow into projects, tasks and issue boards automatically.",
  },
  {
    icon: Gauge,
    step: "03",
    title: "Supervise from anywhere",
    body: "Triage hazards, approve blueprints and read AI daily reports from the command center.",
  },
] as const;

function LandingPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");

  useEffect(() => {
    // Under the local bypass the session is synthetic and always present, which
    // would bounce every visit straight to the dashboard and make the landing
    // page unreachable. The intended flow is land -> authorise -> dashboard, so
    // the bypass only removes the gate, it does not skip the front door.
    if (DEV_AUTH_BYPASS) return;
    if (!loading && session) {
      void navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, session, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header — same language as the command center's top bar */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary">
              <HardHat className="h-4 w-4 text-primary-foreground" strokeWidth={2.2} />
            </span>
            <span className="text-[17px] font-bold tracking-tight">
              Kaya<span className="text-primary">AI</span>
            </span>
          </div>

          <nav className="mx-auto hidden items-center gap-0.5 md:flex">
            {[
              ["Platform", "#platform"],
              ["How it works", "#how"],
              ["Access", "#access"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-nav-active/70 hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {!loading && session ? (
              <Link
                to="/dashboard"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong"
              >
                Open command center
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <a
                  href="#access"
                  className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
                >
                  Sign in
                </a>
                <a
                  href="#access"
                  className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong"
                >
                  Get access
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero + access */}
      <section className="relative overflow-hidden">
        {/* Setting-out grid: the construction cue, kept faint */}
        <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-card/80 to-transparent" />

        <div className="relative mx-auto grid max-w-[1400px] gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,420px)] lg:gap-14 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Meta smart glasses integrated
            </span>

            <h1 className="mt-6 max-w-2xl text-[2.5rem] font-bold leading-[1.06] tracking-[-0.035em] lg:text-[3.75rem]">
              Run every jobsite from one live command center.
            </h1>

            {/* Hazard stripe as a rule — one deliberate site reference */}
            <div className="hazard-tape mt-7 h-1.5 w-28 rounded-full" />

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Kaya AI streams what your crew sees — hazards, blueprints, progress and worker
              telemetry — into a single operational surface built for construction teams that move
              fast and stay compliant.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#access"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong"
              >
                Create your account
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#platform"
                className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-sm font-semibold transition-colors hover:bg-accent"
              >
                See the platform
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(([value, label]) => (
                <div key={label} className="panel px-4 py-3.5">
                  <dt className="num text-[22px] font-bold leading-none tracking-tight">{value}</dt>
                  <dd className="mt-1.5 text-[11px] leading-tight text-muted-foreground">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Access card */}
          <div id="access" className="scroll-mt-24">
            <div className="panel p-6 shadow-raised">
              <h2 className="text-[19px] font-bold tracking-tight">Access the command center</h2>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                Sign in with Google or an email and password.
              </p>

              {session && !DEV_AUTH_BYPASS ? (
                <div className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening command center…
                </div>
              ) : (
                <div className="mt-5">
                  <AuthPanel mode={mode} onModeChange={setMode} />

                  {DEV_AUTH_BYPASS && (
                    <div className="mt-5 border-t border-border pt-5">
                      <Link
                        to="/dashboard"
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-dashed border-warning/60 bg-warning/8 text-[13px] font-semibold text-warning-foreground/85 transition-colors hover:bg-warning/14"
                      >
                        Skip sign-in (local dev only)
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                        Visible because the dev bypass is enabled. Production builds never render
                        this.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="scroll-mt-20">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              The platform
            </p>
            <h2 className="mt-3 text-[2rem] font-bold tracking-[-0.03em] lg:text-[2.5rem]">
              What the crew sees, your office sees instantly.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Every session is transcribed, analysed and indexed against the right project, task and
              blueprint — so supervisors act on signal, not screenshots.
            </p>
          </div>

          {/* The product shot keeps a dark frame: it is a camera feed, and a dark
              mount is what makes the overlay legible. */}
          <div className="mt-10 overflow-hidden rounded-3xl bg-ink p-2 shadow-raised">
            <img
              src={dashboardImage}
              alt="Kaya AI Dashboard showing real-time construction site monitoring, worker telemetry, hazard detection and project management"
              className="h-auto w-full rounded-2xl object-cover"
            />
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="panel p-5 transition-shadow hover:shadow-raised">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.9} />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <h2 className="text-[2rem] font-bold tracking-[-0.03em] lg:text-[2.5rem]">
            Live in three steps.
          </h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {steps.map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="panel p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.9} />
                  </span>
                  <span className="num text-[28px] font-bold leading-none text-border">{step}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — the one saturated surface, matching the dashboard's brand card */}
      <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="brand-panel flex flex-col items-start justify-between gap-6 p-8 lg:flex-row lg:items-center lg:p-10">
          <div>
            <h2 className="text-[1.75rem] font-bold tracking-[-0.03em] lg:text-[2rem]">
              Bring your next site online today.
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed opacity-85">
              Create an account in seconds — an administrator approves access and assigns your role.
            </p>
          </div>
          <a
            href="#access"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-card px-6 text-sm font-semibold text-primary transition-transform hover:scale-[1.02]"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Kaya AI · Construction Command Center</p>
          <p>Restricted system. All sessions are logged and auditable.</p>
        </div>
      </footer>
    </div>
  );
}
