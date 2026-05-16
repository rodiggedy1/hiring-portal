import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useState } from "react";

const VALUES = [
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="rgba(193,255,223,0.1)" />
        <path d="M13 27c0-3.866 3.134-7 7-7s7 3.134 7 7M20 20a4 4 0 100-8 4 4 0 000 8z" stroke="#c1ffdf" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 27c0-2.761 2.239-5 5-5M32 27c0-2.761-2.239-5-5-5" stroke="#c1ffdf" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "User-centered",
    desc: "Duis aute irure dolor in reprehenderit in volvelit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="rgba(193,255,223,0.1)" />
        <path d="M14 20l4 4 8-8" stroke="#c1ffdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 10c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10" stroke="#c1ffdf" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Support",
    desc: "Duis aute irure dolor in reprehenderit in volvelit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="rgba(193,255,223,0.1)" />
        <path d="M20 28V20M20 20l-4-4M20 20l4-4M12 12h16" stroke="#c1ffdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Growth",
    desc: "Duis aute irure dolor in reprehenderit in volvelit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="rgba(193,255,223,0.1)" />
        <path d="M20 11l2.472 5.01L28 16.82l-4 3.9.944 5.504L20 23.51l-4.944 2.714L16 20.72l-4-3.9 5.528-.81L20 11z" stroke="#c1ffdf" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: "Quality",
    desc: "Duis aute irure dolor in reprehenderit in volvelit esse cillum dolore eu fugiat nulla pariatur.",
  },
];

const BENEFITS = [
  { icon: "💰", title: "Fair compensation", desc: "Duis aute irure dolor in reprehenderit in volvelit esse cillum dolore eu fugiat nulla pariatur." },
  { icon: "🏥", title: "Health insurance", desc: "Duis aute irure dolor in reprehenderit in volvelit esse cillum dolore eu fugiat nulla pariatur." },
  { icon: "🎁", title: "Paid time off", desc: "Duis aute irure dolor in reprehenderit in volvelit esse cillum dolore eu fugiat nulla pariatur." },
  { icon: "✈️", title: "Annual retreat", desc: "Duis aute irure dolor in reprehenderit in volvelit esse cillum dolore eu fugiat nulla pariatur." },
  { icon: "🖥️", title: "Office setup", desc: "Duis aute irure dolor in reprehenderit in volvelit esse cillum dolore eu fugiat nulla pariatur." },
  { icon: "🏠", title: "Remote work", desc: "Duis aute irure dolor in reprehenderit in volvelit esse cillum dolore eu fugiat nulla pariatur." },
];

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [department, setDepartment] = useState("");

  const { data: jobs = [], isLoading } = trpc.jobs.list.useQuery({
    keyword: keyword || undefined,
    department: department || undefined,
  });

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        style={{
          paddingTop: "100px",
          paddingBottom: "80px",
          background: "var(--color-background)",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
            gap: "60px",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "24px" }}>
              Join our team of talented workforce
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "40px", fontSize: "20px" }}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse.
            </p>
            <a href="#open-positions" className="btn-primary">
              See open positions
            </a>
          </div>
          <div style={{ position: "relative" }}>
            <img
              src="https://cdn.prod.website-files.com/6402b718931f164b8e49168a/6402b718931f1634cc4916c5_Frame%2024-min.jpg"
              alt="Team collaboration"
              style={{
                width: "100%",
                borderRadius: "16px",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section className="section-surface" style={{ padding: "80px 0" }}>
        <div className="container">
          <h2 style={{ marginBottom: "56px" }}>Our values</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "40px",
            }}
          >
            {VALUES.map((v) => (
              <div key={v.title}>
                <div style={{ marginBottom: "20px" }}>{v.icon}</div>
                <h5 style={{ marginBottom: "12px" }}>{v.title}</h5>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: "1.6" }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Positions ── */}
      <section id="open-positions" style={{ padding: "80px 0" }}>
        <div className="container">
          <h2 style={{ marginBottom: "40px" }}>Open positions</h2>

          {/* Filters */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "40px", flexWrap: "wrap" }}>
            <input
              className="lf-input"
              style={{ maxWidth: "320px" }}
              placeholder="Search by keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <input
              className="lf-input"
              style={{ maxWidth: "220px" }}
              placeholder="Department..."
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          {/* Job list */}
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "12px",
                    height: "96px",
                    opacity: 0.5,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.4)" }}>
              <p style={{ fontSize: "20px" }}>No open positions at the moment.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div style={{ flex: 1 }}>
                    <h5 style={{ marginBottom: "8px" }}>{job.title}</h5>
                    <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", margin: "0 0 16px" }}>
                      {job.summary ?? job.description.slice(0, 120) + "..."}
                    </p>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <span className="tag-pill">{job.type}</span>
                      <span className="tag-pill">{job.location}</span>
                      {job.department && <span className="tag-pill">{job.department}</span>}
                    </div>
                  </div>
                  <Link href={`/jobs/${job.id}`}>
                    <span className="btn-primary" style={{ padding: "12px 32px", fontSize: "14px", flexShrink: 0 }}>
                      See details
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why Work With Us ── */}
      <section className="section-surface" style={{ padding: "80px 0" }}>
        <div className="container">
          <h2 style={{ marginBottom: "56px" }}>Why work with us?</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "40px",
            }}
          >
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>{b.icon}</div>
                <h5 style={{ marginBottom: "10px" }}>{b.title}</h5>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: "1.6" }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: "100px 0",
          background: "var(--color-background)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div>
            <h2 style={{ marginBottom: "24px" }}>Boost Your Sales and Customer Service</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "40px", fontSize: "18px" }}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
            </p>
            <a href="#open-positions" className="btn-primary">
              Start my free trial
            </a>
            <p style={{ marginTop: "16px", fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
              Full access. No credit card required.
            </p>
          </div>
          <div>
            <img
              src="https://cdn.prod.website-files.com/6402b718931f164b8e49168a/6402b718931f1640ba491710_Frame%2010-min.jpg"
              alt="Platform preview"
              style={{ width: "100%", borderRadius: "16px", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
