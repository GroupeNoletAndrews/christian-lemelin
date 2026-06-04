"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { useAdmin } from "@/lib/admin-context"
import { Eyebrow } from "@/components/ui/Eyebrow"
import { Tag } from "@/components/ui/Tag"

export default function EmploisPage() {
  const { jobs } = useAdmin()

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case "full-time":
        return "Temps plein"
      case "part-time":
        return "Temps partiel"
      case "contract":
        return "Contrat"
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-background" data-header-theme="light">
      {/* Hero */}
      <section className="bg-surface border-b border-border pt-40 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <Eyebrow>Carrières</Eyebrow>
            <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4rem)] font-semibold tracking-tight leading-[1.05] text-foreground">
              Rejoignez notre équipe
            </h1>
            <p className="mt-5 text-lg text-foreground-muted font-sans max-w-[52ch]">
              Découvrez nos offres d&apos;emploi et prenez part à l&apos;aventure chez Entreprises
              Christian Lemelin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Jobs */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <p className="text-xl text-foreground font-sans mb-4">
                Aucune offre d&apos;emploi disponible pour le moment
              </p>
              <p className="text-foreground-muted font-sans">
                Revenez bientôt pour découvrir les dernières opportunités.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-surface rounded-2xl border border-border p-8 transition-colors hover:border-foreground/20"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                        <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
                          {job.title}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          <Tag>{job.department}</Tag>
                          <Tag>{getJobTypeLabel(job.type)}</Tag>
                        </div>
                      </div>

                      <p className="text-foreground-muted font-sans mb-5 leading-relaxed line-clamp-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-8">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-muted mb-1">
                            Localisation
                          </p>
                          <p className="text-sm font-sans text-foreground">{job.location}</p>
                        </div>
                        {job.salary && (
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-muted mb-1">
                              Salaire
                            </p>
                            <p className="text-sm font-sans text-foreground">{job.salary}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/contact"
                      className="md:flex-shrink-0 inline-flex items-center justify-center px-7 py-3.5 bg-accent hover:bg-accent-hover text-white rounded-full font-sans text-sm font-medium transition-colors whitespace-nowrap active:scale-[0.99]"
                    >
                      Postuler
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-ink text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <Eyebrow dark>Candidature spontanée</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-tight leading-[1.1] text-white">
              Vous n&apos;avez pas trouvé ce que vous cherchez?
            </h2>
            <p className="mt-5 text-white/60 font-sans max-w-[48ch]">
              Envoyez-nous votre CV et votre profil professionnel. Nous gardons les candidatures
              intéressantes pour les futures opportunités.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center px-7 py-3.5 bg-accent hover:bg-accent-hover text-white rounded-full font-sans text-sm font-medium transition-colors active:scale-[0.99]"
            >
              Nous contacter
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
