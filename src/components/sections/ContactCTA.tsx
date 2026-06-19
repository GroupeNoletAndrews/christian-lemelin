import Link from "next/link"

// Closing CTA used across the site (home + detail pages). Props are optional and
// default to the home wording, so existing usages keep working unchanged.
export function ContactCTA({
  heading = "Un projet métal en tête ?",
  body = "Parlez-nous de votre projet. Notre équipe technique vous répond dans les 24 heures.",
  label = "Nous joindre",
  href = "/contact",
}: {
  heading?: string
  body?: string
  label?: string
  href?: string
} = {}) {
  return (
    <section data-header-theme="dark" className="bg-ink py-32 text-white md:py-44">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center px-6 text-center md:px-12">
        <h2 className="max-w-[18ch] font-display text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[1] tracking-[-0.02em] text-white">
          {heading}
        </h2>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-white/55">{body}</p>
        <Link
          href={href}
          className="mt-12 inline-flex h-12 items-center rounded-full bg-accent px-8 text-[14px] font-medium tracking-[0.02em] text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.97]"
        >
          {label}
        </Link>
      </div>
    </section>
  )
}
