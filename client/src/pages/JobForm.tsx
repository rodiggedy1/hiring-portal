import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, useLocation, Link } from "wouter";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type JobType = "Full time" | "Part time" | "Contract" | "Internship";
type JobStatus = "draft" | "published" | "closed";

interface FormState {
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string;
  summary: string;
  status: JobStatus;
}

const DEFAULT: FormState = {
  title: "",
  department: "",
  location: "",
  type: "Full time",
  description: "",
  requirements: "",
  summary: "",
  status: "draft",
};

export default function JobForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id && id !== "new";
  const jobId = isEdit ? parseInt(id!, 10) : undefined;
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [error, setError] = useState("");

  const { data: existing } = trpc.jobs.getById.useQuery(
    { id: jobId! },
    { enabled: !!jobId }
  );

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        department: existing.department,
        location: existing.location,
        type: existing.type as JobType,
        description: existing.description,
        requirements: existing.requirements,
        summary: existing.summary ?? "",
        status: existing.status as JobStatus,
      });
    }
  }, [existing]);

  const createJob = trpc.jobs.create.useMutation({
    onSuccess: () => navigate("/admin"),
  });
  const updateJob = trpc.jobs.update.useMutation({
    onSuccess: () => navigate("/admin"),
  });

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async () => {
    setError("");
    if (!form.title || !form.department || !form.location || !form.description || !form.requirements) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      if (isEdit && jobId) {
        await updateJob.mutateAsync({ id: jobId, ...form });
      } else {
        await createJob.mutateAsync(form);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 0", textAlign: "center" }}><h2>Access denied</h2></div>
      </div>
    );
  }

  const isPending = createJob.isPending || updateJob.isPending;

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ paddingTop: "56px", paddingBottom: "80px" }}>
        <div className="container" style={{ maxWidth: "720px" }}>
          <Link href="/admin">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "15px", color: "rgba(255,255,255,0.5)", marginBottom: "32px", cursor: "pointer" }}>
              ← Back to admin
            </span>
          </Link>

          <h1 style={{ fontSize: "40px", marginBottom: "40px" }}>
            {isEdit ? "Edit job" : "Post a new job"}
          </h1>

          <div style={{ background: "var(--color-surface)", borderRadius: "16px", padding: "48px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>Job title *</label>
                  <input className="lf-input" placeholder="e.g. Product Designer" value={form.title} onChange={set("title")} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>Department *</label>
                  <input className="lf-input" placeholder="e.g. Design" value={form.department} onChange={set("department")} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>Location *</label>
                  <input className="lf-input" placeholder="e.g. London, UK" value={form.location} onChange={set("location")} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>Job type *</label>
                  <select className="lf-input" value={form.type} onChange={set("type")}>
                    <option>Full time</option>
                    <option>Part time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>Short summary</label>
                <input className="lf-input" placeholder="One-line summary shown on the job card" value={form.summary} onChange={set("summary")} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>Job description *</label>
                <textarea className="lf-textarea" style={{ minHeight: "200px" }} placeholder="Describe the role, responsibilities, and what success looks like..." value={form.description} onChange={set("description")} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>Requirements *</label>
                <textarea className="lf-textarea" style={{ minHeight: "160px" }} placeholder="List the skills, experience, and qualifications required..." value={form.requirements} onChange={set("requirements")} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontWeight: 500 }}>Status</label>
                <select className="lf-input" value={form.status} onChange={set("status")} style={{ maxWidth: "200px" }}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {error && (
              <div style={{ marginTop: "20px", padding: "12px 16px", background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: "8px", fontSize: "14px", color: "#ff8080" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "16px", marginTop: "36px" }}>
              <button onClick={submit} className="btn-primary" style={{ padding: "14px 40px" }} disabled={isPending}>
                {isPending ? "Saving..." : isEdit ? "Save changes" : "Post job"}
              </button>
              <Link href="/admin">
                <span className="btn-outline" style={{ padding: "14px 32px" }}>Cancel</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
