import Link from "next/link"
import { Eyebrow } from "@/components/ui/Eyebrow"

export function ContactCTA() {
  return (
    <section
      data-header-theme="dark"
      className="bg-ink py-32 text-white md:py-44"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col items-center px-6 text-center md:px-12">
        <Eyebrow dark>Contact</Eyebrow>
        <h2 className="mt-8 max-w-[18ch] font-display text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[1] tracking-[-0.02em] text-white">
          Un projet métal en tête ?
        </h2>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-white/55">
          Parlez-nous de votre projet. Notre équipe technique vous répond dans
          les 24 heures.
        </p>
        <Link
          href="/contact"
          className="mt-12 inline-flex h-12 items-center rounded-full bg-accent px-8 text-[14px] font-medium tracking-[0.02em] text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.97]"
        >
          Nous joindre
        </Link>
      </div>
    </section>
  )
}
