"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, Paperclip } from "@phosphor-icons/react";
import { Job } from "@/types/admin";
import { api } from "@/lib/api";
import { uploadCv } from "@/lib/uploads";
import { applySchema, yupErrors } from "@/lib/forms";
import { useLocale } from "@/components/providers/LocaleProvider";
import { t } from "@/lib/i18n";

interface ApplyModalProps {
  job: Job | null;
  onClose: () => void;
}

export function ApplyModal({ job, onClose }: ApplyModalProps) {
  const locale = useLocale();
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
      setError(t("L'envoi a échoué. Veuillez réessayer.", "Submission failed. Please try again.", locale));
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
            aria-label={`${t("Postuler", "Apply", locale)} — ${job.title}`}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-8 shadow-xl"
          >
            <button
              onClick={onClose}
              aria-label={t("Fermer", "Close", locale)}
              className="absolute right-5 top-5 p-2 rounded-lg text-foreground-muted hover:bg-surface-elevated hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center text-center py-6">
                <CheckCircle size={48} weight="fill" className="text-accent" />
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
                  {t("Candidature envoyée", "Application sent", locale)}
                </h3>
                <p className="mt-3 font-sans text-foreground-muted max-w-[40ch]">
                  {t(
                    "Merci pour votre intérêt envers le poste de",
                    "Thank you for your interest in the",
                    locale,
                  )}{" "}
                  <span className="text-foreground">{job.title}</span>
                  {t(
                    ". Notre équipe vous contactera si votre profil correspond.",
                    " position. Our team will contact you if your profile is a match.",
                    locale,
                  )}
                </p>
                <button
                  onClick={onClose}
                  className="mt-8 inline-flex items-center rounded-full bg-accent px-7 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99]"
                >
                  {t("Fermer", "Close", locale)}
                </button>
              </div>
            ) : (
              <>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                  {t("Postuler", "Apply", locale)}
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
                      {t("Nom complet", "Full name", locale)} <span className="text-accent">*</span>
                    </label>
                    <input
                      id="ap-name"
                      name="name"
                      type="text"
                      placeholder={t("Votre nom", "Your name", locale)}
                      aria-invalid={!!errors.name}
                      className={`${fieldClass} ${fieldBorder("name")}`}
                    />
                    {fieldError("name")}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ap-email" className={labelClass}>
                        {t("Courriel", "Email", locale)} <span className="text-accent">*</span>
                      </label>
                      <input
                        id="ap-email"
                        name="email"
                        type="email"
                        placeholder={t("vous@exemple.com", "you@example.com", locale)}
                        aria-invalid={!!errors.email}
                        className={`${fieldClass} ${fieldBorder("email")}`}
                      />
                      {fieldError("email")}
                    </div>
                    <div>
                      <label htmlFor="ap-phone" className={labelClass}>
                        {t("Téléphone", "Phone", locale)}{" "}
                        <span className="text-foreground-muted normal-case tracking-normal">
                          {t("(optionnel)", "(optional)", locale)}
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
                      {t("Message", "Message", locale)}{" "}
                      <span className="text-foreground-muted normal-case tracking-normal">
                        {t("(optionnel)", "(optional)", locale)}
                      </span>
                    </label>
                    <textarea
                      id="ap-message"
                      name="message"
                      rows={4}
                      placeholder={t(
                        "Parlez-nous de votre expérience...",
                        "Tell us about your experience...",
                        locale,
                      )}
                      className={`${fieldClass} border-border resize-none`}
                    />
                  </div>

                  {/* CV upload */}
                  <div>
                    <label className={labelClass}>
                      {t("CV", "Resume", locale)}{" "}
                      <span className="text-foreground-muted normal-case tracking-normal">
                        {t("(optionnel)", "(optional)", locale)}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-3 font-sans text-sm text-foreground-muted hover:border-accent hover:text-foreground transition-colors"
                    >
                      <Paperclip size={16} />
                      {fileName || t("Joindre un fichier (PDF, DOC)", "Attach a file (PDF, DOC)", locale)}
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
                    {submitting
                      ? t("Envoi...", "Sending...", locale)
                      : t("Envoyer ma candidature", "Send my application", locale)}
                  </button>
                  <p className="text-center font-sans text-xs leading-relaxed text-foreground-muted">
                    {t(
                      "Votre candidature et votre CV restent confidentiels — voir la",
                      "Your application and résumé remain confidential — see our",
                      locale,
                    )}{" "}
                    <Link
                      href="/confidentialite"
                      className="underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
                    >
                      {t("politique de confidentialité", "privacy policy", locale)}
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
