"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Eye } from "@phosphor-icons/react";
import { useAdmin } from "@/lib/admin-context";
import { Job } from "@/types/admin";
import { JobPreview } from "@/components/admin/JobPreview";

type FormData = Omit<Job, "id" | "createdAt" | "updatedAt">;

export default function JobFormPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string | undefined;
  const isEditMode = jobId && jobId !== "create";

  const { isAuthenticated, getJob, addJob, updateJob } = useAdmin();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    location: "",
    type: "full-time",
    department: "",
    salary: "",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Load job data if editing
  useEffect(() => {
    if (isEditMode && jobId) {
      const job = getJob(jobId);
      if (job) {
        setFormData({
          title: job.title,
          description: job.description,
          location: job.location,
          type: job.type,
          department: job.department,
          salary: job.salary || "",
        });
      }
      setIsLoading(false);
    }
  }, [isEditMode, jobId, getJob]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.department
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (isEditMode && jobId) {
      updateJob(jobId, {
        ...formData,
        updatedAt: new Date(),
      });
    } else {
      addJob(formData);
    }

    router.push("/admin/dashboard");
  };

  const labelClass =
    "block font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-2";
  const fieldClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all font-sans";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              aria-label="Retour"
              className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-foreground"
            >
              <ArrowLeft size={22} />
            </Link>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-1">
                {isEditMode ? "Modifier" : "Nouveau"}
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {isEditMode ? "Modifier l'emploi" : "Créer un emploi"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-surface rounded-2xl p-8 border border-border"
            >
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className={labelClass}>
                    Titre du poste <span className="text-accent">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Ingénieur Fabrication"
                    className={fieldClass}
                    required
                  />
                </div>

                {/* Department and Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="department" className={labelClass}>
                      Département <span className="text-accent">*</span>
                    </label>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Ex: Production"
                      className={fieldClass}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className={labelClass}>
                      Type d&apos;emploi <span className="text-accent">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={fieldClass}
                    >
                      <option value="full-time">Temps plein</option>
                      <option value="part-time">Temps partiel</option>
                      <option value="contract">Contrat</option>
                    </select>
                  </div>
                </div>

                {/* Location and Salary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className={labelClass}>
                      Localisation <span className="text-accent">*</span>
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Ex: Québec, QC"
                      className={fieldClass}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="salary" className={labelClass}>
                      Salaire <span className="text-foreground-muted normal-case tracking-normal">(optionnel)</span>
                    </label>
                    <input
                      id="salary"
                      name="salary"
                      type="text"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="Ex: 65,000 - 85,000 $/an"
                      className={fieldClass}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className={labelClass}>
                    Description <span className="text-accent">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez le poste, les responsabilités, les qualifications requises..."
                    rows={6}
                    className={`${fieldClass} resize-none`}
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground rounded-full hover:bg-surface-elevated hover:border-foreground/30 transition-colors font-sans text-sm font-medium lg:hidden"
                  >
                    <Eye size={18} />
                    {showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors font-sans text-sm font-medium active:scale-[0.99]"
                  >
                    {isEditMode ? "Mettre à jour" : "Créer"} l&apos;emploi
                  </button>
                </div>
              </div>
            </form>

            {/* Mobile preview (toggled) */}
            {showPreview && (
              <div className="mt-6 lg:hidden bg-surface rounded-2xl p-6 border border-border">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-4">
                  Aperçu en direct
                </p>
                <JobPreview job={formData} />
              </div>
            )}
          </motion.div>

          {/* Desktop preview (sticky) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:block lg:col-span-1"
          >
            <div className="sticky top-24">
              <div className="bg-surface rounded-2xl p-6 border border-border">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-4">
                  Aperçu en direct
                </p>
                <JobPreview job={formData} />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
