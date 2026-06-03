"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "@phosphor-icons/react"
import { useAdmin } from "@/lib/admin-context"

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
    <div className="min-h-screen bg-[#f3f3f1]">
      {/* Hero Section */}
      <section className="bg-white border-b border-[#e8e8e6] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[#111113] font-bebas-neue mb-4">
              Rejoignez notre équipe
            </h1>
            <p className="text-xl text-[#111113]/70 font-barlow-condensed">
              Découvrez nos offres d'emploi et devenez part de l'aventure chez Entreprises Christian
              Lemelin
            </p>
          </motion.div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <p className="text-xl text-[#111113]/60 font-barlow-condensed mb-6">
                Aucune offre d'emploi disponible pour le moment
              </p>
              <p className="text-[#111113]/50 font-barlow-condensed">
                Revenez bientôt pour découvrir les dernières opportunités
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-[#e8e8e6] p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                        <h2 className="text-2xl font-bold text-[#111113] font-bebas-neue">
                          {job.title}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-block px-3 py-1 bg-[#f5a020]/10 rounded-full text-sm font-barlow-condensed text-[#f5a020] font-bold">
                            {job.department}
                          </span>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-barlow-condensed font-bold ${
                              job.type === "full-time"
                                ? "bg-green-100 text-green-800"
                                : job.type === "part-time"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {getJobTypeLabel(job.type)}
                          </span>
                        </div>
                      </div>

                      <p className="text-[#111113]/70 font-barlow-condensed mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-6 text-sm font-barlow-condensed text-[#111113]/60">
                        <div>
                          <p className="text-xs font-bold text-[#111113]/50 mb-1">LOCALISATION</p>
                          <p className="text-[#111113]">{job.location}</p>
                        </div>
                        {job.salary && (
                          <div>
                            <p className="text-xs font-bold text-[#111113]/50 mb-1">SALAIRE</p>
                            <p className="text-[#111113]">{job.salary}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="md:flex-shrink-0 flex items-center justify-center gap-2 px-8 py-4 bg-[#f5a020] hover:bg-[#d4881a] text-white rounded-lg font-barlow-condensed font-bold transition-colors whitespace-nowrap"
                    >
                      Postuler
                      <ArrowRight size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-white border-t border-[#e8e8e6] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-[#111113] font-bebas-neue mb-4">
              Vous n'avez pas trouvé ce que vous cherchez?
            </h2>
            <p className="text-[#111113]/70 font-barlow-condensed mb-8">
              Envoyez-nous votre CV et profil professionnel. Nous gardons les candidatures intéressantes
              pour les futures opportunités.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-[#111113] hover:bg-[#111113]/90 text-white rounded-lg font-barlow-condensed font-bold transition-colors"
            >
              Nous contacter
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
