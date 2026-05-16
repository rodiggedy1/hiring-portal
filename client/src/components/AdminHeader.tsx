/**
 * AdminHeader stub — minimal header for the hiring pipeline admin view.
 */
import { useLocation } from "wouter";
import { Briefcase, LayoutDashboard } from "lucide-react";

interface AdminHeaderProps {
  activeTab?: string;
}

export default function AdminHeader({ activeTab }: AdminHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 flex items-center gap-6 h-14">
        <span className="font-bold text-gray-900 text-base tracking-tight mr-4">Hiring Portal</span>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setLocation("/admin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          <button
            onClick={() => setLocation("/hiring")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "hiring"
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Pipeline
          </button>
        </nav>
      </div>
    </header>
  );
}
