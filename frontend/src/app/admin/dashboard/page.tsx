"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ImageSquare, SignOut } from "@phosphor-icons/react";
import { useAdmin } from "@/lib/admin-context";

// The dashboard is now metrics-only: all content management (Emplois,
// Réalisations, page images) lives in the content workspace (/admin/dashboard/content).
export default function AdminDashboard() {
  const router = useRouter();
  const {
    isAuthenticated,
    authLoading,
    email,
    jobs,
    logout,
    realisations,
    pinnedCount,
    maxPinned,
  } = useAdmin();

  useEffect(() => {
    // Wait for the initial session check — otherwise a refresh bounces to login
    // before getUser() restores the persisted Supabase session.
    if (!authLoading && !isAuthenticated) {
      router.push("/admin");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  const stats = [
    { label: "Emplois publiés", value: jobs.length },
    { label: "Réalisations", value: realisations.length },
    { label: "Épinglées à l'accueil", value: `${pinnedCount}/${maxPinned}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted transition-colors hover:text-foreground"
              >
                <ArrowLeft size={12} />
                Retour au site
              </Link>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Tableau de bord
              </h1>
              <p className="mt-1 font-sans text-sm text-foreground-muted">
                Bienvenue, <span className="text-foreground">{email}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard/content"
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99]"
              >
                <ImageSquare size={18} />
                Contenu du site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-sans text-sm text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-elevated"
              >
                <SignOut size={18} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-surface p-6">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                {s.label}
              </p>
              <p className="font-display text-4xl font-semibold tracking-tight text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Manage-content CTA — everything editable lives in the workspace now. */}
        <Link
          href="/admin/dashboard/content"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-foreground/30 hover:bg-surface-elevated"
        >
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Contenu du site
            </h2>
            <p className="mt-1 max-w-[60ch] font-sans text-sm text-foreground-muted">
              Gérez les images des pages (recadrage, styles), les réalisations et
              les emplois — le tout avec un aperçu en direct.
            </p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-white transition-transform group-hover:translate-x-0.5">
            <ArrowRight size={18} weight="bold" />
          </span>
        </Link>
      </main>
    </div>
  );
}
