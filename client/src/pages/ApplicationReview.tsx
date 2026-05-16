import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, Link } from "wouter";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PIPELINE_STAGES = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"] as const;
type Stage = (typeof PIPELINE_STAGES)[number];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Applied: { bg: "rgba(100,160,255,0.15)", color: "#64a0ff" },
  Screening: { bg: "rgba(255,200,80,0.15)", color: "#ffc850" },
  Interview: { bg: "rgba(150,100,255,0.15)", color: "#9664ff" },
  Offer: { bg: "rgba(80,220,180,0.15)", color: "#50dcb4" },
  Hired: { bg: "rgba(193,255,223,0.15)", color: "#c1ffdf" },
  Rejected: { bg: "rgba(255,100,100,0.15)", color: "#ff6464" },
};

export default function ApplicationReview() {
  const { id } = useParams<{ id: string }>();
  const appId = parseInt(id ?? "0", 10);
  const { user, isAuthenticated } = useAuth();
  const [note, setNote] = useState("");

  const utils = trpc.useUtils();

  const { data: app, isLoading } = trpc.applications.getById.useQuery(
    { id: appId },
    { enabled: !!appId && isAuthenticated && user?.role === "admin" }
  );
  const { data: notes = [], refetch: refetchNotes } = trpc.notes.list.useQuery(
    { applicationId: appId },
    { enabled: !!appId && isAuthenticated && user?.role === "admin" }
  );

  const updateStatus = trpc.applications.updateStatus.useMutation({
    onSuccess: () => utils.applications.getById.invalidate({ id: appId }),
  });
  const addNote = trpc.notes.add.useMutation({
    onSuccess: () => {
      setNote("");
      refetchNotes();
    },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 0", textAlign: "center" }}><h2>Access denied</h2></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 0", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Loading...</div>
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 0", textAlign: "center" }}>
          <h2>Application not found</h2>
          <Link href="/admin"><span className="btn-primary" style={{ marginTop: "24px", display: "inline-flex" }}>Back to admin</span></Link>
        </div>
      </div>
    );
  }

  const sc = STATUS_COLORS[app.status] ?? { bg: "rgba(255,255,255,0.1)", color: "#fff" };
  let formAnswers: Record<string, string> = {};
  try { formAnswers = JSON.parse(app.formAnswers ?? "{}"); } catch {}

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ paddingTop: "56px", paddingBottom: "80px" }}>
        <div className="container">
          {/* Back */}
          <Link href="/admin">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "15px", color: "rgba(255,255,255,0.5)", marginBottom: "32px", cursor: "pointer" }}>
              ← Back to dashboard
            </span>
          </Link>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px", alignItems: "start" }}>
            {/* Main content */}
            <div>
              {/* Header */}
              <div style={{ background: "var(--color-surface)", borderRadius: "16px", padding: "36px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ marginBottom: "6px" }}>{app.candidate?.name ?? "Candidate"}</h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", margin: 0 }}>
                      Applied for <strong style={{ color: "#fff" }}>{app.job?.title}</strong>
                    </p>
                  </div>
                  <span className="status-badge" style={{ background: sc.bg, color: sc.color, fontSize: "14px" }}>{app.status}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {[
                    { label: "Email", value: app.candidate?.email },
                    { label: "Phone", value: app.candidate?.phone ?? "—" },
                    { label: "LinkedIn", value: app.candidate?.linkedIn ?? "—" },
                    { label: "Portfolio", value: app.candidate?.portfolio ?? "—" },
                    { label: "Applied", value: new Date(app.createdAt).toLocaleDateString() },
                    { label: "Department", value: app.job?.department },
                  ].map((f) => (
                    <div key={f.label}>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</p>
                      <p style={{ fontSize: "15px", margin: 0, wordBreak: "break-all" }}>{f.value}</p>
                    </div>
                  ))}
                </div>

                {app.candidate?.skills && (
                  <div style={{ marginTop: "20px" }}>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Skills</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {app.candidate.skills.split(",").map((s) => (
                        <span key={s.trim()} className="tag-pill" style={{ fontSize: "13px", padding: "4px 14px" }}>{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cover letter */}
              {app.coverLetter && (
                <div style={{ background: "var(--color-surface)", borderRadius: "16px", padding: "36px", marginBottom: "24px" }}>
                  <h4 style={{ marginBottom: "20px" }}>Cover letter</h4>
                  <p style={{ fontSize: "16px", lineHeight: "1.7", color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap", margin: 0 }}>
                    {app.coverLetter}
                  </p>
                </div>
              )}

              {/* Experience */}
              {formAnswers.experience && (
                <div style={{ background: "var(--color-surface)", borderRadius: "16px", padding: "36px", marginBottom: "24px" }}>
                  <h4 style={{ marginBottom: "20px" }}>Relevant experience</h4>
                  <p style={{ fontSize: "16px", lineHeight: "1.7", color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap", margin: 0 }}>
                    {formAnswers.experience}
                  </p>
                </div>
              )}

              {/* Notes */}
              <div style={{ background: "var(--color-surface)", borderRadius: "16px", padding: "36px" }}>
                <h4 style={{ marginBottom: "24px" }}>Notes & comments</h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
                  {notes.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "15px" }}>No notes yet.</p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "16px" }}>
                        <p style={{ fontSize: "15px", lineHeight: "1.6", margin: "0 0 8px", color: "rgba(255,255,255,0.85)" }}>{n.content}</p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <textarea
                  className="lf-textarea"
                  placeholder="Add a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ minHeight: "100px", marginBottom: "12px" }}
                />
                <button
                  onClick={() => { if (note.trim()) addNote.mutate({ applicationId: appId, content: note }); }}
                  className="btn-primary"
                  style={{ padding: "10px 28px", fontSize: "14px" }}
                  disabled={addNote.isPending || !note.trim()}
                >
                  {addNote.isPending ? "Adding..." : "Add note"}
                </button>
              </div>
            </div>

            {/* Sidebar — pipeline */}
            <div style={{ position: "sticky", top: "88px" }}>
              <div style={{ background: "var(--color-surface)", borderRadius: "16px", padding: "28px" }}>
                <h5 style={{ marginBottom: "20px" }}>Move pipeline stage</h5>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {PIPELINE_STAGES.map((stage) => {
                    const isCurrent = app.status === stage;
                    const ssc = STATUS_COLORS[stage] ?? { bg: "rgba(255,255,255,0.1)", color: "#fff" };
                    return (
                      <button
                        key={stage}
                        onClick={() => !isCurrent && updateStatus.mutate({ id: appId, status: stage })}
                        disabled={isCurrent || updateStatus.isPending}
                        style={{
                          padding: "12px 16px",
                          borderRadius: "10px",
                          border: isCurrent ? `1px solid ${ssc.color}` : "1px solid rgba(255,255,255,0.1)",
                          background: isCurrent ? ssc.bg : "transparent",
                          color: isCurrent ? ssc.color : "rgba(255,255,255,0.6)",
                          cursor: isCurrent ? "default" : "pointer",
                          fontFamily: "var(--font-sans)",
                          fontSize: "14px",
                          fontWeight: isCurrent ? 600 : 400,
                          textAlign: "left",
                          transition: "all 150ms",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {stage}
                        {isCurrent && <span style={{ fontSize: "12px" }}>● current</span>}
                      </button>
                    );
                  })}
                </div>

                {app.candidate?.resumeUrl && (
                  <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <h5 style={{ marginBottom: "12px", fontSize: "16px" }}>Resume</h5>
                    <a
                      href={app.candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                      style={{ padding: "10px 20px", fontSize: "14px", display: "block", textAlign: "center" }}
                    >
                      View resume ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
