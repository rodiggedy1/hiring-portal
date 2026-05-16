import { Link } from "wouter";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-background)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingTop: "64px",
        paddingBottom: "40px",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "48px",
            marginBottom: "48px",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect width="12" height="12" rx="2" fill="#c1ffdf" />
                <rect x="16" width="12" height="12" rx="2" fill="#c1ffdf" opacity="0.6" />
                <rect y="16" width="12" height="12" rx="2" fill="#c1ffdf" opacity="0.6" />
                <rect x="16" y="16" width="12" height="12" rx="2" fill="#c1ffdf" opacity="0.3" />
              </svg>
              <span style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>LeadFlow.</span>
            </div>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)", lineHeight: "1.6", margin: 0 }}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>

          {/* Pages */}
          <div>
            <h6 style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
              Pages
            </h6>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Home", "Features", "About", "Pricing", "Contact"].map((page) => (
                <Link
                  key={page}
                  href="/"
                  style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", transition: "color 150ms" }}
                >
                  {page}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h6 style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
              Follow Us
            </h6>
            <div style={{ display: "flex", gap: "16px" }}>
              {[
                { label: "Twitter", icon: "𝕏" },
                { label: "LinkedIn", icon: "in" },
                { label: "Instagram", icon: "◻" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.7)",
                    transition: "border-color 150ms",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            © All rights reserved.
          </p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Hiring Platform Susan
          </p>
        </div>
      </div>
    </footer>
  );
}
