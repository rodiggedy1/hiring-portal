import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(20,26,36,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        {/* Logo */}
        <Link href="/">
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="12" height="12" rx="2" fill="#c1ffdf" />
              <rect x="16" width="12" height="12" rx="2" fill="#c1ffdf" opacity="0.6" />
              <rect y="16" width="12" height="12" rx="2" fill="#c1ffdf" opacity="0.6" />
              <rect x="16" y="16" width="12" height="12" rx="2" fill="#c1ffdf" opacity="0.3" />
            </svg>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#fff",
                letterSpacing: "-0.01em",
              }}
            >
              LeadFlow.
            </span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link href="/" className="nav-link">
            Careers
          </Link>
          {isAuthenticated && user?.role === "admin" && (
            <Link href="/admin" className="nav-link">
              Admin
            </Link>
          )}
          {isAuthenticated && user?.role !== "admin" && (
            <Link href="/my-applications" className="nav-link">
              My Applications
            </Link>
          )}
        </div>

        {/* Auth buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isAuthenticated ? (
            <>
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.6)",
                  maxWidth: "160px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name ?? user?.email}
              </span>
              <button
                onClick={() => logout()}
                className="btn-outline"
                style={{ padding: "10px 24px", fontSize: "14px" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href={getLoginUrl()}
                className="nav-link"
                style={{ fontSize: "16px" }}
              >
                Login
              </a>
              <a href={getLoginUrl()} className="btn-primary" style={{ padding: "10px 28px", fontSize: "14px" }}>
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
