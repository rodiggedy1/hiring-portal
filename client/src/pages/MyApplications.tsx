import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
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

export default function MyApplications() {
  const { isAuthenticated, loading } = useAuth();
  const { data: applications = [], isLoading } = trpc.applications.mine.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 0", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <section style={{ padding: "120px 0", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: "480px" }}>
            <h2 style={{ marginBottom: "16px" }}>Sign in to view your applications</h2>
            <a href={getLoginUrl()} className="btn-primary">
              Sign in
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

      <section style={{ paddingTop: "72px", paddingBottom: "80px" }}>
        <div className="container">
          <h1 style={{ fontSize: "48px", marginBottom: "8px" }}>My applications</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: "48px", fontSize: "18px" }}>
            Track the status of your job applications.
          </p>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ background: "var(--color-surface)", borderRadius: "12px", height: "96px", opacity: 0.5 }} />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: "16px",
                padding: "80px 40px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "18px", marginBottom: "32px" }}>
                You haven't applied to any positions yet.
              </p>
              <Link href="/">
                <span className="btn-primary">Browse open positions</span>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {applications.map((app) => {
                const statusStyle = STATUS_COLORS[app.status] ?? { bg: "rgba(255,255,255,0.1)", color: "#fff" };
                return (
                  <div key={app.id} className="job-card">
                    <div style={{ flex: 1 }}>
                      <h5 style={{ marginBottom: "6px" }}>{app.job?.title ?? "Position"}</h5>
                      <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", margin: "0 0 14px" }}>
                        {app.job?.department} · {app.job?.location}
                      </p>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span
                          className="status-badge"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                          {app.status}
                        </span>
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {app.job && (
                      <Link href={`/jobs/${app.job.id}`}>
                        <span className="btn-outline" style={{ padding: "10px 24px", fontSize: "14px", flexShrink: 0 }}>
                          View job
                        </span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
