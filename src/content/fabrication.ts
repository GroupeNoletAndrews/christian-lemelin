import type { FabricationContent } from "./types"

// Contenu de /fabrication — tiré du PDF « Fab sur mesure ». Le showcase
// matériaux lit MATERIALS (materials.ts) via materialSlugs, dans l'ordre
// demandé : Inox → Acier → Aluminium → Laiton → Cuivre.

export const FABRICATION: FabricationContent = {
  hero: {
    heading: "L'alliance parfaite entre performance et durabilité.",
    intro:
      "Chez E.C. Lemelin, chaque matériau est choisi pour ses propriétés uniques et sa capacité à s'adapter aux exigences de nos clients. Nous combinons innovation, expertise et qualité pour garantir des solutions métalliques fiables, durables et adaptées à chaque projet.",
    points: [
      "Sélection rigoureuse des matériaux pour une résistance optimale.",
      "Traitements et finitions adaptés aux contraintes industrielles et architecturales.",
      "Approche écoresponsable avec des matériaux recyclables et performants.",
    ],
  },
  raisonsHeading: "Cinq raisons, une seule exigence.",
  raisonsIntro:
    "Ce qui distingue une pièce correcte d'une réalisation impeccable, projet après projet.",
  raisons: [
    {
      title: "Polyvalence",
      body: "Des solutions adaptées à tous vos projets. Nous maîtrisons une large gamme de matériaux et de techniques de fabrication, ce qui nous permet de répondre aux besoins variés des secteurs industriels, architecturaux et institutionnels.",
    },
    {
      title: "Fiabilité",
      body: "Un partenaire de confiance à chaque étape. Nous nous engageons à offrir des solutions durables et conformes aux attentes de nos clients, avec un accompagnement personnalisé de la conception à la réalisation.",
    },
    {
      title: "Efficacité",
      body: "Des délais respectés, une qualité irréprochable. Grâce à des processus optimisés et des équipements de pointe, nous garantissons des livraisons rapides et des solutions performantes, sans compromis sur la qualité.",
    },
    {
      title: "Innovation",
      body: "Des technologies de pointe au service de vos projets. Nous intégrons des procédés de fabrication avancés et développons constamment de nouvelles solutions pour repousser les limites du design et de la performance.",
    },
    {
      title: "Expertise",
      body: "Un savoir-faire éprouvé dans la fabrication sur mesure. Avec plus de 25 ans d'expérience, nous transformons les matériaux avec précision et innovation pour créer des produits adaptés aux exigences les plus élevées.",
    },
  ],
  showcase: {
    heading: "Le bon matériau pour chaque exigence.",
    intro:
      "Inox, acier, aluminium, laiton et cuivre — travaillés avec la même exigence depuis des décennies.",
    materialSlugs: ["acier-inoxydable", "acier", "aluminium", "laiton", "cuivre"],
  },
  cta: {
    heading: "Obtenez notre brochure corporative.",
    body: "Un outil clair, pratique et à portée de main : nos services, engagements et expertises en un coup d'œil.",
    href: "/contact",
    label: "Nous joindre",
  },
}
