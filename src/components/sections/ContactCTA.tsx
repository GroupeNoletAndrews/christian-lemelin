import Link from "next/link"

export function ContactCTA() {
  return (
    <section data-header-theme="light" className="bg-[#f3f3f1] py-32 md:py-48">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
        <h2 className="font-display text-[clamp(2.25rem,5.5vw,4.5rem)] text-zinc-900 uppercase tracking-[0.05em] leading-[1.05] mb-6 max-w-[18ch] mx-auto">
          Un projet métal en tête?
        </h2>
        <p className="text-base text-zinc-500 font-sans leading-relaxed mb-12 max-w-[44ch] mx-auto">
          Parlez-nous de votre projet. Notre équipe technique vous répond dans les 24 heures.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center px-8 h-12 text-[14px] font-sans font-medium tracking-[0.04em] text-zinc-950 bg-accent rounded-lg hover:bg-accent-hover hover:shadow-[0_0_32px_rgb(245_160_32/0.35)] active:scale-[0.97] active:shadow-none transition-all duration-200"
        >
          Nous joindre
        </Link>
      </div>
    </section>
  )
}
