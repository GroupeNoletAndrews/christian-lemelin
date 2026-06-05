import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-[-0.02em] text-foreground">
        Solution introuvable
      </h1>
      <p className="mt-4 max-w-[40ch] text-foreground-muted">
        Cette solution n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/solutions"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-7 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Voir toutes les solutions
      </Link>
    </div>
  )
}
