"use client";

import { motion } from "motion/react";
import { Job } from "@/types/admin";

interface JobPreviewProps {
  job: Omit<Job, "id" | "createdAt" | "updatedAt">;
}

export function JobPreview({ job }: JobPreviewProps) {
  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case "full-time":
        return "Temps plein";
      case "part-time":
        return "Temps partiel";
      case "contract":
        return "Contrat";
      default:
        return type;
    }
  };

  const fieldLabel =
    "font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-muted mb-1";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h4 className="font-display text-xl font-semibold text-foreground tracking-tight mb-3">
          {job.title || "—"}
        </h4>
        <div className="flex flex-wrap gap-2">
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div>
          <p className={fieldLabel}>Localisation</p>
          <p className="text-sm font-sans text-foreground">{job.location || "—"}</p>
        </div>

        {job.salary && (
          <div>
            <p className={fieldLabel}>Salaire</p>
            <p className="text-sm font-sans text-foreground">{job.salary}</p>
          </div>
        )}

        <div>
          <p className={fieldLabel}>Description</p>
          <p className="text-sm font-sans text-foreground-muted leading-relaxed whitespace-pre-wrap line-clamp-6">
            {job.description || "—"}
          </p>
        </div>
      </div>

      {/* CTA preview */}
      <div className="pt-4 border-t border-border">
        <button
          className="w-full py-2.5 bg-accent text-white rounded-full font-sans font-medium text-sm opacity-60 cursor-not-allowed"
          disabled
        >
          Postuler (désactivé en aperçu)
        </button>
      </div>

      <p className="text-xs text-foreground-muted font-sans text-center pt-1">
        Ceci est un aperçu de la page emploi
      </p>
    </motion.div>
  );
}
