import type { SolutionDetail, SolutionsOverviewContent } from "./types"

// Contenu de /solutions (vue d'ensemble + 6 catégories produits). À ne pas
// confondre avec la section home Solutions.tsx (4 SECTEURS / marchés). Copie
// tirée des PDF « Nos solutions », « Mob hosp », « Mobilier d'accueil » et
// « Composante archit » ; labo/prototypes/pièces synthétisés (hasSourceCopy:false).
// Champs texte bilingues { fr, en } — rendus via tr(champ, locale).

export const SOLUTIONS_OVERVIEW: SolutionsOverviewContent = {
  hero: {
    heading: {
      fr: "Une expertise qui couvre un large éventail de solutions.",
      en: "Expertise that spans a broad range of solutions.",
    },
    intro: {
      fr: "Chez E.C. Lemelin, nous développons des solutions métalliques adaptées à de nombreux secteurs : industrie, construction, mobilier spécialisé et installations sur mesure.",
      en: "At E.C. Lemelin, we develop metal solutions tailored to a wide range of sectors: industry, construction, specialized furniture and custom installations.",
    },
    points: [
      {
        title: {
          fr: "Mobilier technique et professionnel",
          en: "Technical and professional furniture",
        },
        body: {
          fr: "Conception pour laboratoires, hôpitaux, bureaux et espaces collectifs.",
          en: "Designed for laboratories, hospitals, offices and shared spaces.",
        },
      },
      {
        title: {
          fr: "Fabrication spécialisée",
          en: "Specialized manufacturing",
        },
        body: {
          fr: "Composants métalliques précis pour divers secteurs, de l'aéronautique au médical.",
          en: "Precision metal components for a variety of sectors, from aerospace to medical.",
        },
      },
      {
        title: {
          fr: "Solutions architecturales et industrielles",
          en: "Architectural and industrial solutions",
        },
        body: {
          fr: "Structures métalliques complexes et finitions sur mesure.",
          en: "Complex metal structures and custom finishes.",
        },
      },
    ],
  },
  index: [
    {
      slug: "mobilier-hospitalier",
      title: { fr: "Mobilier hospitalier personnalisé", en: "Custom hospital furniture" },
      tagline: {
        fr: "Ergonomie, durabilité et hygiène pour le secteur médical.",
        en: "Ergonomics, durability and hygiene for the medical sector.",
      },
      hoverImage: { seed: "ecl-sol-hospitalier", alt: "Mobilier hospitalier en inox", grayscale: true },
    },
    {
      slug: "mobilier-laboratoire",
      title: { fr: "Mobilier de laboratoire et recherche", en: "Laboratory and research furniture" },
      tagline: {
        fr: "Plans de travail et structures pour environnements stériles.",
        en: "Worktops and structures for sterile environments.",
      },
      hoverImage: { seed: "ecl-sol-laboratoire", alt: "Mobilier de laboratoire", grayscale: true },
    },
    {
      slug: "mobilier-accueil",
      title: { fr: "Mobilier d'accueil et espaces communes", en: "Reception and common-area furniture" },
      tagline: {
        fr: "Comptoirs et assises pour les lieux à forte fréquentation.",
        en: "Counters and seating for high-traffic spaces.",
      },
      hoverImage: { seed: "ecl-sol-accueil", alt: "Banque d'accueil métallique", grayscale: true },
    },
    {
      slug: "prototypes",
      title: { fr: "Développement de prototypes", en: "Prototype development" },
      tagline: {
        fr: "Du concept à la pièce finie, prête pour la production.",
        en: "From concept to finished part, ready for production.",
      },
      hoverImage: { seed: "ecl-sol-prototypes", alt: "Prototype métallique", grayscale: true },
    },
    {
      slug: "composantes-architecturales",
      title: { fr: "Composantes architecturales", en: "Architectural components" },
      tagline: {
        fr: "Des éléments uniques qui s'intègrent à chaque projet.",
        en: "Unique elements that integrate seamlessly into every project.",
      },
      hoverImage: { seed: "ecl-sol-architecturales", alt: "Composante architecturale", grayscale: true },
    },
    {
      slug: "pieces-sur-mesure",
      title: { fr: "Pièces de mobilier sur mesure", en: "Custom furniture pieces" },
      tagline: {
        fr: "Pièces uniques ou en série, fabriquées selon vos plans.",
        en: "One-off or production pieces, manufactured to your specifications.",
      },
      hoverImage: { seed: "ecl-sol-pieces", alt: "Pièce de mobilier sur mesure", grayscale: true },
    },
  ],
  closing: {
    heading: {
      fr: "Nous sélectionnons les meilleurs alliages et procédés de fabrication pour garantir des produits adaptés aux normes industrielles.",
      en: "We select the finest alloys and manufacturing processes to deliver products that meet industrial standards.",
    },
  },
}

