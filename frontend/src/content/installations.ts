import type { InstallationsContent } from "./types"

// Contenu de /installations — tiré des PDF « Nos installations » et « Accueil ».

export const INSTALLATIONS: InstallationsContent = {
  hero: {
    heading: "Installations modernes. Transformations optimales.",
    intro:
      "Nous disposons d'infrastructures modernes et de technologies de pointe pour répondre aux exigences de production les plus élevées. Nos équipements sont conçus pour garantir une qualité constante, une précision optimale et une efficacité maximale à chaque étape.",
    image: { seed: "ecl-install-hero-aerial", alt: "Vue aérienne de l'usine", grayscale: true },
  },
  capabilities: [
    {
      title: "Conception assistée par ordinateur (CAO)",
      body: "Ingénierie et conception structurale, de la modélisation à la simulation.",
    },
    {
      title: "Découpe laser — plaque et tube",
      body: "Précision au dixième de millimètre sur toutes épaisseurs.",
    },
    {
      title: "Robotique et automatisation",
      body: "Cellules robotisées pour une production constante et répétable.",
    },
    {
      title: "Presse plieuse CNC",
      body: "Pliage précis et reproductible pour des assemblages complexes.",
    },
    {
      title: "Traitement de surface",
      body: "Finitions et protections adaptées aux contraintes d'usage.",
    },
  ],
  stats: [
    { value: "15 000 pi²", label: "Surface de production" },
    { value: "20+", label: "Années d'expertise" },
    { value: "5", label: "Matériaux maîtrisés" },
  ],
  eco: {
    heading: "Une production optimisée et éco-responsable.",
    intro:
      "Nous intégrons des pratiques de fabrication durables pour réduire notre empreinte environnementale tout en maximisant la performance.",
    points: [
      { title: "Optimisation énergétique", body: "Réduction de la consommation et valorisation des ressources." },
      { title: "Matériaux recyclés et recyclables", body: "Une chaîne de fabrication pensée pour durer." },
      { title: "Procédés à faible émission", body: "Conformes aux normes environnementales les plus strictes." },
    ],
    image: { seed: "ecl-install-eco-press", alt: "Atelier de production éco-responsable", grayscale: true },
  },
  partner: {
    heading: "Un partenaire de confiance pour vos projets métalliques.",
    body: "Bâtir des relations solides avec nos partenaires, investir dans l'avenir, assurer la performance et favoriser une croissance durable. Notre engagement : la modernisation, l'automatisation et la formation continue de nos équipes.",
    image: { seed: "ecl-install-partner-factory", alt: "Usine E.C. Lemelin" },
  },
  cta: {
    heading: "Un projet à fabriquer ?",
    body: "Parlez-nous de vos besoins. Notre équipe technique évalue la faisabilité et vous répond rapidement.",
    href: "/contact",
    label: "Nous joindre",
  },
}
