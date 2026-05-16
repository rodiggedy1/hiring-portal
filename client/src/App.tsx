import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Apply from "./pages/Apply";
import HiringPipeline from "./pages/HiringPipeline";
import HiringStatus from "./pages/HiringStatus";
import AIInterview from "./pages/AIInterview";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      {/* Root → redirect to /apply */}
      <Route path="/" component={Home} />

      {/* Public application form */}
      <Route path="/apply" component={Apply} />

      {/* Candidate status page (magic link) */}
      <Route path="/hiring-status/:token" component={HiringStatus} />

      {/* AI video interview */}
      <Route path="/ai-interview/:token" component={AIInterview} />

      {/* Admin hiring pipeline */}
      <Route path="/hiring" component={HiringPipeline} />

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
