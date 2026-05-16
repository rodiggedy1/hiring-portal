import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id ?? "0", 10);

  const { data: job, isLoading } = trpc.jobs.getById.useQuery({ id: jobId }, { enabled: !!jobId });
  const { data: moreJobs = [] } = trpc.jobs.list.useQuery({});

  if (isLoading) {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 0", textAlign: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "18px" }}>Loading...</div>
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
          <Link href="/">
            <span className="btn-primary" style={{ marginTop: "32px", display: "inline-flex" }}>
              Back to careers
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const otherJobs = moreJobs.filter((j) => j.id !== job.id).slice(0, 5);

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        style={{
          paddingTop: "80px",
          paddingBottom: "80px",
          background: "var(--color-background)",
          textAlign: "center",
        }}
      >
        <div className="container">
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px" }}>
            <span className="tag-pill">{job.type}</span>
            <span className="tag-pill">{job.location}</span>
          </div>
          <h1 style={{ marginBottom: "20px" }}>{job.title}</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: "560px", margin: "0 auto 40px", fontSize: "20px" }}>
            {job.summary ?? "Sodales neque sodales ut etiam sit. Sapien et ligula ullamcorper malesuada proin libero."}
          </p>
          <Link href={`/apply/${job.id}`}>
            <span className="btn-primary">Apply now</span>
          </Link>
        </div>
      </section>

      {/* ── Description ── */}
      <section className="section-surface" style={{ padding: "80px 0" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div
            style={{
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255,255,255,0.85)",
              whiteSpace: "pre-wrap",
            }}
          >
            {job.description}
          </div>

          {job.requirements && (
            <div style={{ marginTop: "48px" }}>
              <h3 style={{ marginBottom: "24px" }}>Requirements</h3>
              <div
                style={{
                  fontSize: "18px",
                  lineHeight: "1.7",
                  color: "rgba(255,255,255,0.85)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {job.requirements}
              </div>
            </div>
          )}

          <div style={{ marginTop: "56px", textAlign: "center" }}>
            <Link href={`/apply/${job.id}`}>
              <span className="btn-primary">Apply now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── More Open Positions ── */}
      {otherJobs.length > 0 && (
        <section style={{ padding: "80px 0" }}>
          <div className="container">
            <h2 style={{ marginBottom: "40px" }}>More open positions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {otherJobs.map((j) => (
                <div key={j.id} className="job-card">
                  <div style={{ flex: 1 }}>
                    <h5 style={{ marginBottom: "8px" }}>{j.title}</h5>
                    <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", margin: "0 0 16px" }}>
                      {j.summary ?? j.description.slice(0, 100) + "..."}
                    </p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <span className="tag-pill">{j.type}</span>
                      <span className="tag-pill">{j.location}</span>
                    </div>
                  </div>
                  <Link href={`/jobs/${j.id}`}>
                    <span className="btn-primary" style={{ padding: "12px 32px", fontSize: "14px", flexShrink: 0 }}>
                      See details
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
