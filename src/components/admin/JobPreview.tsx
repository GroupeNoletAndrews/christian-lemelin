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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Job Header */}
      <div className="pb-4 border-b border-[#e8e8e6]">
        <h4 className="text-xl font-bold text-[#111113] font-bebas-neue mb-2">
          {job.title || "—"}
        </h4>
        <div className="flex flex-wrap gap-2">
          <span className="inline-block px-2 py-1 bg-[#f5a020]/10 rounded text-xs font-barlow-condensed text-[#111113] font-bold">
            {job.department || "—"}
          </span>
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-barlow-condensed font-bold ${
              job.type === "full-time"
                ? "bg-green-100 text-green-800"
                : job.type === "part-time"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
            }`}
          >
            {getJobTypeLabel(job.type)}
          </span>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-barlow-condensed text-[#111113]/60 mb-1">
            LOCALISATION
          </p>
          <p className="text-sm font-barlow-condensed text-[#111113]">
            {job.location || "—"}
          </p>
        </div>

        {job.salary && (
          <div>
            <p className="text-xs font-barlow-condensed text-[#111113]/60 mb-1">
              SALAIRE
            </p>
            <p className="text-sm font-barlow-condensed text-[#111113]">
              {job.salary}
            </p>
          </div>
        )}

        <div>
          <p className="text-xs font-barlow-condensed text-[#111113]/60 mb-1">
            DESCRIPTION
          </p>
          <p className="text-sm font-barlow-condensed text-[#111113] leading-relaxed whitespace-pre-wrap line-clamp-6">
            {job.description || "—"}
          </p>
        </div>
      </div>

      {/* CTA Button Preview */}
      <div className="pt-4 border-t border-[#e8e8e6]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 bg-[#f5a020] text-white rounded-lg font-barlow-condensed font-bold text-sm hover:bg-[#d4881a] transition-colors"
          disabled
        >
          Voir plus (désactivé en aperçu)
        </motion.button>
      </div>

      {/* Note */}
      <p className="text-xs text-[#111113]/50 font-barlow-condensed text-center pt-2">
        Ceci est un aperçu de la page emploi
      </p>
    </motion.div>
  );
}
