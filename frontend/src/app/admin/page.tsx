"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useAdmin } from "@/lib/admin-context";
import { mediaUrl, SITE_MEDIA, MEDIA_UNOPTIMIZED } from "@/lib/media";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, mustChangePassword } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Already signed in (e.g. returned to /admin from the public site) — skip the
  // login form and go straight to the dashboard. Gated only on isAuthenticated
  // (not the loading flag) so the form always renders for signed-out visitors.
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(
        mustChangePassword ? "/admin/change-password" : "/admin/dashboard",
      );
    }
  }, [isAuthenticated, mustChangePassword, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { ok, mustChangePassword: mustChange } = await login(email, password);
      if (ok) {
        router.push(mustChange ? "/admin/change-password" : "/admin/dashboard");
        return;
      }
      setError("Identifiants invalides");
    } catch {
      // login() only throws on non-credential failures (Supabase unreachable,
      // misconfigured keys, server error) — invalid credentials return false.
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
    setIsLoading(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all font-sans";

  // Already signed in (about to be redirected to the dashboard) — don't flash
  // the form. Signed-out visitors always get the form (no loading-gate hang).
  if (isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16">
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={12} />
        Retour au site
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
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
            Connexion
          </h1>
          <p className="mt-2 text-foreground-muted font-sans">
            Gestion administrative — Entreprises Christian Lemelin
          </p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-surface rounded-2xl border border-border p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-2"
              >
                Courriel
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre adresse courriel"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-2"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
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
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
