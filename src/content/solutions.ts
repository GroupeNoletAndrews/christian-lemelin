import type { SolutionDetail, SolutionsOverviewContent } from "./types"

// Contenu de /solutions (vue d'ensemble + 6 catégories produits). À ne pas
// confondre avec la section home Solutions.tsx (4 SECTEURS / marchés). Copie
// tirée des PDF « Nos solutions », « Mob hosp », « Mobilier d'accueil » et
// « Composante archit » ; labo/prototypes/pièces synthétisés (hasSourceCopy:false).

export const SOLUTIONS_OVERVIEW: SolutionsOverviewContent = {
  hero: {
    heading: "Une expertise qui couvre un large éventail de solutions.",
    intro:
      "Chez E.C. Lemelin, nous développons des solutions métalliques adaptées à de nombreux secteurs : industrie, construction, mobilier spécialisé et installations sur mesure.",
    points: [
      {
        title: "Mobilier technique et professionnel",
        body: "Conception pour laboratoires, hôpitaux, bureaux et espaces collectifs.",
      },
      {
        title: "Fabrication spécialisée",
        body: "Composants métalliques précis pour divers secteurs, de l'aéronautique au médical.",
      },
      {
        title: "Solutions architecturales et industrielles",
        body: "Structures métalliques complexes et finitions sur mesure.",
      },
    ],
  },
  index: [
    {
      slug: "mobilier-hospitalier",
      title: "Mobilier hospitalier personnalisé",
      tagline: "Ergonomie, durabilité et hygiène pour le secteur médical.",
      hoverImage: { seed: "ecl-sol-hospitalier", alt: "Mobilier hospitalier en inox", grayscale: true },
    },
    {
      slug: "mobilier-laboratoire",
      title: "Mobilier de laboratoire et recherche",
      tagline: "Plans de travail et structures pour environnements stériles.",
      hoverImage: { seed: "ecl-sol-laboratoire", alt: "Mobilier de laboratoire", grayscale: true },
    },
    {
      slug: "mobilier-accueil",
      title: "Mobilier d'accueil et espaces communes",
      tagline: "Comptoirs et assises pour les lieux à forte fréquentation.",
      hoverImage: { seed: "ecl-sol-accueil", alt: "Banque d'accueil métallique", grayscale: true },
    },
    {
      slug: "prototypes",
      title: "Développement de prototypes",
      tagline: "Du concept à la pièce finie, prête pour la production.",
      hoverImage: { seed: "ecl-sol-prototypes", alt: "Prototype métallique", grayscale: true },
    },
    {
      slug: "composantes-architecturales",
      title: "Composantes architecturales",
      tagline: "Des éléments uniques qui s'intègrent à chaque projet.",
      hoverImage: { seed: "ecl-sol-architecturales", alt: "Composante architecturale", grayscale: true },
    },
    {
      slug: "pieces-sur-mesure",
      title: "Pièces de mobilier sur mesure",
      tagline: "Pièces uniques ou en série, fabriquées selon vos plans.",
      hoverImage: { seed: "ecl-sol-pieces", alt: "Pièce de mobilier sur mesure", grayscale: true },
    },
  ],
  closing: {
    heading:
      "Nous sélectionnons les meilleurs alliages et procédés de fabrication pour garantir des produits adaptés aux normes industrielles.",
  },
}

