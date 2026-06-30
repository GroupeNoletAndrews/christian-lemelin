"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useAdmin } from "@/lib/admin-context";
import { useToast } from "@/components/admin/FeedbackProvider";
import { mediaUrl, SITE_MEDIA, MEDIA_UNOPTIMIZED } from "@/lib/media";

const MIN_LENGTH = 8;

/**
 * Set a new password. Reached automatically (forced by the admin layout) when a
 * user signs in with a temporary password flagged `must_change_password`; also
 * usable voluntarily by any signed-in admin. On success the must-change flag is
 * cleared and the user lands on the dashboard.
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated, authLoading, mustChangePassword, changePassword, logout } =
    useAdmin();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // The admin layout redirects signed-out visitors to /admin — render nothing
  // (no form flash) while that resolves.
  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`);
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setIsLoading(true);
    try {
      await changePassword(password);
      toast("Mot de passe mis à jour.");
      router.push("/admin/dashboard");
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? "";
      if (/different from the old password|same.?password/i.test(msg)) {
        setError("Le nouveau mot de passe doit être différent du mot de passe temporaire.");
      } else if (/at least|weak|short|6 characters/i.test(msg)) {
        setError(`Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`);
      } else {
        setError("La mise à jour a échoué. Veuillez réessayer.");
      }
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all font-sans";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <Image
            src={mediaUrl(SITE_MEDIA.logo)}
            alt="Entreprises Christian Lemelin"
            width={384}
            height={64}
            priority
            unoptimized={MEDIA_UNOPTIMIZED}
            className="h-9 w-auto mb-8"
          />
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-foreground-muted font-sans">
            {mustChangePassword
              ? "Pour votre première connexion, veuillez définir votre propre mot de passe."
              : "Choisissez un nouveau mot de passe pour votre compte."}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-surface rounded-2xl border border-border p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-2"
              >
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`Au moins ${MIN_LENGTH} caractères`}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="block font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-2"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Retapez le mot de passe"
                className={inputClass}
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600 font-sans">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans font-medium py-3 px-4 rounded-full transition-all duration-200 active:scale-[0.99]"
            >
              {isLoading ? "Enregistrement..." : "Enregistrer le mot de passe"}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mustChangePassword ? (
              <button
                type="button"
                onClick={handleLogout}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted hover:text-foreground transition-colors"
              >
                Se déconnecter
              </button>
            ) : (
              <Link
                href="/admin/dashboard"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted hover:text-foreground transition-colors"
              >
                Retour au tableau de bord
              </Link>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
