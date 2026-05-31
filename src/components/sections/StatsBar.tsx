const stats = [
  { value: "40+", label: "Années d'expertise" },
  { value: "2 400+", label: "Projets réalisés" },
  { value: "5", label: "Matériaux maîtrisés" },
  { value: "100%", label: "Fabriqué au Québec" },
]

export function StatsBar() {
  return (
    <section data-header-theme="light" className="bg-surface border-y border-black/8 py-16 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <p className="font-mono text-[clamp(2.25rem,4.5vw,3.25rem)] text-zinc-900 leading-none mb-2.5 tracking-[-0.02em]">
                {stat.value}
              </p>
              <p className="text-[11px] font-sans text-zinc-400 tracking-[0.06em] uppercase leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