export const SOLUTION_DETAILS: SolutionDetail[] = [
  {
    slug: "mobilier-hospitalier",
    title: { fr: "Mobilier hospitalier personnalisé", en: "Custom hospital furniture" },
    metaDescription: {
      fr: "Mobilier hospitalier sur mesure à Québec — acier inoxydable médical, ergonomie et hygiène pour hôpitaux, cliniques et laboratoires.",
      en: "Custom hospital furniture in Québec — medical-grade stainless steel, ergonomics and hygiene for hospitals, clinics and laboratories.",
    },
    hero: {
      heading: { fr: "Mobilier hospitalier personnalisé", en: "Custom hospital furniture" },
      intro: {
        fr: "Nous concevons et fabriquons du mobilier hospitalier sur mesure, alliant ergonomie, durabilité et hygiène. Grâce à notre maîtrise des matériaux comme l'acier et l'acier inoxydable, nous proposons des solutions adaptées aux exigences strictes du secteur médical — des établissements de santé aux cliniques et laboratoires.",
        en: "We design and manufacture custom hospital furniture that combines ergonomics, durability and hygiene. Drawing on our command of materials such as steel and stainless steel, we deliver solutions built for the strict requirements of the medical sector — from healthcare facilities to clinics and laboratories.",
      },
      image: { seed: "ecl-sol-hospitalier-hero", alt: "Mobilier hospitalier en inox", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: {
          fr: "Une expertise adaptée aux environnements médicaux exigeants",
          en: "Expertise suited to demanding medical environments",
        },
        paragraphs: [
          {
            fr: "Chez E.C. Lemelin, nous fabriquons des équipements métalliques sur mesure pour les hôpitaux, cliniques, laboratoires et centres de soins. Nos solutions sont conçues pour faciliter l'asepsie, optimiser l'espace et améliorer la durabilité des infrastructures hospitalières.",
            en: "At E.C. Lemelin, we manufacture custom metal equipment for hospitals, clinics, laboratories and care centres. Our solutions are designed to support asepsis, optimize space and enhance the durability of hospital infrastructure.",
          },
          {
            fr: "Mobilier en acier inoxydable pour une hygiène irréprochable, solutions ergonomiques adaptées aux environnements stériles, fabrication sur mesure pour répondre aux besoins spécifiques des établissements de santé.",
            en: "Stainless steel furniture for impeccable hygiene, ergonomic solutions suited to sterile environments, and custom manufacturing that meets the specific needs of healthcare facilities.",
          },
        ],
      },
      {
        kind: "list",
        heading: {
          fr: "Conception avancée et matériaux haute performance",
          en: "Advanced design and high-performance materials",
        },
        intro: {
          fr: "Nous allions technologie de pointe et savoir-faire pour garantir des équipements à la hauteur des exigences du secteur médical.",
          en: "We combine cutting-edge technology and craftsmanship to deliver equipment that meets the demands of the medical sector.",
        },
        items: [
          {
            title: { fr: "Acier inoxydable médical", en: "Medical-grade stainless steel" },
            body: { fr: "Résistance à la corrosion et nettoyage simplifié.", en: "Corrosion resistance and simplified cleaning." },
          },
          {
            title: { fr: "Design ergonomique", en: "Ergonomic design" },
            body: { fr: "Optimisation des espaces et facilité d'utilisation.", en: "Space optimization and ease of use." },
          },
          {
            title: { fr: "Fabrication de précision", en: "Precision manufacturing" },
            body: { fr: "Technologies de découpe laser et robotisation.", en: "Laser cutting and robotic technologies." },
          },
        ],
      },
      {
        kind: "list",
        heading: {
          fr: "Des solutions adaptées à chaque environnement",
          en: "Solutions tailored to every environment",
        },
        items: [
          {
            title: { fr: "Mobilier de laboratoire", en: "Laboratory furniture" },
            body: {
              fr: "Plans de travail, armoires et structures adaptés aux environnements stériles.",
              en: "Worktops, cabinets and structures suited to sterile environments.",
            },
          },
          {
            title: { fr: "Portes et structures métalliques", en: "Metal doors and structures" },
            body: {
              fr: "Solutions renforcées pour une durabilité accrue dans les hôpitaux.",
              en: "Reinforced solutions for greater durability in hospitals.",
            },
          },
          {
            title: { fr: "Équipements sur mesure", en: "Custom equipment" },
            body: {
              fr: "Adaptation à des besoins spécifiques comme les blocs opératoires et les unités de soins intensifs.",
              en: "Adapted to specific needs such as operating rooms and intensive care units.",
            },
          },
        ],
      },
      {
        kind: "gallery",
        heading: { fr: "Quelques réalisations", en: "Selected projects" },
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
    title: { fr: "Mobilier de laboratoire et recherche", en: "Laboratory and research furniture" },
    metaDescription: {
      fr: "Mobilier de laboratoire sur mesure à Québec — plans de travail, armoires et structures résistants pour environnements de recherche et stériles.",
      en: "Custom laboratory furniture in Québec — durable worktops, cabinets and structures for research and sterile environments.",
    },
    hero: {
      heading: { fr: "Mobilier de laboratoire et recherche", en: "Laboratory and research furniture" },
      intro: {
        fr: "Nous concevons des plans de travail, armoires et structures métalliques adaptés aux environnements de laboratoire et de recherche. Résistance chimique, hygiène et précision dimensionnelle guident chacune de nos réalisations.",
        en: "We design worktops, cabinets and metal structures suited to laboratory and research environments. Chemical resistance, hygiene and dimensional precision guide every project we deliver.",
      },
      image: { seed: "ecl-sol-laboratoire-hero", alt: "Mobilier de laboratoire", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: {
          fr: "Des espaces de recherche pensés pour la rigueur",
          en: "Research spaces built for rigour",
        },
        paragraphs: [
          {
            fr: "Les laboratoires imposent des contraintes uniques : résistance aux agents chimiques, facilité de décontamination et précision des aménagements. Notre maîtrise de l'acier inoxydable et des structures métalliques nous permet d'y répondre avec exactitude.",
            en: "Laboratories impose unique constraints: resistance to chemical agents, ease of decontamination and precise layouts. Our command of stainless steel and metal structures lets us meet them with accuracy.",
          },
          {
            fr: "Chaque poste est conçu pour durer et pour s'intégrer aux protocoles les plus exigeants.",
            en: "Every workstation is designed to last and to fit the most demanding protocols.",
          },
        ],
      },
      {
        kind: "list",
        heading: {
          fr: "Des aménagements à la hauteur de vos protocoles",
          en: "Fittings that measure up to your protocols",
        },
        items: [
          {
            title: { fr: "Plans de travail résistants", en: "Durable worktops" },
            body: { fr: "Surfaces hygiéniques et faciles à entretenir.", en: "Hygienic surfaces that are easy to maintain." },
          },
          {
            title: { fr: "Armoires et rangements", en: "Cabinets and storage" },
            body: { fr: "Solutions sécurisées pour instruments et réactifs.", en: "Secure solutions for instruments and reagents." },
          },
          {
            title: { fr: "Structures sur mesure", en: "Custom structures" },
            body: {
              fr: "Adaptées aux équipements spécialisés et aux contraintes d'espace.",
              en: "Adapted to specialized equipment and space constraints.",
            },
          },
        ],
      },
      {
        kind: "gallery",
        heading: { fr: "Quelques réalisations", en: "Selected projects" },
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
    title: { fr: "Mobilier d'accueil et espaces communes", en: "Reception and common-area furniture" },
    metaDescription: {
      fr: "Mobilier d'accueil sur mesure à Québec — comptoirs, assises et cloisons métalliques pour halls, espaces collaboratifs et lieux à forte fréquentation.",
      en: "Custom reception furniture in Québec — metal counters, seating and partitions for lobbies, collaborative spaces and high-traffic areas.",
    },
    hero: {
      heading: { fr: "Mobilier d'accueil et espaces communes", en: "Reception and common-area furniture" },
      intro: {
        fr: "Nous concevons et fabriquons du mobilier d'accueil et d'espaces communs sur mesure, alliant esthétique, confort et durabilité. Grâce à notre expertise en transformation des matériaux, nous créons des solutions adaptées aux environnements à forte fréquentation, garantissant ergonomie, résistance et intégration harmonieuse à votre espace.",
        en: "We design and manufacture custom reception and common-area furniture that combines aesthetics, comfort and durability. With our expertise in metal fabrication, we create solutions suited to high-traffic environments, ensuring ergonomics, resilience and seamless integration into your space.",
      },
      image: { seed: "ecl-sol-accueil-hero", alt: "Banque d'accueil métallique", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: {
          fr: "Un mobilier conçu pour sublimer et structurer les espaces",
          en: "Furniture designed to elevate and structure spaces",
        },
        paragraphs: [
          {
            fr: "Chez E.C. Lemelin, nous fabriquons du mobilier métallique adapté aux halls d'accueil, espaces collaboratifs et zones de passage. Matériaux résistants — acier inoxydable, aluminium et structures métalliques robustes —, design épuré et fonctionnel, personnalisation avancée selon vos besoins.",
            en: "At E.C. Lemelin, we manufacture metal furniture suited to reception lobbies, collaborative spaces and circulation areas. Durable materials — stainless steel, aluminum and robust metal structures — clean, functional design, and extensive customization to your needs.",
          },
          {
            fr: "Une intégration parfaite dans les espaces contemporains, pensée pour durer.",
            en: "A perfect fit for contemporary spaces, built to last.",
          },
        ],
      },
      {
        kind: "list",
        heading: {
          fr: "Des équipements pensés pour l'usage intensif et le confort",
          en: "Equipment designed for intensive use and comfort",
        },
        items: [
          {
            title: { fr: "Banques d'accueil et comptoirs", en: "Reception desks and counters" },
            body: { fr: "Conçus pour l'ergonomie et la durabilité.", en: "Designed for ergonomics and durability." },
          },
          {
            title: { fr: "Assises et bancs métalliques", en: "Metal seating and benches" },
            body: { fr: "Résistants aux usages intensifs et faciles d'entretien.", en: "Resistant to heavy use and easy to maintain." },
          },
          {
            title: { fr: "Cloisons et séparateurs modulaires", en: "Modular partitions and dividers" },
            body: { fr: "Optimisation des espaces ouverts.", en: "Optimizing open-plan spaces." },
          },
        ],
      },
      {
        kind: "list",
        heading: {
          fr: "Des standards élevés pour des espaces qui durent",
          en: "High standards for spaces that last",
        },
        intro: {
          fr: "Les espaces à forte fréquentation nécessitent des matériaux durables et faciles à entretenir.",
          en: "High-traffic spaces call for durable materials that are easy to maintain.",
        },
        items: [
          {
            title: { fr: "Matériaux haute durabilité", en: "High-durability materials" },
            body: { fr: "Pour une utilisation prolongée.", en: "For extended use." },
          },
          {
            title: { fr: "Design ergonomique", en: "Ergonomic design" },
            body: { fr: "Pensé pour le bien-être des utilisateurs.", en: "Designed for user well-being." },
          },
          {
            title: { fr: "Finitions soignées", en: "Refined finishes" },
            body: { fr: "Pour un environnement accueillant et facile d'entretien.", en: "For a welcoming, low-maintenance environment." },
          },
        ],
      },
      {
        kind: "gallery",
        heading: { fr: "Quelques réalisations", en: "Selected projects" },
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
    title: { fr: "Développement de prototypes", en: "Prototype development" },
    metaDescription: {
      fr: "Développement de prototypes métalliques à Québec — du concept à la pièce finie, prête pour la validation et la production en série.",
      en: "Metal prototype development in Québec — from concept to finished part, ready for validation and series production.",
    },
    hero: {
      heading: { fr: "Développement de prototypes", en: "Prototype development" },
      intro: {
        fr: "Du concept à la pièce finie, nous accompagnons le développement de prototypes pour divers projets. Notre équipe technique transforme vos idées en composants métalliques fonctionnels, prêts pour la validation et la production en série.",
        en: "From concept to finished part, we support prototype development across a range of projects. Our technical team turns your ideas into functional metal components, ready for validation and series production.",
      },
      image: { seed: "ecl-sol-prototypes-hero", alt: "Prototype métallique en atelier", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: {
          fr: "Transformer une idée en pièce fonctionnelle",
          en: "Turning an idea into a functional part",
        },
        paragraphs: [
          {
            fr: "Le prototypage exige rapidité, précision et dialogue constant. Grâce à la conception assistée par ordinateur et à nos équipements de pointe, nous itérons vite pour valider la forme, l'ajustement et la fonction avant la mise en production.",
            en: "Prototyping calls for speed, precision and constant dialogue. With computer-aided design and our advanced equipment, we iterate quickly to validate form, fit and function before production.",
          },
          {
            fr: "Chaque prototype est une étape vers un produit fiable et reproductible.",
            en: "Each prototype is a step toward a reliable, reproducible product.",
          },
        ],
      },
      {
        kind: "list",
        heading: { fr: "Un accompagnement de bout en bout", en: "End-to-end support" },
        items: [
          {
            title: { fr: "Conception et modélisation (CAO)", en: "Design and modelling (CAD)" },
            body: { fr: "Validation de la géométrie et des tolérances en amont.", en: "Upfront validation of geometry and tolerances." },
          },
          {
            title: { fr: "Fabrication rapide", en: "Rapid fabrication" },
            body: { fr: "Découpe laser, pliage et soudure pour des itérations courtes.", en: "Laser cutting, bending and welding for fast iterations." },
          },
          {
            title: { fr: "Mise en production", en: "Production ramp-up" },
            body: { fr: "Transition fluide du prototype vers la série.", en: "A smooth transition from prototype to series." },
          },
        ],
      },
      {
        kind: "gallery",
        heading: { fr: "Quelques réalisations", en: "Selected projects" },
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
    title: { fr: "Composantes architecturales", en: "Architectural components" },
    metaDescription: {
      fr: "Composantes architecturales sur mesure à Québec — design, robustesse et précision pour des éléments uniques intégrés à chaque projet.",
      en: "Custom architectural components in Québec — design, strength and precision for unique elements integrated into every project.",
    },
    hero: {
      heading: { fr: "Composantes architecturales", en: "Architectural components" },
      intro: {
        fr: "Nous concevons et fabriquons des composantes architecturales sur mesure, alliant design, robustesse et précision. Grâce à notre expertise en transformation des matériaux, nous créons des éléments uniques qui s'intègrent harmonieusement à chaque projet, qu'il s'agisse d'aménagements intérieurs ou de structures extérieures.",
        en: "We design and manufacture custom architectural components that combine design, strength and precision. With our expertise in metal fabrication, we create unique elements that integrate seamlessly into every project, whether interior fit-outs or exterior structures.",
      },
      image: { seed: "ecl-sol-architecturales-hero", alt: "Composante architecturale en métal", grayscale: true },
    },
    blocks: [
      {
        kind: "feature",
        heading: {
          fr: "Technologie et précision au service de l'excellence",
          en: "Technology and precision in service of excellence",
        },
        intro: {
          fr: "Nos solutions sont conçues pour répondre aux exigences esthétiques et techniques des architectes et designers les plus exigeants.",
          en: "Our solutions are designed to meet the aesthetic and technical demands of the most exacting architects and designers.",
        },
        image: { seed: "ecl-sol-architecturales-feature", alt: "Détail architectural en métal", grayscale: true },
        points: [
          {
            title: { fr: "Bâtiments publics et espaces commerciaux", en: "Public buildings and commercial spaces" },
            body: { fr: "Des composantes qui structurent et subliment les lieux.", en: "Components that structure and elevate a space." },
          },
          {
            title: { fr: "Aménagements intérieurs", en: "Interior fit-outs" },
            body: { fr: "Éléments uniques intégrés à chaque projet.", en: "Unique elements integrated into every project." },
          },
          {
            title: { fr: "Structures extérieures", en: "Exterior structures" },
            body: { fr: "Revêtements, garde-corps et façades durables.", en: "Durable cladding, guardrails and façades." },
          },
        ],
      },
      {
        kind: "prose",
        heading: {
          fr: "Des structures sur mesure pour l'architecture moderne",
          en: "Custom structures for modern architecture",
        },
        paragraphs: [
          {
            fr: "Nous concevons et fabriquons des composantes métalliques sur mesure, alliant design, robustesse et précision, pour des concepts à la hauteur des attentes les plus élevées.",
            en: "We design and manufacture custom metal components that combine design, strength and precision, for concepts that live up to the highest expectations.",
          },
          {
            fr: "Ingénierie et savoir-faire se rencontrent pour donner vie à des éléments durables, esthétiques et parfaitement intégrés.",
            en: "Engineering and craftsmanship come together to bring to life elements that are durable, refined and perfectly integrated.",
          },
        ],
      },
      {
        kind: "gallery",
        heading: { fr: "Quelques réalisations", en: "Selected projects" },
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
    title: { fr: "Pièces de mobilier sur mesure", en: "Custom furniture pieces" },
    metaDescription: {
      fr: "Pièces de mobilier métallique sur mesure à Québec — pièces uniques ou en série, fabriquées selon vos plans avec des finitions soignées.",
      en: "Custom metal furniture pieces in Québec — one-off or production pieces, manufactured to your specifications with refined finishes.",
    },
    hero: {
      heading: { fr: "Pièces de mobilier sur mesure", en: "Custom furniture pieces" },
      intro: {
        fr: "Pièces uniques ou en petites séries, nos composants de mobilier sur mesure sont fabriqués selon vos plans ou développés avec notre équipe. Précision, finitions soignées et matériaux durables pour des réalisations qui traversent le temps.",
        en: "One-off pieces or small production runs, our custom furniture components are manufactured to your drawings or developed with our team. Precision, refined finishes and durable materials for work that stands the test of time.",
      },
      image: { seed: "ecl-sol-pieces-hero", alt: "Pièce de mobilier sur mesure", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: { fr: "Le sur-mesure, jusque dans le détail", en: "Custom-made, down to the detail" },
        paragraphs: [
          {
            fr: "Qu'il s'agisse d'une pièce signature ou d'une série limitée, nous donnons forme au métal selon vos plans ou en co-conception avec notre équipe. Chaque détail compte, de l'assemblage à la finition.",
            en: "Whether a signature piece or a limited series, we shape metal to your drawings or in co-design with our team. Every detail counts, from assembly to finish.",
          },
          {
            fr: "Le résultat : des pièces robustes, esthétiques et parfaitement adaptées à leur usage.",
            en: "The result: pieces that are robust, refined and perfectly suited to their purpose.",
          },
        ],
      },
      {
        kind: "list",
        heading: { fr: "Un savoir-faire complet", en: "Complete craftsmanship" },
        items: [
          {
            title: { fr: "Conception assistée", en: "Computer-aided design" },
            body: { fr: "Du plan à la pièce, avec validation des tolérances.", en: "From drawing to part, with tolerance validation." },
          },
          {
            title: { fr: "Finitions variées", en: "A range of finishes" },
            body: { fr: "Poli, brossé, peint ou plaqué selon le projet.", en: "Polished, brushed, painted or plated to suit the project." },
          },
          {
            title: { fr: "Matériaux durables", en: "Durable materials" },
            body: { fr: "Inox, acier, aluminium, laiton et cuivre.", en: "Stainless steel, steel, aluminum, brass and copper." },
          },
        ],
      },
      {
        kind: "gallery",
        heading: { fr: "Quelques réalisations", en: "Selected projects" },
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
