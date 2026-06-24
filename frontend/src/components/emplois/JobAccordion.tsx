"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Plus } from "@phosphor-icons/react"
import { useAdmin } from "@/lib/admin-context"
import { Job } from "@/types/admin"
import { ApplyModal } from "@/components/emplois/ApplyModal"
import { ArrowLink } from "@/components/ui/ArrowLink"

// Liste d'offres en accordéon typographique — aucune carte, aucun badge. Chaque
// offre est une grande ligne sur hairlines ; au clic, dépliage inline (réutilise
// le pattern SectorTabs de Solutions.tsx) révélant la description + « Postuler »
// qui ouvre l'ApplyModal existant. Voir DESIGN.md §7.
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

function typeLabel(t: string) {
  switch (t) {
    case "full-time":
      return "Temps plein"
    case "part-time":
      return "Temps partiel"
    case "contract":
      return "Contrat"
    default:
      return t
  }
}

export function JobAccordion() {
  const { jobs } = useAdmin()
  const reduce = useReducedMotion()
  const [openId, setOpenId] = useState<string | null>(jobs[0]?.id ?? null)
  const [applyJob, setApplyJob] = useState<Job | null>(null)

  // Jobs hydrate asynchronously from the API; open the first one once it lands
  // (without clobbering a choice the user already made).
  useEffect(() => {
    setOpenId((cur) => cur ?? jobs[0]?.id ?? null)
  }, [jobs])

  if (jobs.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-16 md:py-24">
        <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.01em] text-foreground">
          Aucun poste ouvert pour le moment.
        </h2>
        <p className="mt-4 max-w-[50ch] leading-relaxed text-foreground-muted">
          Les bons projets se font avec les bonnes personnes. Envoyez-nous votre candidature
          spontanée — nous gardons les profils intéressants pour nos futures opportunités.
        </p>
        <ArrowLink href="/contact" className="mt-6 text-lg">
          Envoyer une candidature spontanée
        </ArrowLink>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-20">
      <div>
        {jobs.map((job) => {
          const open = job.id === openId
          const meta = [typeLabel(job.type), job.location, job.salary]
            .filter(Boolean)
            .join("  ·  ")
          return (
            <div key={job.id} className="border-t border-border last:border-b">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : job.id)}
                aria-expanded={open}
                className="group flex w-full items-start gap-6 py-7 text-left md:py-9"
              >
                <div className="min-w-0 flex-1">
                  <h2
                    className={`font-display text-[clamp(1.5rem,3.2vw,2.5rem)] font-medium leading-tight tracking-[-0.01em] transition-colors duration-300 ${
                      open ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                    }`}
                  >
                    {job.title}
                  </h2>
                  <p className="mt-2 text-sm text-foreground-muted md:text-[15px]">{meta}</p>
                </div>
                <Plus
                  size={22}
                  weight="bold"
                  className={`mt-2 shrink-0 transition-all duration-300 ${
                    open ? "rotate-45 text-accent" : "text-foreground/40 group-hover:text-foreground"
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={reduce ? undefined : { height: 0, opacity: 0 }}
                    animate={reduce ? undefined : { height: "auto", opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    <div className="pb-9 pr-2 md:pb-12">
                      <p className="max-w-[64ch] leading-relaxed text-foreground-muted">
                        {job.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => setApplyJob(job)}
                        className="mt-7 inline-flex h-12 items-center rounded-full bg-accent px-7 text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99]"
                      >
                        Postuler
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
    </div>
  )
}
