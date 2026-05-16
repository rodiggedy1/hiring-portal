import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Applied: { bg: "rgba(100,160,255,0.15)", color: "#64a0ff" },
  Screening: { bg: "rgba(255,200,80,0.15)", color: "#ffc850" },
  Interview: { bg: "rgba(150,100,255,0.15)", color: "#9664ff" },
  Offer: { bg: "rgba(80,220,180,0.15)", color: "#50dcb4" },
  Hired: { bg: "rgba(193,255,223,0.15)", color: "#c1ffdf" },
  Rejected: { bg: "rgba(255,100,100,0.15)", color: "#ff6464" },
};

type Tab = "overview" | "jobs" | "applications";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");

  const { data: stats } = trpc.admin.dashboard.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: allJobs = [], refetch: refetchJobs } = trpc.jobs.listAll.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: allApps = [] } = trpc.applications.listAll.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  const updateStatus = trpc.applications.updateStatus.useMutation({
    onSuccess: () => trpc.useUtils().applications.listAll.invalidate(),
  });
  const deleteJob = trpc.jobs.delete.useMutation({ onSuccess: () => refetchJobs() });
  const updateJob = trpc.jobs.update.useMutation({ onSuccess: () => refetchJobs() });

  if (loading) {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 0", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 0", textAlign: "center" }}>
          <h2>Access denied</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "16px" }}>You need admin access to view this page.</p>
        </div>
      </div>
    );
  }

  const PIPELINE_STAGES = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ paddingTop: "56px", paddingBottom: "80px" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
            <div>
              <h1 style={{ fontSize: "40px", marginBottom: "6px" }}>Admin Dashboard</h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px" }}>Manage jobs, review candidates, and track your pipeline.</p>
            </div>
            <Link href="/admin/jobs/new">
              <span className="btn-primary" style={{ padding: "12px 32px", fontSize: "15px" }}>+ Post a job</span>
            </Link>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "40px", background: "var(--color-surface)", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
            {(["overview", "jobs", "applications"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "8px 24px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: 500,
                  fontFamily: "var(--font-sans)",
                  background: tab === t ? "var(--color-accent)" : "transparent",
                  color: tab === t ? "#000" : "rgba(255,255,255,0.6)",
                  transition: "all 150ms",
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── Overview Tab ── */}
          {tab === "overview" && (
            <div>
              {/* Stats cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "48px" }}>
                {[
                  { label: "Active Jobs", value: stats?.activeJobs ?? 0, color: "#c1ffdf" },
                  { label: "Total Applicants", value: stats?.totalApplicants ?? 0, color: "#64a0ff" },
                  { label: "Hired", value: stats?.pipeline?.Hired ?? 0, color: "#50dcb4" },
                  { label: "In Progress", value: ((stats?.pipeline?.Screening ?? 0) + (stats?.pipeline?.Interview ?? 0) + (stats?.pipeline?.Offer ?? 0)), color: "#ffc850" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "var(--color-surface)", borderRadius: "12px", padding: "28px 24px" }}>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", margin: "0 0 12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: "40px", fontWeight: 600, color: s.color, margin: 0, lineHeight: 1 }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pipeline breakdown */}
              <h3 style={{ marginBottom: "24px" }}>Pipeline breakdown</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {PIPELINE_STAGES.map((stage) => {
                  const count = stats?.pipeline?.[stage] ?? 0;
                  const sc = STATUS_COLORS[stage] ?? { bg: "rgba(255,255,255,0.1)", color: "#fff" };
                  return (
                    <div key={stage} style={{ background: "var(--color-surface)", borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>{stage}</span>
                      <span style={{ fontSize: "28px", fontWeight: 600, color: sc.color }}>{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Recent applications */}
              <h3 style={{ marginTop: "48px", marginBottom: "24px" }}>Recent applications</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {allApps.slice(0, 8).map((app) => {
                  const sc = STATUS_COLORS[app.status] ?? { bg: "rgba(255,255,255,0.1)", color: "#fff" };
                  return (
                    <div key={app.id} className="job-card" style={{ padding: "20px 24px" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 500, fontSize: "16px", margin: "0 0 4px" }}>{app.candidate?.name ?? "Candidate"}</p>
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", margin: 0 }}>{app.job?.title ?? "Position"}</p>
                      </div>
                      <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>{app.status}</span>
                      <Link href={`/admin/applications/${app.id}`}>
                        <span className="btn-outline" style={{ padding: "8px 20px", fontSize: "13px", marginLeft: "16px" }}>Review</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Jobs Tab ── */}
          {tab === "jobs" && (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {allJobs.length === 0 ? (
                  <div style={{ background: "var(--color-surface)", borderRadius: "16px", padding: "60px", textAlign: "center" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}>No jobs yet.</p>
                    <Link href="/admin/jobs/new">
                      <span className="btn-primary">Post your first job</span>
                    </Link>
                  </div>
                ) : (
                  allJobs.map((job) => (
                    <div key={job.id} className="job-card">
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                          <h5 style={{ margin: 0 }}>{job.title}</h5>
                          <span
                            className="status-badge"
                            style={{
                              background: job.status === "published" ? "rgba(193,255,223,0.15)" : job.status === "closed" ? "rgba(255,100,100,0.15)" : "rgba(255,255,255,0.1)",
                              color: job.status === "published" ? "#c1ffdf" : job.status === "closed" ? "#ff6464" : "rgba(255,255,255,0.5)",
                            }}
                          >
                            {job.status}
                          </span>
                        </div>
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                          {job.department} · {job.location} · {job.type}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => updateJob.mutate({ id: job.id, status: job.status === "published" ? "draft" : "published" })}
                          className="btn-outline"
                          style={{ padding: "8px 20px", fontSize: "13px" }}
                        >
                          {job.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <Link href={`/admin/jobs/${job.id}/edit`}>
                          <span className="btn-outline" style={{ padding: "8px 20px", fontSize: "13px" }}>Edit</span>
                        </Link>
                        <button
                          onClick={() => { if (confirm("Delete this job?")) deleteJob.mutate({ id: job.id }); }}
                          style={{ padding: "8px 20px", fontSize: "13px", background: "rgba(255,80,80,0.12)", color: "#ff8080", border: "1px solid rgba(255,80,80,0.3)", borderRadius: "var(--radius-pill)", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Applications Tab ── */}
          {tab === "applications" && (
            <div>
              {/* Kanban-style columns */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {PIPELINE_STAGES.map((stage) => {
                  const stageApps = allApps.filter((a) => a.status === stage);
                  const sc = STATUS_COLORS[stage] ?? { bg: "rgba(255,255,255,0.1)", color: "#fff" };
                  return (
                    <div key={stage} style={{ background: "var(--color-surface)", borderRadius: "12px", padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>{stage}</span>
                        <span style={{ fontSize: "20px", fontWeight: 600, color: sc.color }}>{stageApps.length}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {stageApps.map((app) => (
                          <div
                            key={app.id}
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              borderRadius: "8px",
                              padding: "14px",
                              cursor: "pointer",
                            }}
                            onClick={() => navigate(`/admin/applications/${app.id}`)}
                          >
                            <p style={{ fontWeight: 500, fontSize: "14px", margin: "0 0 4px" }}>{app.candidate?.name ?? "Candidate"}</p>
                            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{app.job?.title}</p>
                          </div>
                        ))}
                        {stageApps.length === 0 && (
                          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0" }}>Empty</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
