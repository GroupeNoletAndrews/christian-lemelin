import type { InstallationsContent } from "./types"

// Contenu de /installations — tiré des PDF « Nos installations » et « Accueil ».

export const INSTALLATIONS: InstallationsContent = {
  hero: {
    heading: {
      fr: "Installations modernes. Transformations optimales.",
      en: "Modern facilities. Optimal transformation.",
    },
    intro: {
      fr: "Nous disposons d'infrastructures modernes et de technologies de pointe pour répondre aux exigences de production les plus élevées. Nos équipements sont conçus pour garantir une qualité constante, une précision optimale et une efficacité maximale à chaque étape.",
      en: "We operate modern infrastructure and cutting-edge technologies to meet the most demanding production requirements. Our equipment is engineered to deliver consistent quality, optimal precision and maximum efficiency at every stage.",
    },
    image: { seed: "ecl-install-hero-aerial", alt: "Vue aérienne de l'usine", grayscale: true },
  },
  capabilities: [
    {
      title: {
        fr: "Conception assistée par ordinateur (CAO)",
        en: "Computer-aided design (CAD)",
      },
      body: {
        fr: "Ingénierie et conception structurale, de la modélisation à la simulation.",
        en: "Structural engineering and design, from modeling through to simulation.",
      },
    },
    {
      title: {
        fr: "Découpe laser — plaque et tube",
        en: "Laser cutting — plate and tube",
      },
      body: {
        fr: "Précision au dixième de millimètre sur toutes épaisseurs.",
        en: "Accuracy to a tenth of a millimeter across all thicknesses.",
      },
    },
    {
      title: {
        fr: "Robotique et automatisation",
        en: "Robotics and automation",
      },
      body: {
        fr: "Cellules robotisées pour une production constante et répétable.",
        en: "Robotic cells for consistent, repeatable production.",
      },
    },
    {
      title: {
        fr: "Presse plieuse CNC",
        en: "CNC press brake",
      },
      body: {
        fr: "Pliage précis et reproductible pour des assemblages complexes.",
        en: "Precise, repeatable bending for complex assemblies.",
      },
    },
    {
      title: {
        fr: "Traitement de surface",
        en: "Surface treatment",
      },
      body: {
        fr: "Finitions et protections adaptées aux contraintes d'usage.",
        en: "Finishes and protective coatings tailored to service conditions.",
      },
    },
  ],
  stats: [
    {
      value: { fr: "15 000 pi²", en: "15,000 sq ft" },
      label: { fr: "Surface de production", en: "Production floor area" },
    },
    {
      value: "30+",
      label: { fr: "Années d'expertise", en: "Years of expertise" },
    },
    {
      value: "5",
      label: { fr: "Matériaux maîtrisés", en: "Materials mastered" },
    },
  ],
  eco: {
    heading: {
      fr: "Une production optimisée et éco-responsable.",
      en: "Optimized, environmentally responsible production.",
    },
    intro: {
      fr: "Nous intégrons des pratiques de fabrication durables pour réduire notre empreinte environnementale tout en maximisant la performance.",
      en: "We embed sustainable manufacturing practices to reduce our environmental footprint while maximizing performance.",
    },
    points: [
      {
        title: { fr: "Optimisation énergétique", en: "Energy optimization" },
        body: {
          fr: "Réduction de la consommation et valorisation des ressources.",
          en: "Lower consumption and smarter use of resources.",
        },
      },
      {
        title: {
          fr: "Matériaux recyclés et recyclables",
          en: "Recycled and recyclable materials",
        },
        body: {
          fr: "Une chaîne de fabrication pensée pour durer.",
          en: "A manufacturing chain built to last.",
        },
      },
      {
        title: { fr: "Procédés à faible émission", en: "Low-emission processes" },
        body: {
          fr: "Conformes aux normes environnementales les plus strictes.",
          en: "Compliant with the strictest environmental standards.",
        },
      },
    ],
    image: { seed: "ecl-install-eco-press", alt: "Atelier de production éco-responsable", grayscale: true },
  },
  partner: {
    heading: {
      fr: "Un partenaire de confiance pour vos projets métalliques.",
      en: "A trusted partner for your metal projects.",
    },
    body: {
      fr: "Bâtir des relations solides avec nos partenaires, investir dans l'avenir, assurer la performance et favoriser une croissance durable. Notre engagement : la modernisation, l'automatisation et la formation continue de nos équipes.",
      en: "Building strong relationships with our partners, investing in the future, delivering performance and fostering sustainable growth. Our commitment: modernization, automation and the ongoing training of our teams.",
    },
    image: { seed: "ecl-install-partner-factory", alt: "Usine E.C. Lemelin" },
  },
  cta: {
    heading: {
      fr: "Un projet à fabriquer ?",
      en: "A project to fabricate?",
    },
    body: {
      fr: "Parlez-nous de vos besoins. Notre équipe technique évalue la faisabilité et vous répond rapidement.",
      en: "Tell us about your needs. Our technical team assesses feasibility and gets back to you quickly.",
    },
    href: "/contact",
    label: { fr: "Nous joindre", en: "Contact us" },
  },
}
