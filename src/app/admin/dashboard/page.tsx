"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Trash, PencilSimple, Plus, SignOut } from "@phosphor-icons/react";
import { useAdmin } from "@/lib/admin-context";
import { Tag } from "@/components/ui/Tag";

const typeLabel = (type: string) =>
  type === "full-time"
    ? "Temps plein"
    : type === "part-time"
      ? "Temps partiel"
      : "Contrat";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, username, jobs, logout, deleteJob } = useAdmin();

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

  const stats = [
    { label: "Total d'emplois", value: jobs.length },
    { label: "Temps plein", value: jobs.filter((j) => j.type === "full-time").length },
    { label: "Contrats", value: jobs.filter((j) => j.type === "contract").length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-1">
              Espace admin
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Tableau de bord
            </h1>
            <p className="text-foreground-muted font-sans text-sm mt-1">
              Bienvenue, <span className="text-foreground">{username}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-full hover:bg-surface-elevated hover:border-foreground/30 transition-colors font-sans text-sm"
          >
            <SignOut size={18} />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-surface rounded-2xl p-6 border border-border">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-3">
                {s.label}
              </p>
              <p className="font-display text-4xl font-semibold text-foreground tracking-tight">
                {s.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Action bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">
            Emplois
          </h2>
          <Link
            href="/admin/dashboard/jobs/create/edit"
            className="flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors font-sans text-sm font-medium active:scale-[0.99]"
          >
            <Plus size={18} weight="bold" />
            Ajouter un emploi
          </Link>
        </motion.div>

        {/* Jobs table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-surface rounded-2xl border border-border overflow-hidden"
        >
          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-foreground-muted font-sans mb-5">Aucun emploi trouvé</p>
              <Link
                href="/admin/dashboard/jobs/create/edit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors font-sans text-sm font-medium"
              >
                <Plus size={16} weight="bold" />
                Créer le premier emploi
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-border">
                  <tr>
                    {["Titre", "Département", "Type", "Localisation"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="text-center px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
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
                      className="border-b border-border last:border-0 hover:bg-background transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-sans font-medium text-foreground">{job.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Tag>{job.department}</Tag>
                      </td>
                      <td className="px-6 py-4">
                        <Tag>{typeLabel(job.type)}</Tag>
                      </td>
                      <td className="px-6 py-4 font-sans text-foreground-muted">
                        {job.location}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/admin/dashboard/jobs/${job.id}/edit`}
                            aria-label="Modifier"
                            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-foreground"
                          >
                            <PencilSimple size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            aria-label="Supprimer"
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
