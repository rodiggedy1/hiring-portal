import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import JobDetail from "./pages/JobDetail";
import Apply from "./pages/Apply";
import ThankYou from "./pages/ThankYou";
import MyApplications from "./pages/MyApplications";
import Admin from "./pages/Admin";
import ApplicationReview from "./pages/ApplicationReview";
import JobForm from "./pages/JobForm";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/apply/:id" component={Apply} />
      <Route path="/thank-you" component={ThankYou} />

      {/* Candidate */}
      <Route path="/my-applications" component={MyApplications} />

      {/* Admin */}
      <Route path="/admin" component={Admin} />
      <Route path="/admin/jobs/new" component={JobForm} />
      <Route path="/admin/jobs/:id/edit" component={JobForm} />
      <Route path="/admin/applications/:id" component={ApplicationReview} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
