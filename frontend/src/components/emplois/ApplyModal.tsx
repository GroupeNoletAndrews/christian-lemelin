"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, Paperclip } from "@phosphor-icons/react";
import { Job } from "@/types/admin";
import { api } from "@/lib/api";
import { uploadCv } from "@/lib/uploads";
import { applySchema, yupErrors } from "@/lib/forms";

interface ApplyModalProps {
  job: Job | null;
  onClose: () => void;
}

export function ApplyModal({ job, onClose }: ApplyModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset state whenever a new job is opened
  useEffect(() => {
    if (job) {
      setSubmitted(false);
      setFileName("");
      setError("");
      setErrors({});
    }
  }, [job]);

  // Esc to close + lock background scroll while open
  useEffect(() => {
    if (!job) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [job, onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!job) return;
    setError("");
    const fd = new FormData(e.currentTarget);
    const values = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: (fd.get("phone") as string) || undefined,
      message: (fd.get("message") as string) || undefined,
    };
    // Validation Yup (le <form> est noValidate — pas de validation navigateur).
    const fieldErrors = await yupErrors(applySchema, values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    setSubmitting(true);
    try {
      // Upload the CV (if any) straight to storage, then send JSON metadata.
      const file = fileRef.current?.files?.[0];
      const cv = file ? await uploadCv(file) : undefined;
      await api.applications.create({ ...values, jobId: job.id, ...cv });
      setSubmitted(true);
    } catch {
      setError("L'envoi a échoué. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const labelClass =
    "block font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-2";
  const fieldClass =
    "w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all font-sans";
  const fieldBorder = (key: string) => (errors[key] ? "border-red-400" : "border-border");
  const fieldError = (key: string) =>
    errors[key] ? <p className="mt-1.5 font-sans text-xs text-red-600">{errors[key]}</p> : null;

  return (
    <AnimatePresence>
      {job && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Postuler — ${job.title}`}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-8 shadow-xl"
          >
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-5 top-5 p-2 rounded-lg text-foreground-muted hover:bg-surface-elevated hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center text-center py-6">
                <CheckCircle size={48} weight="fill" className="text-accent" />
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
                  Candidature envoyée
                </h3>
                <p className="mt-3 font-sans text-foreground-muted max-w-[40ch]">
                  Merci pour votre intérêt envers le poste de{" "}
                  <span className="text-foreground">{job.title}</span>. Notre
                  équipe vous contactera si votre profil correspond.
                </p>
                <button
                  onClick={onClose}
                  className="mt-8 inline-flex items-center rounded-full bg-accent px-7 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99]"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                  Postuler
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                  {job.title}
                </h3>
                <p className="mt-1 font-sans text-sm text-foreground-muted">
                  {job.department} · {job.location}
                </p>

                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="ap-name" className={labelClass}>
                      Nom complet <span className="text-accent">*</span>
                    </label>
                    <input
                      id="ap-name"
                      name="name"
                      type="text"
                      placeholder="Votre nom"
                      aria-invalid={!!errors.name}
                      className={`${fieldClass} ${fieldBorder("name")}`}
                    />
                    {fieldError("name")}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ap-email" className={labelClass}>
                        Courriel <span className="text-accent">*</span>
                      </label>
                      <input
                        id="ap-email"
                        name="email"
                        type="email"
                        placeholder="vous@exemple.com"
                        aria-invalid={!!errors.email}
                        className={`${fieldClass} ${fieldBorder("email")}`}
                      />
                      {fieldError("email")}
                    </div>
                    <div>
                      <label htmlFor="ap-phone" className={labelClass}>
                        Téléphone{" "}
                        <span className="text-foreground-muted normal-case tracking-normal">
                          (optionnel)
                        </span>
                      </label>
                      <input
                        id="ap-phone"
                        name="phone"
                        type="tel"
                        placeholder="418 000-0000"
                        className={`${fieldClass} border-border`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ap-message" className={labelClass}>
                      Message{" "}
                      <span className="text-foreground-muted normal-case tracking-normal">
                        (optionnel)
                      </span>
                    </label>
                    <textarea
                      id="ap-message"
                      name="message"
                      rows={4}
                      placeholder="Parlez-nous de votre expérience..."
                      className={`${fieldClass} border-border resize-none`}
                    />
                  </div>

                  {/* CV upload */}
                  <div>
                    <label className={labelClass}>
                      CV{" "}
                      <span className="text-foreground-muted normal-case tracking-normal">
                        (optionnel)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-3 font-sans text-sm text-foreground-muted hover:border-accent hover:text-foreground transition-colors"
                    >
                      <Paperclip size={16} />
                      {fileName || "Joindre un fichier (PDF, DOC)"}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setFileName(e.target.files?.[0]?.name ?? "")
                      }
                      className="hidden"
                    />
                  </div>

                  {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-accent px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Envoi..." : "Envoyer ma candidature"}
                  </button>
                  <p className="text-center font-sans text-xs leading-relaxed text-foreground-muted">
                    Votre candidature et votre CV restent confidentiels — voir la{" "}
                    <Link
                      href="/confidentialite"
                      className="underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
                    >
                      politique de confidentialité
                    </Link>
                    .
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
