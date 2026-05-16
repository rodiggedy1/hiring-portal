import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Step = 1 | 2 | 3;

interface FormData {
  name: string;
  email: string;
  phone: string;
  linkedIn: string;
  portfolio: string;
  skills: string;
  experience: string;
  coverLetter: string;
}

const TOTAL_STEPS = 3;

export default function Apply() {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id ?? "0", 10);
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const { data: job, isLoading: jobLoading } = trpc.jobs.getById.useQuery(
    { id: jobId },
    { enabled: !!jobId }
  );

  const applyMutation = trpc.applications.submit.useMutation({
    onSuccess: () => navigate(`/thank-you?job=${encodeURIComponent(job?.title ?? "")}`),
  });

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    linkedIn: "",
    portfolio: "",
    skills: "",
    experience: "",
    coverLetter: "",
  });
  const [error, setError] = useState("");

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const next = () => {
    setError("");
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim()) {
        setError("Please fill in your name and email.");
        return;
      }
    }
    if (step < TOTAL_STEPS) setStep((s) => (s + 1) as Step);
  };

  const back = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const submit = async () => {
    setError("");
    if (!form.coverLetter.trim()) {
      setError("Please write a cover letter.");
      return;
    }
    try {
      await applyMutation.mutateAsync({
        jobId,
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        skills: form.skills || undefined,
        linkedIn: form.linkedIn || undefined,
        portfolio: form.portfolio || undefined,
        coverLetter: form.coverLetter,
        formAnswers: JSON.stringify({ experience: form.experience }),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(msg);
    }
  };

  if (authLoading || jobLoading) {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 0", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 0", textAlign: "center" }}>
          <h2>Position not found</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <section style={{ padding: "120px 0", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: "480px" }}>
            <h2 style={{ marginBottom: "16px" }}>Sign in to apply</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "40px" }}>
              You need an account to apply for <strong>{job.title}</strong>.
            </p>
            <a href={getLoginUrl()} className="btn-primary">
              Sign in / Create account
            </a>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── Header ── */}
      <section style={{ paddingTop: "64px", paddingBottom: "48px", textAlign: "center" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "20px" }}>
            <span className="tag-pill">{job.type}</span>
            <span className="tag-pill">{job.location}</span>
          </div>
          <h1 style={{ fontSize: "48px", marginBottom: "8px" }}>{job.title}</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px" }}>Application form</p>
        </div>
      </section>

      {/* ── Form card ── */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container" style={{ maxWidth: "640px" }}>
          {/* Step indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "48px",
            }}
          >
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`step-dot ${s === step ? "active" : s < step ? "done" : ""}`}
              />
            ))}
          </div>

          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: "16px",
              padding: "48px",
            }}
          >
            {/* Step 1 — Personal Info */}
            {step === 1 && (
              <div>
                <h3 style={{ marginBottom: "8px" }}>Personal information</h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "16px", marginBottom: "36px" }}>
                  Tell us a bit about yourself.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>
                      Full name *
                    </label>
                    <input className="lf-input" placeholder="John Smith" value={form.name} onChange={set("name")} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>
                      Email address *
                    </label>
                    <input className="lf-input" type="email" placeholder="john@example.com" value={form.email} onChange={set("email")} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>
                      Phone number
                    </label>
                    <input className="lf-input" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set("phone")} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>
                      LinkedIn profile
                    </label>
                    <input className="lf-input" placeholder="https://linkedin.com/in/..." value={form.linkedIn} onChange={set("linkedIn")} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>
                      Portfolio / Website
                    </label>
                    <input className="lf-input" placeholder="https://yoursite.com" value={form.portfolio} onChange={set("portfolio")} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Experience & Skills */}
            {step === 2 && (
              <div>
                <h3 style={{ marginBottom: "8px" }}>Experience & skills</h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "16px", marginBottom: "36px" }}>
                  Share your background and what you bring to the table.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>
                      Key skills
                    </label>
                    <input
                      className="lf-input"
                      placeholder="e.g. React, TypeScript, Node.js"
                      value={form.skills}
                      onChange={set("skills")}
                    />
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>
                      Separate skills with commas
                    </p>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>
                      Relevant experience
                    </label>
                    <textarea
                      className="lf-textarea"
                      style={{ minHeight: "160px" }}
                      placeholder="Describe your most relevant experience for this role..."
                      value={form.experience}
                      onChange={set("experience")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Cover Letter */}
            {step === 3 && (
              <div>
                <h3 style={{ marginBottom: "8px" }}>Cover letter</h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "16px", marginBottom: "36px" }}>
                  Tell us why you're a great fit for this role.
                </p>
                <div>
                  <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>
                    Cover letter *
                  </label>
                  <textarea
                    className="lf-textarea"
                    style={{ minHeight: "240px" }}
                    placeholder="Dear Hiring Manager, I am excited to apply for..."
                    value={form.coverLetter}
                    onChange={set("coverLetter")}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "12px 16px",
                  background: "rgba(255,80,80,0.12)",
                  border: "1px solid rgba(255,80,80,0.3)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#ff8080",
                }}
              >
                {error}
              </div>
            )}

            {/* Navigation */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "40px",
              }}
            >
              {step > 1 ? (
                <button onClick={back} className="btn-outline" style={{ padding: "12px 32px", fontSize: "15px" }}>
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < TOTAL_STEPS ? (
                <button onClick={next} className="btn-primary" style={{ padding: "12px 40px", fontSize: "15px" }}>
                  Next step
                </button>
              ) : (
                <button
                  onClick={submit}
                  className="btn-primary"
                  style={{ padding: "12px 40px", fontSize: "15px" }}
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending ? "Submitting..." : "Submit application"}
                </button>
              )}
            </div>
          </div>

          {/* Step label */}
          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
