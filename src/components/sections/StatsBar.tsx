const stats = [
  { value: "40+", label: "Années d'expertise" },
  { value: "2 400+", label: "Projets réalisés" },
  { value: "5", label: "Matériaux maîtrisés" },
  { value: "100%", label: "Fabriqué au Québec" },
]

export function StatsBar() {
  return (
    <section
      data-header-theme="light"
      className="border-t border-border bg-surface py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-[clamp(3rem,6vw,5rem)] font-semibold leading-none tracking-[-0.03em] text-foreground">
                {stat.value}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
