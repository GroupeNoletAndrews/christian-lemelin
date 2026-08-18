import type { MaterialDetail } from "./types"

// Source unique des matériaux (ordre Inox → Acier → Aluminium → Laiton →
// Cuivre, demandé par le client). Consommé par le carousel/modal du home
// (Materiaux.tsx) — il n'y a plus de pages de détail /materiaux/[slug]. Copie
// tirée des PDF
// « Acier » et « Acier inox » ; aluminium/laiton/cuivre synthétisés à partir
// des blurbs de « Fab sur mesure » (hasSourceCopy:false → à relire).
// Texte bilingue FR/EN ({ fr, en }) résolu via tr(x, locale) au rendu.

export const MATERIALS: MaterialDetail[] = [
  {
    slug: "acier-inoxydable",
    code: "316L",
    grades: ["316", "304-4", "304-8"],
    name: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortName: { fr: "Inox", en: "Stainless" },
    fullName: { fr: "Inox 304 / 316L", en: "304 / 316L stainless" },
    metaDescription: {
      fr: "Transformation de l'acier inoxydable sur mesure à Québec — hygiène, résistance à la corrosion et longévité pour le médical, l'agroalimentaire et l'architecture.",
      en: "Custom stainless steel fabrication in Québec — hygiene, corrosion resistance and longevity for the medical, food-processing and architectural sectors.",
    },
    blurb: {
      fr: "Une solidité éprouvée, une résistance à toute épreuve. Idéal pour les environnements exigeants, l'inox offre une protection maximale contre la corrosion et l'usure.",
      en: "Proven strength, uncompromising resistance. Ideal for demanding environments, stainless steel offers maximum protection against corrosion and wear.",
    },
    properties: [
      { fr: "Résistant à la corrosion", en: "Corrosion-resistant" },
      { fr: "Hygiénique & alimentaire", en: "Hygienic & food-safe" },
      { fr: "Haute durabilité", en: "High durability" },
    ],
    cardImage: { seed: "ecl-inox-card-mirror", alt: "Surface d'acier inoxydable poli" },
    hero: {
      heading: { fr: "Acier inoxydable", en: "Stainless steel" },
      intro: {
        fr: "Chez E.C. Lemelin, nous exploitons les propriétés exceptionnelles de l'acier inoxydable pour concevoir des solutions résistantes et durables. Reconnu pour sa robustesse et sa résistance à la corrosion, ce matériau est idéal pour les secteurs exigeant hygiène, solidité et longévité.",
        en: "At E.C. Lemelin, we harness the exceptional properties of stainless steel to engineer resistant, long-lasting solutions. Renowned for its strength and corrosion resistance, this material is ideal for sectors that demand hygiene, robustness and longevity.",
      },
      image: { seed: "ecl-inox-hero-kitchen", alt: "Atelier d'acier inoxydable", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: {
          fr: "L'acier inoxydable au cœur des environnements exigeants",
          en: "Stainless steel at the heart of demanding environments",
        },
        paragraphs: [
          {
            fr: "Notre maîtrise de la transformation de l'acier inoxydable nous permet de répondre aux exigences des industries pharmaceutiques, agroalimentaires et architecturales. Que ce soit pour du mobilier sur mesure, des composants industriels ou des équipements spécialisés, nous assurons une finition impeccable et une conception adaptée aux normes les plus strictes.",
            en: "Our mastery of stainless steel fabrication lets us meet the requirements of the pharmaceutical, food-processing and architectural industries. Whether for custom furnishings, industrial components or specialized equipment, we deliver a flawless finish and a design that meets the most stringent standards.",
          },
          {
            fr: "Notre savoir-faire garantit des réalisations à la fois fonctionnelles, esthétiques et conçues pour durer.",
            en: "Our expertise guarantees work that is functional, refined and built to last.",
          },
        ],
      },
      {
        kind: "list",
        heading: { fr: "Pourquoi choisir l'acier inoxydable ?", en: "Why choose stainless steel?" },
        items: [
          {
            title: { fr: "Résistance à la corrosion", en: "Corrosion resistance" },
            body: { fr: "Idéal pour les environnements exigeants et humides.", en: "Ideal for demanding, high-humidity environments." },
          },
          {
            title: { fr: "Hygiène irréprochable", en: "Impeccable hygiene" },
            body: { fr: "Facile à nettoyer, privilégié dans le secteur médical et alimentaire.", en: "Easy to clean, the material of choice in the medical and food sectors." },
          },
          {
            title: { fr: "Durabilité accrue", en: "Enhanced durability" },
            body: { fr: "Excellente résistance aux agressions chimiques et mécaniques.", en: "Excellent resistance to chemical and mechanical stress." },
          },
          {
            title: { fr: "Finitions esthétiques et modernes", en: "Sleek, modern finishes" },
            body: { fr: "Apporte une touche élégante et professionnelle aux réalisations.", en: "Adds an elegant, professional touch to every project." },
          },
        ],
      },
      {
        kind: "gallery",
        heading: { fr: "Quelques réalisations — acier inoxydable", en: "Selected projects — stainless steel" },
        images: [
          { seed: "ecl-inox-real-1", alt: "Mobilier sanitaire en inox" },
          { seed: "ecl-inox-real-2", alt: "Comptoir inox sur mesure" },
          { seed: "ecl-inox-real-3", alt: "Hotte et surfaces hygiéniques" },
          { seed: "ecl-inox-real-4", alt: "Équipement de laboratoire en inox" },
        ],
      },
      {
        kind: "feature",
        heading: { fr: "Performance, hygiène et longévité", en: "Performance, hygiene and longevity" },
        intro: {
          fr: "L'acier inoxydable allie résistance à la corrosion, hygiène et design moderne — le choix idéal pour de nombreux secteurs exigeants.",
          en: "Stainless steel combines corrosion resistance, hygiene and modern design — the ideal choice for many demanding sectors.",
        },
        image: { seed: "ecl-inox-feature-plate", alt: "Plaques d'acier inoxydable empilées", grayscale: true },
        points: [
          {
            title: { fr: "Mobilier et équipements sanitaires", en: "Sanitary furniture and equipment" },
            body: { fr: "Tables de travail, éviers, hottes et surfaces hygiéniques.", en: "Work tables, sinks, hoods and hygienic surfaces." },
          },
          {
            title: { fr: "Aménagements hospitaliers et pharmaceutiques", en: "Hospital and pharmaceutical fittings" },
            body: { fr: "Postes de soins, armoires hermétiques et supports stériles.", en: "Care stations, sealed cabinets and sterile supports." },
          },
          {
            title: { fr: "Composants architecturaux et industriels", en: "Architectural and industrial components" },
            body: { fr: "Revêtements, garde-corps et structures modernes.", en: "Cladding, guardrails and modern structures." },
          },
          {
            title: { fr: "Supports et fixations anticorrosion", en: "Corrosion-resistant supports and fixings" },
            body: { fr: "Poutres, charpentes et pièces mécanosoudées en inox.", en: "Beams, frameworks and welded stainless steel assemblies." },
          },
        ],
      },
    ],
    relatedSolutions: ["mobilier-hospitalier", "mobilier-laboratoire", "composantes-architecturales"],
    hasSourceCopy: true,
  },

  {
    slug: "acier",
    code: "A36",
    grades: ["A1008", "A1010", "A1011"],
    name: { fr: "Acier", en: "Steel" },
    shortName: { fr: "Acier", en: "Steel" },
    fullName: { fr: "Acier structurel A36", en: "A36 structural steel" },
    metaDescription: {
      fr: "Transformation de l'acier sur mesure à Québec — découpe, pliage et assemblage de haute précision pour structures industrielles, commerciales et institutionnelles.",
      en: "Custom steel fabrication in Québec — high-precision cutting, bending and assembly for industrial, commercial and institutional structures.",
    },
    blurb: {
      fr: "Un matériau robuste pour des solutions sur mesure. L'acier est la base de nombreuses réalisations industrielles et architecturales, alliant résistance, précision et durabilité.",
      en: "A robust material for custom solutions. Steel is the foundation of countless industrial and architectural projects, combining strength, precision and durability.",
    },
    properties: [
      { fr: "Haute résistance", en: "High strength" },
      { fr: "Soudable partout", en: "Weldable throughout" },
      { fr: "Économique", en: "Cost-effective" },
    ],
    cardImage: { seed: "ecl-acier-card-plate", alt: "Plaque d'acier structurel" },
    hero: {
      heading: { fr: "Acier", en: "Steel" },
      intro: {
        fr: "Chez E.C. Lemelin, l'acier est au cœur de notre savoir-faire. Matériau robuste et polyvalent, il nous permet de concevoir des structures métalliques sur mesure adaptées aux besoins des secteurs industriel, commercial et institutionnel. Grâce à des procédés de découpe, de pliage et d'assemblage de haute précision, nous garantissons des solutions durables et performantes.",
        en: "At E.C. Lemelin, steel is at the core of our craft. Robust and versatile, it lets us engineer custom metal structures tailored to the needs of the industrial, commercial and institutional sectors. Through high-precision cutting, bending and assembly processes, we deliver durable, high-performance solutions.",
      },
      image: { seed: "ecl-acier-hero-shop", alt: "Atelier de transformation de l'acier", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: {
          fr: "Un savoir-faire de précision pour des réalisations sur mesure",
          en: "Precision craftsmanship for custom projects",
        },
        paragraphs: [
          {
            fr: "Notre expertise en transformation de l'acier repose sur des techniques avancées qui assurent une finition impeccable et une résistance optimale. Que ce soit pour des équipements sur mesure, des composantes architecturales ou des infrastructures industrielles, nous maîtrisons chaque étape du processus.",
            en: "Our steel-fabrication expertise draws on advanced techniques that ensure a flawless finish and optimal strength. Whether for custom equipment, architectural components or industrial infrastructure, we master every step of the process.",
          },
          {
            fr: "Nous répondons ainsi aux exigences les plus strictes en termes de qualité et de fiabilité.",
            en: "This lets us meet the most stringent quality and reliability requirements.",
          },
        ],
      },
      {
        kind: "list",
        heading: { fr: "L'acier, un matériau de choix", en: "Steel, a material of choice" },
        items: [
          {
            title: { fr: "Robustesse inégalée", en: "Unmatched robustness" },
            body: { fr: "Résiste aux charges lourdes et aux contraintes mécaniques.", en: "Withstands heavy loads and mechanical stress." },
          },
          {
            title: { fr: "Durabilité accrue", en: "Enhanced durability" },
            body: { fr: "Excellente longévité, même dans des environnements exigeants.", en: "Excellent longevity, even in demanding environments." },
          },
          {
            title: { fr: "Polyvalence d'application", en: "Versatile applications" },
            body: { fr: "Adapté aux structures, équipements industriels et éléments architecturaux.", en: "Suited to structures, industrial equipment and architectural elements." },
          },
          {
            title: { fr: "Personnalisation et finitions variées", en: "Customization and varied finishes" },
            body: { fr: "Acier peint ou plaqué selon les besoins.", en: "Painted or plated steel to suit your needs." },
          },
        ],
      },
      {
        kind: "gallery",
        heading: { fr: "Quelques réalisations — acier", en: "Selected projects — steel" },
        images: [
          { seed: "ecl-acier-real-1", alt: "Structure métallique en acier" },
          { seed: "ecl-acier-real-2", alt: "Escalier en acier" },
          { seed: "ecl-acier-real-3", alt: "Passerelle industrielle" },
          { seed: "ecl-acier-real-4", alt: "Support et profilés en acier" },
        ],
      },
      {
        kind: "feature",
        heading: {
          fr: "Des composants en acier conçus pour la performance et la durabilité",
          en: "Steel components engineered for performance and durability",
        },
        intro: {
          fr: "Nos réalisations en acier s'adaptent aux exigences techniques et esthétiques des industries les plus rigoureuses.",
          en: "Our steel work adapts to the technical and aesthetic demands of the most rigorous industries.",
        },
        image: { seed: "ecl-acier-feature-blue", alt: "Plaques d'acier", grayscale: true },
        points: [
          {
            title: { fr: "Structures métalliques robustes", en: "Robust metal structures" },
            body: { fr: "Constructions industrielles, escaliers, passerelles et supports.", en: "Industrial builds, stairs, walkways and supports." },
          },
          {
            title: { fr: "Éléments mécano-soudés", en: "Welded assemblies" },
            body: { fr: "Assemblages résistants aux fortes contraintes.", en: "Assemblies built to withstand heavy stress." },
          },
          {
            title: { fr: "Composants architecturaux", en: "Architectural components" },
            body: { fr: "Revêtements métalliques, garde-corps et façades modernes.", en: "Metal cladding, guardrails and modern façades." },
          },
          {
            title: { fr: "Supports et fixations", en: "Supports and fixings" },
            body: { fr: "Poutres, cornières et profilés adaptés aux structures complexes.", en: "Beams, angles and profiles suited to complex structures." },
          },
        ],
      },
    ],
    relatedSolutions: ["composantes-architecturales", "pieces-sur-mesure", "prototypes"],
    hasSourceCopy: true,
  },

  {
    slug: "aluminium",
    code: "6061",
    grades: ["3003", "5052", "6061"],
    name: { fr: "Aluminium", en: "Aluminium" },
    shortName: { fr: "Aluminium", en: "Aluminium" },
    fullName: { fr: "Aluminium série 6000", en: "6000-series aluminium" },
    metaDescription: {
      fr: "Transformation de l'aluminium sur mesure à Québec — légèreté, résistance à la corrosion et précision pour l'architecture, l'aéronautique et l'industrie.",
      en: "Custom aluminium fabrication in Québec — lightness, corrosion resistance and precision for architecture, aerospace and industry.",
    },
    blurb: {
      fr: "Léger, polyvalent et conçu pour la performance. Reconnu pour sa légèreté et sa résistance naturelle à la corrosion, idéal pour les structures performantes et esthétiques.",
      en: "Lightweight, versatile and engineered for performance. Renowned for its lightness and natural corrosion resistance, ideal for high-performance, refined structures.",
    },
    properties: [
      { fr: "Léger", en: "Lightweight" },
      { fr: "Anti-corrosion naturel", en: "Naturally corrosion-resistant" },
      { fr: "Usinable", en: "Machinable" },
    ],
    cardImage: { seed: "ecl-alu-card-profile", alt: "Profilé d'aluminium brossé" },
    hero: {
      heading: { fr: "Aluminium", en: "Aluminium" },
      intro: {
        fr: "L'aluminium est reconnu pour sa légèreté et sa résistance à la corrosion. Chez E.C. Lemelin, nous l'utilisons pour créer des solutions sur mesure adaptées aux secteurs exigeant des structures performantes, précises et esthétiques — de l'architecture à l'aéronautique en passant par l'industrie.",
        en: "Aluminium is prized for its lightness and corrosion resistance. At E.C. Lemelin, we use it to create custom solutions for sectors that demand high-performance, precise and refined structures — from architecture to aerospace and industry.",
      },
      image: { seed: "ecl-alu-hero-extrusion", alt: "Profilés d'aluminium en atelier", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: { fr: "Léger en apparence, exigeant en réalité", en: "Light in appearance, demanding in practice" },
        paragraphs: [
          {
            fr: "Travailler l'aluminium demande une maîtrise particulière de la découpe, du pliage et de la soudure. Notre équipe technique exploite ses propriétés uniques pour livrer des pièces à la fois légères, résistantes et impeccablement finies.",
            en: "Working with aluminium calls for particular mastery of cutting, bending and welding. Our technical team harnesses its unique properties to deliver parts that are light, strong and impeccably finished.",
          },
          {
            fr: "Le résultat : des solutions performantes qui répondent aux besoins spécifiques de chaque projet.",
            en: "The result: high-performance solutions tailored to the specific needs of each project.",
          },
        ],
      },
      {
        kind: "list",
        heading: { fr: "Pourquoi choisir l'aluminium ?", en: "Why choose aluminium?" },
        items: [
          {
            title: { fr: "Légèreté", en: "Lightness" },
            body: { fr: "Un rapport résistance/poids idéal pour les structures mobiles ou suspendues.", en: "An ideal strength-to-weight ratio for mobile or suspended structures." },
          },
          {
            title: { fr: "Résistance naturelle à la corrosion", en: "Natural corrosion resistance" },
            body: { fr: "Sans traitement lourd, même en milieu humide.", en: "No heavy treatment required, even in humid conditions." },
          },
          {
            title: { fr: "Usinabilité", en: "Machinability" },
            body: { fr: "Se découpe, se plie et s'assemble avec une grande précision.", en: "Cuts, bends and assembles with great precision." },
          },
          {
            title: { fr: "Esthétique moderne", en: "Modern aesthetic" },
            body: { fr: "Finitions brossées, anodisées ou peintes selon le projet.", en: "Brushed, anodized or painted finishes to suit the project." },
          },
        ],
      },
      {
        kind: "gallery",
        heading: { fr: "Quelques réalisations — aluminium", en: "Selected projects — aluminium" },
        images: [
          { seed: "ecl-alu-real-1", alt: "Structure légère en aluminium" },
          { seed: "ecl-alu-real-2", alt: "Façade en aluminium" },
          { seed: "ecl-alu-real-3", alt: "Composant aéronautique usiné" },
          { seed: "ecl-alu-real-4", alt: "Mobilier en aluminium" },
        ],
      },
    ],
    relatedSolutions: ["composantes-architecturales", "prototypes", "pieces-sur-mesure"],
    hasSourceCopy: false,
  },

  {
    slug: "laiton",
    code: "C360",
    grades: ["280", "385"],
    name: { fr: "Laiton", en: "Brass" },
    shortName: { fr: "Laiton", en: "Brass" },
    fullName: { fr: "Laiton & bronze", en: "Brass & bronze" },
    metaDescription: {
      fr: "Transformation du laiton sur mesure à Québec — un alliage raffiné et esthétique pour les applications décoratives, architecturales et techniques.",
      en: "Custom brass fabrication in Québec — a refined, elegant alloy for decorative, architectural and technical applications.",
    },
    blurb: {
      fr: "Un alliage raffiné pour des applications spécifiques. Matériau esthétique et performant, apprécié pour ses teintes chaudes et ses propriétés anticorrosion.",
      en: "A refined alloy for specialized applications. An elegant, high-performance material prized for its warm tones and corrosion-resistant properties.",
    },
    properties: [
      { fr: "Teintes chaudes", en: "Warm tones" },
      { fr: "Décoratif", en: "Decorative" },
      { fr: "Finition premium", en: "Premium finish" },
    ],
    cardImage: { seed: "ecl-laiton-card-interior", alt: "Détail décoratif en laiton" },
    hero: {
      heading: { fr: "Laiton", en: "Brass" },
      intro: {
        fr: "Le laiton est un matériau esthétique et performant, apprécié pour ses propriétés anticorrosion et conductrices. Chez E.C. Lemelin, nous l'utilisons pour fabriquer des composants de précision adaptés aux industries technologiques, architecturales et décoratives.",
        en: "Brass is an elegant, high-performance material valued for its corrosion-resistant and conductive properties. At E.C. Lemelin, we use it to fabricate precision components for the technology, architectural and decorative industries.",
      },
      image: { seed: "ecl-laiton-hero-bar", alt: "Bar en laiton", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: { fr: "La chaleur du laiton, la précision de l'atelier", en: "The warmth of brass, the precision of the workshop" },
        paragraphs: [
          {
            fr: "Apprécié pour ses teintes chaudes et son caractère noble, le laiton demande une finition soignée pour révéler tout son potentiel. Nous le travaillons avec soin pour des réalisations décoratives et techniques d'exception.",
            en: "Prized for its warm tones and noble character, brass requires careful finishing to reveal its full potential. We work it with care for exceptional decorative and technical projects.",
          },
          {
            fr: "De la pièce unique au composant de série, chaque finition est exécutée selon les standards les plus exigeants.",
            en: "From one-off pieces to production components, every finish is executed to the most demanding standards.",
          },
        ],
      },
      {
        kind: "list",
        heading: { fr: "Pourquoi choisir le laiton ?", en: "Why choose brass?" },
        items: [
          {
            title: { fr: "Esthétique chaleureuse", en: "Warm aesthetic" },
            body: { fr: "Teintes dorées idéales pour les projets design et hôteliers.", en: "Golden tones ideal for design-led and hospitality projects." },
          },
          {
            title: { fr: "Propriétés anticorrosion", en: "Corrosion-resistant properties" },
            body: { fr: "Une bonne tenue dans le temps avec un entretien minimal.", en: "Holds up well over time with minimal maintenance." },
          },
          {
            title: { fr: "Conductivité", en: "Conductivity" },
            body: { fr: "Adapté aux applications techniques et électriques.", en: "Suited to technical and electrical applications." },
          },
          {
            title: { fr: "Finitions premium", en: "Premium finishes" },
            body: { fr: "Poli, brossé ou patiné selon l'effet recherché.", en: "Polished, brushed or patinated to achieve the desired effect." },
          },
        ],
      },
      {
        kind: "gallery",
        heading: { fr: "Quelques réalisations — laiton", en: "Selected projects — brass" },
        images: [
          { seed: "ecl-laiton-real-1", alt: "Comptoir bar en laiton" },
          { seed: "ecl-laiton-real-2", alt: "Détail architectural en laiton" },
          { seed: "ecl-laiton-real-3", alt: "Luminaire en laiton" },
          { seed: "ecl-laiton-real-4", alt: "Composant décoratif en laiton" },
        ],
      },
    ],
    relatedSolutions: ["composantes-architecturales", "mobilier-accueil", "pieces-sur-mesure"],
    hasSourceCopy: false,
  },

  {
    slug: "cuivre",
    code: "C110",
    name: { fr: "Cuivre", en: "Copper" },
    shortName: { fr: "Cuivre", en: "Copper" },
    fullName: { fr: "Cuivre pur", en: "Pure copper" },
    metaDescription: {
      fr: "Transformation du cuivre sur mesure à Québec — une matière noble aux performances thermiques et électriques, pour l'industrie, l'électrotechnique et l'architecture.",
      en: "Custom copper fabrication in Québec — a noble material with thermal and electrical performance for industry, electrical engineering and architecture.",
    },
    blurb: {
      fr: "Une matière noble transformée avec expertise. Incontournable pour ses performances thermiques et électriques, et sa patine architecturale unique.",
      en: "A noble material fabricated with expertise. Indispensable for its thermal and electrical performance and its unique architectural patina.",
    },
    properties: [
      { fr: "Patine unique", en: "Unique patina" },
      { fr: "Antimicrobien", en: "Antimicrobial" },
      { fr: "Architectural", en: "Architectural" },
    ],
    cardImage: { seed: "ecl-cuivre-card-facade", alt: "Façade en cuivre patiné" },
    hero: {
      heading: { fr: "Cuivre", en: "Copper" },
      intro: {
        fr: "Matériau incontournable pour ses performances thermiques et électriques, le cuivre est travaillé avec soin par notre équipe pour répondre aux besoins spécifiques de l'industrie, de l'électrotechnique et de l'architecture.",
        en: "An essential material for its thermal and electrical performance, copper is worked with care by our team to meet the specific needs of industry, electrical engineering and architecture.",
      },
      image: { seed: "ecl-cuivre-hero-detail", alt: "Détail de cuivre patiné", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: { fr: "Une matière vivante, façonnée avec précision", en: "A living material, shaped with precision" },
        paragraphs: [
          {
            fr: "Le cuivre développe avec le temps une patine unique qui en fait un matériau de choix pour l'architecture. Nous le travaillons avec le soin qu'exige cette matière noble, pour des réalisations durables et singulières.",
            en: "Over time, copper develops a unique patina that makes it a material of choice for architecture. We work it with the care this noble material demands, for durable, one-of-a-kind projects.",
          },
          {
            fr: "Performances thermiques, conductivité et esthétique : autant de qualités que nous mettons au service de vos projets.",
            en: "Thermal performance, conductivity and aesthetics — qualities we put to work for your projects.",
          },
        ],
      },
      {
        kind: "list",
        heading: { fr: "Pourquoi choisir le cuivre ?", en: "Why choose copper?" },
        items: [
          {
            title: { fr: "Patine architecturale", en: "Architectural patina" },
            body: { fr: "Évolue avec le temps pour un caractère unique.", en: "Evolves over time for a truly distinctive character." },
          },
          {
            title: { fr: "Performances thermiques et électriques", en: "Thermal and electrical performance" },
            body: { fr: "Idéal pour les applications techniques exigeantes.", en: "Ideal for demanding technical applications." },
          },
          {
            title: { fr: "Propriétés antimicrobiennes", en: "Antimicrobial properties" },
            body: { fr: "Recherché dans les milieux sensibles.", en: "Sought after in sensitive environments." },
          },
          {
            title: { fr: "Travail de finition", en: "Finishing work" },
            body: { fr: "Poli, bruni ou laissé à patiner selon l'effet recherché.", en: "Polished, burnished or left to patina to achieve the desired effect." },
          },
        ],
      },
      {
        kind: "gallery",
        heading: { fr: "Quelques réalisations — cuivre", en: "Selected projects — copper" },
        images: [
          { seed: "ecl-cuivre-real-1", alt: "Revêtement en cuivre" },
          { seed: "ecl-cuivre-real-2", alt: "Plafond en cuivre" },
          { seed: "ecl-cuivre-real-3", alt: "Détail architectural en cuivre" },
          { seed: "ecl-cuivre-real-4", alt: "Composant technique en cuivre" },
        ],
      },
    ],
    relatedSolutions: ["composantes-architecturales", "pieces-sur-mesure"],
    hasSourceCopy: false,
  },
]

export const MATERIAL_SLUGS = MATERIALS.map((m) => m.slug)

export function getMaterial(slug: string): MaterialDetail | undefined {
  return MATERIALS.find((m) => m.slug === slug)
}
