import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Apply from "./pages/Apply";
import HiringPipeline from "./pages/HiringPipeline";
import HiringStatus from "./pages/HiringStatus";
import AIInterview from "./pages/AIInterview";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { useAuth } from "./_core/hooks/useAuth";

/** Protects a route — redirects to /login if not authenticated or not admin */
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  // Use useEffect to avoid calling navigate during render
  React.useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Root → redirect to /apply */}
      <Route path="/" component={Home} />

      {/* Public application form */}
      <Route path="/apply" component={Apply} />

      {/* Admin login */}
      <Route path="/login" component={Login} />

      {/* Candidate status page (magic link) */}
      <Route path="/hiring-status/:token" component={HiringStatus} />

      {/* AI video interview */}
      <Route path="/ai-interview/:token" component={AIInterview} />

      {/* Admin hiring pipeline — protected */}
      <Route path="/hiring">
        {() => <AdminRoute component={HiringPipeline} />}
      </Route>

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
