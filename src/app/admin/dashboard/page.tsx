"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Trash, File, Plus, Password } from "@phosphor-icons/react";
import { useAdmin } from "@/lib/admin-context";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, username, jobs, logout, deleteJob } = useAdmin();
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  const handleDeleteJob = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce poste?")) {
      deleteJob(id);
    }
  };

  const toggleJobSelection = (id: string) => {
    setSelectedJobs((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-[#f3f3f1]">
      {/* Header */}
      <header className="bg-white border-b border-[#e8e8e6] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#111113] font-bebas-neue">
              Tableau de bord
            </h1>
            <p className="text-[#111113]/60 font-barlow-condensed text-sm">
              Bienvenue,{" "}
              <span className="font-bold text-[#111113]">{username}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-[#111113] text-white rounded-lg hover:bg-[#111113]/90 transition-colors font-barlow-condensed"
          >
            <Password size={18} />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-xl p-6 border border-[#e8e8e6]">
            <p className="text-[#111113]/60 font-barlow-condensed text-sm mb-2">
              Total d'emplois
            </p>
            <p className="text-4xl font-bold text-[#111113] font-bebas-neue">
              {jobs.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#e8e8e6]">
            <p className="text-[#111113]/60 font-barlow-condensed text-sm mb-2">
              Temps plein
            </p>
            <p className="text-4xl font-bold text-[#111113] font-bebas-neue">
              {jobs.filter((j) => j.type === "full-time").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#e8e8e6]">
            <p className="text-[#111113]/60 font-barlow-condensed text-sm mb-2">
              Contrats
            </p>
            <p className="text-4xl font-bold text-[#111113] font-bebas-neue">
              {jobs.filter((j) => j.type === "contract").length}
            </p>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-between mb-8"
        >
          <h2 className="text-2xl font-bold text-[#111113] font-bebas-neue">
            Emplois
          </h2>
          <Link
            href="/admin/dashboard/jobs/create"
            className="flex items-center gap-2 px-6 py-3 bg-[#f5a020] text-white rounded-lg hover:bg-[#d4881a] transition-colors font-barlow-condensed font-bold"
          >
            <Plus size={20} />
            Ajouter un emploi
          </Link>
        </motion.div>

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl border border-[#e8e8e6] overflow-hidden"
        >
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#111113]/60 font-barlow-condensed mb-4">
                Aucun emploi trouvé
              </p>
              <Link
                href="/admin/dashboard/jobs/create"
                className="inline-block px-6 py-2 bg-[#f5a020] text-white rounded-lg hover:bg-[#d4881a] transition-colors font-barlow-condensed"
              >
                Créer le premier emploi
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f3f3f1] border-b border-[#e8e8e6]">
                  <tr>
                    <th className="text-left px-6 py-4 font-barlow-condensed font-bold text-[#111113]">
                      Titre
                    </th>
                    <th className="text-left px-6 py-4 font-barlow-condensed font-bold text-[#111113]">
                      Département
                    </th>
                    <th className="text-left px-6 py-4 font-barlow-condensed font-bold text-[#111113]">
                      Type
                    </th>
                    <th className="text-left px-6 py-4 font-barlow-condensed font-bold text-[#111113]">
                      Localisation
                    </th>
                    <th className="text-center px-6 py-4 font-barlow-condensed font-bold text-[#111113]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[#e8e8e6] hover:bg-[#f3f3f1] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-barlow-condensed font-bold text-[#111113]">
                          {job.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-[#f3f3f1] rounded-full text-sm font-barlow-condensed text-[#111113]">
                          {job.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-barlow-condensed ${
                            job.type === "full-time"
                              ? "bg-green-100 text-green-800"
                              : job.type === "part-time"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {job.type === "full-time"
                            ? "Temps plein"
                            : job.type === "part-time"
                              ? "Temps partiel"
                              : "Contrat"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-barlow-condensed text-[#111113]/80">
                        {job.location}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/dashboard/jobs/${job.id}/edit`}
                            className="p-2 hover:bg-[#f3f3f1] rounded-lg transition-colors text-[#111113]"
                          >
                            <File size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
