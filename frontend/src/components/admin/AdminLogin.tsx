"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import * as yup from "yup"
import {
  ArrowLeft,
  ArrowRight,
  Envelope,
  Eye,
  EyeSlash,
  LockSimple,
} from "@phosphor-icons/react"
import { useAdmin } from "@/lib/admin-context"
import { mediaUrl, SITE_MEDIA, MEDIA_UNOPTIMIZED } from "@/lib/media"
import { SlotImage } from "@/components/sections/SlotImage"

// Client-side validation with Yup (no native browser validation — the form is
// noValidate). Errors are shown per field.
const schema = yup.object({
  email: yup
    .string()
    .trim()
    .required("Entrez votre courriel.")
    .email("Courriel invalide."),
  password: yup.string().required("Entrez votre mot de passe."),
})

export function AdminLogin({ imageUrl }: { imageUrl: string }) {
  const router = useRouter()
  const { login, isAuthenticated, mustChangePassword, previewEdit } = useAdmin()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)

  // Already signed in → dashboard. Skipped inside the content-workspace preview
  // iframe (previewEdit) so the admin can edit the login image there.
  useEffect(() => {
    if (isAuthenticated && !previewEdit) {
      router.replace(mustChangePassword ? "/admin/change-password" : "/admin/dashboard")
    }
  }, [isAuthenticated, mustChangePassword, previewEdit, router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Inside the content-workspace preview iframe the form is display-only (it's
    // there to edit the login image) — never actually sign in from the viewer.
    if (previewEdit) return
    setErrors({})
    try {
      await schema.validate({ email, password }, { abortEarly: false })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fe: { email?: string; password?: string } = {}
        for (const i of err.inner) {
          if (i.path === "email" && !fe.email) fe.email = i.message
          if (i.path === "password" && !fe.password) fe.password = i.message
        }
        setErrors(fe)
      }
      return
    }
    setLoading(true)
    try {
      const { ok, mustChangePassword: mustChange } = await login(email.trim(), password)
      if (ok) {
        router.push(mustChange ? "/admin/change-password" : "/admin/dashboard")
        return
      }
      setErrors({ form: "Identifiants invalides." })
    } catch {
      setErrors({ form: "Une erreur est survenue. Veuillez réessayer." })
    }
    setLoading(false)
  }

  // Signed in (about to redirect) — don't flash the form. Not in preview.
  if (isAuthenticated && !previewEdit) return <div className="min-h-screen bg-background" />

  const field =
    "w-full rounded-lg border bg-background py-3 pl-11 pr-4 font-sans text-foreground placeholder-foreground-muted transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/15"

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — editable image (admin-login/hero). Hidden on small screens. */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <SlotImage
          section="admin-login"
          slot="hero"
          src={imageUrl}
          alt=""
          sizes="50vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/30" />
        <Image
          src={mediaUrl(SITE_MEDIA.logoBlanc)}
          alt="Entreprises Christian Lemelin"
          width={1500}
          height={240}
          priority
          unoptimized={MEDIA_UNOPTIMIZED}
          className="absolute left-8 top-8 h-10 w-auto"
        />
      </div>

      {/* Right — form */}
      <div className="relative flex items-center justify-center bg-background px-6 py-16">
        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={12} />
          Retour au site
        </Link>
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Connexion
          </h1>
          <p className="mt-2 font-sans text-sm text-foreground-muted">
            Gestion du contenu — Entreprises Christian Lemelin
          </p>
          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-foreground-muted"
              >
                Courriel
              </label>
              <div className="relative">
                <Envelope
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  aria-invalid={!!errors.email}
                  disabled={previewEdit}
                  className={`${field} ${errors.email ? "border-red-400" : "border-border"} disabled:opacity-60`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 font-sans text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-foreground-muted"
              >
                Mot de passe
              </label>
              <div className="relative">
                <LockSimple
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted"
                />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  disabled={previewEdit}
                  className={`${field} pr-11 ${errors.password ? "border-red-400" : "border-border"} disabled:opacity-60`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted transition-colors hover:text-foreground"
                >
                  {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 font-sans text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {errors.form && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="font-sans text-sm text-red-600">{errors.form}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || previewEdit}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 font-sans font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Connexion…" : "Se connecter"}
              {!loading && !previewEdit && (
                <ArrowRight
                  size={18}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              )}
            </button>
            {previewEdit && (
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
                Aperçu — connexion désactivée
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
