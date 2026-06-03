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

  return (
    <div className="min-h-screen bg-[#f3f3f1]">
      {/* Header */}
      <header className="bg-white border-b border-[#e8e8e6] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-2 hover:bg-[#f3f3f1] rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-[#111113]" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#111113] font-bebas-neue">
                {isEditMode ? "Modifier" : "Créer"} un emploi
              </h1>
              <p className="text-[#111113]/60 font-barlow-condensed text-sm">
                {isEditMode
                  ? "Modifiez les détails de l'emploi"
                  : "Ajoutez un nouvel emploi à la liste"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl p-8 border border-[#e8e8e6]"
            >
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-barlow-condensed font-bold text-[#111113] mb-2"
                  >
                    Titre du poste <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Ingénieur Fabrication"
                    className="w-full px-4 py-3 rounded-lg border border-[#e8e8e6] bg-[#f3f3f1] text-[#111113] placeholder-[#111113]/40 focus:outline-none focus:ring-2 focus:ring-[#f5a020] focus:border-transparent transition-all font-barlow-condensed"
                    required
                  />
                </div>

                {/* Department and Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="department"
                      className="block text-sm font-barlow-condensed font-bold text-[#111113] mb-2"
                    >
                      Département <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Ex: Production"
                      className="w-full px-4 py-3 rounded-lg border border-[#e8e8e6] bg-[#f3f3f1] text-[#111113] placeholder-[#111113]/40 focus:outline-none focus:ring-2 focus:ring-[#f5a020] focus:border-transparent transition-all font-barlow-condensed"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-barlow-condensed font-bold text-[#111113] mb-2"
                    >
                      Type d'emploi <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-[#e8e8e6] bg-[#f3f3f1] text-[#111113] focus:outline-none focus:ring-2 focus:ring-[#f5a020] focus:border-transparent transition-all font-barlow-condensed"
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
                    <label
                      htmlFor="location"
                      className="block text-sm font-barlow-condensed font-bold text-[#111113] mb-2"
                    >
                      Localisation <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Ex: Québec, QC"
                      className="w-full px-4 py-3 rounded-lg border border-[#e8e8e6] bg-[#f3f3f1] text-[#111113] placeholder-[#111113]/40 focus:outline-none focus:ring-2 focus:ring-[#f5a020] focus:border-transparent transition-all font-barlow-condensed"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="salary"
                      className="block text-sm font-barlow-condensed font-bold text-[#111113] mb-2"
                    >
                      Salaire{" "}
                      <span className="text-[#111113]/40">(optionnel)</span>
                    </label>
                    <input
                      id="salary"
                      name="salary"
                      type="text"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="Ex: 65,000 - 85,000 $/an"
                      className="w-full px-4 py-3 rounded-lg border border-[#e8e8e6] bg-[#f3f3f1] text-[#111113] placeholder-[#111113]/40 focus:outline-none focus:ring-2 focus:ring-[#f5a020] focus:border-transparent transition-all font-barlow-condensed"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-barlow-condensed font-bold text-[#111113] mb-2"
                  >
                    Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez le poste, les responsabilités, les qualifications requises..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-[#e8e8e6] bg-[#f3f3f1] text-[#111113] placeholder-[#111113]/40 focus:outline-none focus:ring-2 focus:ring-[#f5a020] focus:border-transparent transition-all font-barlow-condensed resize-none"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#111113] text-white rounded-lg hover:bg-[#111113]/90 transition-colors font-barlow-condensed font-bold"
                  >
                    <Eye size={20} />
                    Aperçu
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#f5a020] text-white rounded-lg hover:bg-[#d4881a] transition-colors font-barlow-condensed font-bold"
                  >
                    {isEditMode ? "Mettre à jour" : "Créer"} l'emploi
                  </button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <div className="bg-white rounded-xl p-6 border border-[#e8e8e6]">
                <h3 className="text-lg font-bold text-[#111113] font-bebas-neue mb-4">
                  Aperçu en direct
                </h3>
                <JobPreview job={formData as any} />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
