import type { FabricationContent } from "./types"

// Contenu de /fabrication — tiré du PDF « Fab sur mesure ». Le showcase
// matériaux lit MATERIALS (materials.ts) via materialSlugs, dans l'ordre
// demandé : Inox → Acier → Aluminium → Laiton → Cuivre.

export const FABRICATION: FabricationContent = {
  hero: {
    heading: {
      fr: "L'alliance parfaite entre performance et durabilité.",
      en: "The perfect balance of performance and durability.",
    },
    intro: {
      fr: "Chez E.C. Lemelin, chaque matériau est choisi pour ses propriétés uniques et sa capacité à s'adapter aux exigences de nos clients. Nous combinons innovation, expertise et qualité pour garantir des solutions métalliques fiables, durables et adaptées à chaque projet.",
      en: "At E.C. Lemelin, every material is selected for its unique properties and its ability to meet our clients' requirements. We combine innovation, expertise and quality to deliver reliable, durable metal solutions tailored to each project.",
    },
    points: [
      {
        fr: "Sélection rigoureuse des matériaux pour une résistance optimale.",
        en: "Rigorous material selection for optimal strength.",
      },
      {
        fr: "Traitements et finitions adaptés aux contraintes industrielles et architecturales.",
        en: "Treatments and finishes suited to industrial and architectural demands.",
      },
      {
        fr: "Approche écoresponsable avec des matériaux recyclables et performants.",
        en: "An eco-responsible approach built on recyclable, high-performance materials.",
      },
    ],
  },
  raisonsHeading: {
    fr: "Cinq raisons, une seule exigence.",
    en: "Five reasons, one standard.",
  },
  raisonsIntro: {
    fr: "Ce qui distingue une pièce correcte d'une réalisation impeccable, projet après projet.",
    en: "What sets an adequate part apart from flawless work, project after project.",
  },
  raisons: [
    {
      title: { fr: "Polyvalence", en: "Versatility" },
      body: {
        fr: "Des solutions adaptées à tous vos projets. Nous maîtrisons une large gamme de matériaux et de techniques de fabrication, ce qui nous permet de répondre aux besoins variés des secteurs industriels, architecturaux et institutionnels.",
        en: "Solutions tailored to every project. We command a broad range of materials and fabrication techniques, allowing us to meet the diverse needs of the industrial, architectural and institutional sectors.",
      },
    },
    {
      title: { fr: "Fiabilité", en: "Reliability" },
      body: {
        fr: "Un partenaire de confiance à chaque étape. Nous nous engageons à offrir des solutions durables et conformes aux attentes de nos clients, avec un accompagnement personnalisé de la conception à la réalisation.",
        en: "A trusted partner at every stage. We are committed to delivering durable solutions that meet our clients' expectations, with personalized support from design to completion.",
      },
    },
    {
      title: { fr: "Efficacité", en: "Efficiency" },
      body: {
        fr: "Des délais respectés, une qualité irréprochable. Grâce à des processus optimisés et des équipements de pointe, nous garantissons des livraisons rapides et des solutions performantes, sans compromis sur la qualité.",
        en: "Deadlines met, quality beyond reproach. Through streamlined processes and state-of-the-art equipment, we guarantee fast delivery and high-performance solutions, with no compromise on quality.",
      },
    },
    {
      title: { fr: "Innovation", en: "Innovation" },
      body: {
        fr: "Des technologies de pointe au service de vos projets. Nous intégrons des procédés de fabrication avancés et développons constamment de nouvelles solutions pour repousser les limites du design et de la performance.",
        en: "Leading-edge technology in service of your projects. We integrate advanced fabrication processes and continually develop new solutions to push the limits of design and performance.",
      },
    },
    {
      title: { fr: "Expertise", en: "Expertise" },
      body: {
        fr: "Un savoir-faire éprouvé dans la fabrication sur mesure. Avec plus de 30 ans d'expérience, nous transformons les matériaux avec précision et innovation pour créer des produits adaptés aux exigences les plus élevées.",
        en: "Proven craftsmanship in custom fabrication. With more than 30 years of experience, we shape materials with precision and innovation to create products that meet the most demanding requirements.",
      },
    },
  ],
  showcase: {
    heading: {
      fr: "Le bon matériau pour chaque exigence.",
      en: "The right material for every requirement.",
    },
    intro: {
      fr: "Inox, acier, aluminium, laiton et cuivre — travaillés avec la même exigence depuis plus de 30 ans.",
      en: "Stainless steel, steel, aluminum, brass and copper — worked to the same exacting standard for over 30 years.",
    },
    materialSlugs: ["acier-inoxydable", "acier", "aluminium", "laiton", "cuivre"],
  },
  cta: {
    heading: {
      fr: "Obtenez notre brochure corporative.",
      en: "Get our corporate brochure.",
    },
    body: {
      fr: "Un outil clair, pratique et à portée de main : nos services, engagements et expertises en un coup d'œil.",
      en: "A clear, practical resource at your fingertips: our services, commitments and expertise at a glance.",
    },
    href: "/contact",
    label: { fr: "Nous joindre", en: "Contact us" },
  },
}