export const SOLUTION_DETAILS: SolutionDetail[] = [
  {
    slug: "mobilier-hospitalier",
    title: "Mobilier hospitalier personnalisé",
    metaDescription:
      "Mobilier hospitalier sur mesure à Québec — acier inoxydable médical, ergonomie et hygiène pour hôpitaux, cliniques et laboratoires.",
    hero: {
      heading: "Mobilier hospitalier personnalisé",
      intro:
        "Nous concevons et fabriquons du mobilier hospitalier sur mesure, alliant ergonomie, durabilité et hygiène. Grâce à notre maîtrise des matériaux comme l'acier et l'acier inoxydable, nous proposons des solutions adaptées aux exigences strictes du secteur médical — des établissements de santé aux cliniques et laboratoires.",
      image: { seed: "ecl-sol-hospitalier-hero", alt: "Mobilier hospitalier en inox", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: "Une expertise adaptée aux environnements médicaux exigeants",
        paragraphs: [
          "Chez E.C. Lemelin, nous fabriquons des équipements métalliques sur mesure pour les hôpitaux, cliniques, laboratoires et centres de soins. Nos solutions sont conçues pour faciliter l'asepsie, optimiser l'espace et améliorer la durabilité des infrastructures hospitalières.",
          "Mobilier en acier inoxydable pour une hygiène irréprochable, solutions ergonomiques adaptées aux environnements stériles, fabrication sur mesure pour répondre aux besoins spécifiques des établissements de santé.",
        ],
      },
      {
        kind: "list",
        heading: "Conception avancée et matériaux haute performance",
        intro: "Nous allions technologie de pointe et savoir-faire pour garantir des équipements à la hauteur des exigences du secteur médical.",
        items: [
          { title: "Acier inoxydable médical", body: "Résistance à la corrosion et nettoyage simplifié." },
          { title: "Design ergonomique", body: "Optimisation des espaces et facilité d'utilisation." },
          { title: "Fabrication de précision", body: "Technologies de découpe laser et robotisation." },
        ],
      },
      {
        kind: "list",
        heading: "Des solutions adaptées à chaque environnement",
        items: [
          { title: "Mobilier de laboratoire", body: "Plans de travail, armoires et structures adaptés aux environnements stériles." },
          { title: "Portes et structures métalliques", body: "Solutions renforcées pour une durabilité accrue dans les hôpitaux." },
          { title: "Équipements sur mesure", body: "Adaptation à des besoins spécifiques comme les blocs opératoires et les unités de soins intensifs." },
        ],
      },
      {
        kind: "gallery",
        heading: "Quelques réalisations",
        images: [
          { seed: "ecl-sol-hospitalier-1", alt: "Poste de soins en inox" },
          { seed: "ecl-sol-hospitalier-2", alt: "Armoire hospitalière" },
          { seed: "ecl-sol-hospitalier-3", alt: "Plan de travail médical" },
          { seed: "ecl-sol-hospitalier-4", alt: "Mobilier de bloc opératoire" },
        ],
      },
    ],
    relatedMaterials: ["acier-inoxydable", "acier"],
    showRealisations: true,
    hasSourceCopy: true,
  },

  {
    slug: "mobilier-laboratoire",
    title: "Mobilier de laboratoire et recherche",
    metaDescription:
      "Mobilier de laboratoire sur mesure à Québec — plans de travail, armoires et structures résistants pour environnements de recherche et stériles.",
    hero: {
      heading: "Mobilier de laboratoire et recherche",
      intro:
        "Nous concevons des plans de travail, armoires et structures métalliques adaptés aux environnements de laboratoire et de recherche. Résistance chimique, hygiène et précision dimensionnelle guident chacune de nos réalisations.",
      image: { seed: "ecl-sol-laboratoire-hero", alt: "Mobilier de laboratoire", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: "Des espaces de recherche pensés pour la rigueur",
        paragraphs: [
          "Les laboratoires imposent des contraintes uniques : résistance aux agents chimiques, facilité de décontamination et précision des aménagements. Notre maîtrise de l'acier inoxydable et des structures métalliques nous permet d'y répondre avec exactitude.",
          "Chaque poste est conçu pour durer et pour s'intégrer aux protocoles les plus exigeants.",
        ],
      },
      {
        kind: "list",
        heading: "Des aménagements à la hauteur de vos protocoles",
        items: [
          { title: "Plans de travail résistants", body: "Surfaces hygiéniques et faciles à entretenir." },
          { title: "Armoires et rangements", body: "Solutions sécurisées pour instruments et réactifs." },
          { title: "Structures sur mesure", body: "Adaptées aux équipements spécialisés et aux contraintes d'espace." },
        ],
      },
      {
        kind: "gallery",
        heading: "Quelques réalisations",
        images: [
          { seed: "ecl-sol-laboratoire-1", alt: "Paillasse de laboratoire en inox" },
          { seed: "ecl-sol-laboratoire-2", alt: "Armoire de laboratoire" },
          { seed: "ecl-sol-laboratoire-3", alt: "Structure de recherche" },
        ],
      },
    ],
    relatedMaterials: ["acier-inoxydable", "acier"],
    showRealisations: true,
    hasSourceCopy: false,
  },

  {
    slug: "mobilier-accueil",
    title: "Mobilier d'accueil et espaces communes",
    metaDescription:
      "Mobilier d'accueil sur mesure à Québec — comptoirs, assises et cloisons métalliques pour halls, espaces collaboratifs et lieux à forte fréquentation.",
    hero: {
      heading: "Mobilier d'accueil et espaces communes",
      intro:
        "Nous concevons et fabriquons du mobilier d'accueil et d'espaces communs sur mesure, alliant esthétique, confort et durabilité. Grâce à notre expertise en transformation des matériaux, nous créons des solutions adaptées aux environnements à forte fréquentation, garantissant ergonomie, résistance et intégration harmonieuse à votre espace.",
      image: { seed: "ecl-sol-accueil-hero", alt: "Banque d'accueil métallique", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: "Un mobilier conçu pour sublimer et structurer les espaces",
        paragraphs: [
          "Chez E.C. Lemelin, nous fabriquons du mobilier métallique adapté aux halls d'accueil, espaces collaboratifs et zones de passage. Matériaux résistants — acier inoxydable, aluminium et structures métalliques robustes —, design épuré et fonctionnel, personnalisation avancée selon vos besoins.",
          "Une intégration parfaite dans les espaces contemporains, pensée pour durer.",
        ],
      },
      {
        kind: "list",
        heading: "Des équipements pensés pour l'usage intensif et le confort",
        items: [
          { title: "Banques d'accueil et comptoirs", body: "Conçus pour l'ergonomie et la durabilité." },
          { title: "Assises et bancs métalliques", body: "Résistants aux usages intensifs et faciles d'entretien." },
          { title: "Cloisons et séparateurs modulaires", body: "Optimisation des espaces ouverts." },
        ],
      },
      {
        kind: "list",
        heading: "Des standards élevés pour des espaces qui durent",
        intro: "Les espaces à forte fréquentation nécessitent des matériaux durables et faciles à entretenir.",
        items: [
          { title: "Matériaux haute durabilité", body: "Pour une utilisation prolongée." },
          { title: "Design ergonomique", body: "Pensé pour le bien-être des utilisateurs." },
          { title: "Finitions soignées", body: "Pour un environnement accueillant et facile d'entretien." },
        ],
      },
      {
        kind: "gallery",
        heading: "Quelques réalisations",
        images: [
          { seed: "ecl-sol-accueil-1", alt: "Comptoir d'accueil" },
          { seed: "ecl-sol-accueil-2", alt: "Banc métallique" },
          { seed: "ecl-sol-accueil-3", alt: "Cloison design" },
          { seed: "ecl-sol-accueil-4", alt: "Espace commun aménagé" },
        ],
      },
    ],
    relatedMaterials: ["acier-inoxydable", "aluminium", "laiton"],
    showRealisations: true,
    hasSourceCopy: true,
  },

  {
    slug: "prototypes",
    title: "Développement de prototypes",
    metaDescription:
      "Développement de prototypes métalliques à Québec — du concept à la pièce finie, prête pour la validation et la production en série.",
    hero: {
      heading: "Développement de prototypes",
      intro:
        "Du concept à la pièce finie, nous accompagnons le développement de prototypes pour divers projets. Notre équipe technique transforme vos idées en composants métalliques fonctionnels, prêts pour la validation et la production en série.",
      image: { seed: "ecl-sol-prototypes-hero", alt: "Prototype métallique en atelier", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: "Transformer une idée en pièce fonctionnelle",
        paragraphs: [
          "Le prototypage exige rapidité, précision et dialogue constant. Grâce à la conception assistée par ordinateur et à nos équipements de pointe, nous itérons vite pour valider la forme, l'ajustement et la fonction avant la mise en production.",
          "Chaque prototype est une étape vers un produit fiable et reproductible.",
        ],
      },
      {
        kind: "list",
        heading: "Un accompagnement de bout en bout",
        items: [
          { title: "Conception et modélisation (CAO)", body: "Validation de la géométrie et des tolérances en amont." },
          { title: "Fabrication rapide", body: "Découpe laser, pliage et soudure pour des itérations courtes." },
          { title: "Mise en production", body: "Transition fluide du prototype vers la série." },
        ],
      },
      {
        kind: "gallery",
        heading: "Quelques réalisations",
        images: [
          { seed: "ecl-sol-prototypes-1", alt: "Prototype usiné" },
          { seed: "ecl-sol-prototypes-2", alt: "Pièce de validation" },
          { seed: "ecl-sol-prototypes-3", alt: "Assemblage prototype" },
        ],
      },
    ],
    relatedMaterials: ["acier", "aluminium"],
    showRealisations: true,
    hasSourceCopy: false,
  },

  {
    slug: "composantes-architecturales",
    title: "Composantes architecturales",
    metaDescription:
      "Composantes architecturales sur mesure à Québec — design, robustesse et précision pour des éléments uniques intégrés à chaque projet.",
    hero: {
      heading: "Composantes architecturales",
      intro:
        "Nous concevons et fabriquons des composantes architecturales sur mesure, alliant design, robustesse et précision. Grâce à notre expertise en transformation des matériaux, nous créons des éléments uniques qui s'intègrent harmonieusement à chaque projet, qu'il s'agisse d'aménagements intérieurs ou de structures extérieures.",
      image: { seed: "ecl-sol-architecturales-hero", alt: "Composante architecturale en métal", grayscale: true },
    },
    blocks: [
      {
        kind: "feature",
        heading: "Technologie et précision au service de l'excellence",
        intro:
          "Nos solutions sont conçues pour répondre aux exigences esthétiques et techniques des architectes et designers les plus exigeants.",
        image: { seed: "ecl-sol-architecturales-feature", alt: "Détail architectural en métal", grayscale: true },
        points: [
          { title: "Bâtiments publics et espaces commerciaux", body: "Des composantes qui structurent et subliment les lieux." },
          { title: "Aménagements intérieurs", body: "Éléments uniques intégrés à chaque projet." },
          { title: "Structures extérieures", body: "Revêtements, garde-corps et façades durables." },
        ],
      },
      {
        kind: "prose",
        heading: "Des structures sur mesure pour l'architecture moderne",
        paragraphs: [
          "Nous concevons et fabriquons des composantes métalliques sur mesure, alliant design, robustesse et précision, pour des concepts à la hauteur des attentes les plus élevées.",
          "Ingénierie et savoir-faire se rencontrent pour donner vie à des éléments durables, esthétiques et parfaitement intégrés.",
        ],
      },
      {
        kind: "gallery",
        heading: "Quelques réalisations",
        images: [
          { seed: "ecl-sol-architecturales-1", alt: "Revêtement métallique" },
          { seed: "ecl-sol-architecturales-2", alt: "Garde-corps design" },
          { seed: "ecl-sol-architecturales-3", alt: "Façade moderne" },
          { seed: "ecl-sol-architecturales-4", alt: "Plafond architectural" },
        ],
      },
    ],
    relatedMaterials: ["acier", "laiton", "cuivre"],
    showRealisations: true,
    hasSourceCopy: true,
  },

  {
    slug: "pieces-sur-mesure",
    title: "Pièces de mobilier sur mesure",
    metaDescription:
      "Pièces de mobilier métallique sur mesure à Québec — pièces uniques ou en série, fabriquées selon vos plans avec des finitions soignées.",
    hero: {
      heading: "Pièces de mobilier sur mesure",
      intro:
        "Pièces uniques ou en petites séries, nos composants de mobilier sur mesure sont fabriqués selon vos plans ou développés avec notre équipe. Précision, finitions soignées et matériaux durables pour des réalisations qui traversent le temps.",
      image: { seed: "ecl-sol-pieces-hero", alt: "Pièce de mobilier sur mesure", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: "Le sur-mesure, jusque dans le détail",
        paragraphs: [
          "Qu'il s'agisse d'une pièce signature ou d'une série limitée, nous donnons forme au métal selon vos plans ou en co-conception avec notre équipe. Chaque détail compte, de l'assemblage à la finition.",
          "Le résultat : des pièces robustes, esthétiques et parfaitement adaptées à leur usage.",
        ],
      },
      {
        kind: "list",
        heading: "Un savoir-faire complet",
        items: [
          { title: "Conception assistée", body: "Du plan à la pièce, avec validation des tolérances." },
          { title: "Finitions variées", body: "Poli, brossé, peint ou plaqué selon le projet." },
          { title: "Matériaux durables", body: "Inox, acier, aluminium, laiton et cuivre." },
        ],
      },
      {
        kind: "gallery",
        heading: "Quelques réalisations",
        images: [
          { seed: "ecl-sol-pieces-1", alt: "Pièce de mobilier en métal" },
          { seed: "ecl-sol-pieces-2", alt: "Détail de finition" },
          { seed: "ecl-sol-pieces-3", alt: "Mobilier signature" },
        ],
      },
    ],
    relatedMaterials: ["acier-inoxydable", "laiton", "aluminium"],
    showRealisations: true,
    hasSourceCopy: false,
  },
]

export const SOLUTION_SLUGS = SOLUTION_DETAILS.map((s) => s.slug)

export function getSolution(slug: string): SolutionDetail | undefined {
  return SOLUTION_DETAILS.find((s) => s.slug === slug)
}
