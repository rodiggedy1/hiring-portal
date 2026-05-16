import { Link, useSearch } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ThankYou() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const jobTitle = params.get("job") ?? "the position";

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
      <Navbar />

      <section
        style={{
          minHeight: "calc(100vh - 72px - 280px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 0",
        }}
      >
        <div className="container" style={{ maxWidth: "600px", textAlign: "center" }}>
          {/* Success icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(193,255,223,0.12)",
              border: "2px solid var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 40px",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M10 18l6 6 10-12"
                stroke="#c1ffdf"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
            Application submitted!
          </h1>
          <p
            style={{
              fontSize: "20px",
              color: "rgba(255,255,255,0.65)",
              lineHeight: "1.6",
              marginBottom: "48px",
            }}
          >
            Thank you for applying for <strong style={{ color: "#fff" }}>{jobTitle}</strong>. We've received your application and will be in touch soon.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/">
              <span className="btn-primary">View more positions</span>
            </Link>
            <Link href="/my-applications">
              <span className="btn-outline">Track my applications</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
