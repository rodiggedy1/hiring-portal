import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const DARK_BG = "#0a0f1e";
const DARK_CARD = "#0f1e3a";
const DARK_BORDER = "rgba(255,255,255,0.08)";
const BRAND_GREEN = "#22c55e";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();

  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.adminLogin.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/hiring");
    },
    onError: (err) => {
      toast.error(err.message || "Invalid credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: DARK_BG }}
    >
      {/* Card */}
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ backgroundColor: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm text-white"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            MIB
          </div>
          <span className="text-white font-bold text-sm tracking-wide">Maids in Black</span>
        </div>

        <h1 className="text-white text-2xl font-bold mb-1">Admin Login</h1>
        <p className="text-gray-400 text-sm mb-8">Sign in to access the hiring pipeline.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: `1px solid ${DARK_BORDER}`,
              }}
              placeholder="admin"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-300 text-xs font-semibold uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: `1px solid ${DARK_BORDER}`,
              }}
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            {loginMutation.isPending ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          <a href="/apply" className="hover:text-gray-400 transition-colors">
            ← Back to application form
          </a>
        </p>
      </div>
    </div>
  );
}
