import type { MaterialDetail } from "./types"

// Source unique des matériaux (ordre Inox → Acier → Aluminium → Laiton →
// Cuivre, demandé par le client). Consommé par /materiaux/[slug], le showcase
// de /fabrication et le carousel du home (Materiaux.tsx). Copie tirée des PDF
// « Acier » et « Acier inox » ; aluminium/laiton/cuivre synthétisés à partir
// des blurbs de « Fab sur mesure » (hasSourceCopy:false → à relire).

export const MATERIALS: MaterialDetail[] = [
  {
    slug: "acier-inoxydable",
    code: "316L",
    name: "Acier inoxydable",
    shortName: "Inox",
    fullName: "Inox 304 / 316L",
    metaDescription:
      "Transformation de l'acier inoxydable sur mesure à Québec — hygiène, résistance à la corrosion et longévité pour le médical, l'agroalimentaire et l'architecture.",
    blurb:
      "Une solidité éprouvée, une résistance à toute épreuve. Idéal pour les environnements exigeants, l'inox offre une protection maximale contre la corrosion et l'usure.",
    properties: ["Résistant à la corrosion", "Hygiénique & alimentaire", "Haute durabilité"],
    cardImage: { seed: "ecl-inox-card-mirror", alt: "Surface d'acier inoxydable poli" },
    hero: {
      heading: "Acier inoxydable",
      intro:
        "Chez E.C. Lemelin, nous exploitons les propriétés exceptionnelles de l'acier inoxydable pour concevoir des solutions résistantes et durables. Reconnu pour sa robustesse et sa résistance à la corrosion, ce matériau est idéal pour les secteurs exigeant hygiène, solidité et longévité.",
      image: { seed: "ecl-inox-hero-kitchen", alt: "Atelier d'acier inoxydable", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: "L'acier inoxydable au cœur des environnements exigeants",
        paragraphs: [
          "Notre maîtrise de la transformation de l'acier inoxydable nous permet de répondre aux exigences des industries pharmaceutiques, agroalimentaires et architecturales. Que ce soit pour du mobilier sur mesure, des composants industriels ou des équipements spécialisés, nous assurons une finition impeccable et une conception adaptée aux normes les plus strictes.",
          "Notre savoir-faire garantit des réalisations à la fois fonctionnelles, esthétiques et conçues pour durer.",
        ],
      },
      {
        kind: "list",
        heading: "Pourquoi choisir l'acier inoxydable ?",
        items: [
          { title: "Résistance à la corrosion", body: "Idéal pour les environnements exigeants et humides." },
          { title: "Hygiène irréprochable", body: "Facile à nettoyer, privilégié dans le secteur médical et alimentaire." },
          { title: "Durabilité accrue", body: "Excellente résistance aux agressions chimiques et mécaniques." },
          { title: "Finitions esthétiques et modernes", body: "Apporte une touche élégante et professionnelle aux réalisations." },
        ],
      },
      {
        kind: "gallery",
        heading: "Quelques réalisations — acier inoxydable",
        images: [
          { seed: "ecl-inox-real-1", alt: "Mobilier sanitaire en inox" },
          { seed: "ecl-inox-real-2", alt: "Comptoir inox sur mesure" },
          { seed: "ecl-inox-real-3", alt: "Hotte et surfaces hygiéniques" },
          { seed: "ecl-inox-real-4", alt: "Équipement de laboratoire en inox" },
        ],
      },
      {
        kind: "feature",
        heading: "Performance, hygiène et longévité",
        intro:
          "L'acier inoxydable allie résistance à la corrosion, hygiène et design moderne — le choix idéal pour de nombreux secteurs exigeants.",
        image: { seed: "ecl-inox-feature-plate", alt: "Plaques d'acier inoxydable empilées", grayscale: true },
        points: [
          { title: "Mobilier et équipements sanitaires", body: "Tables de travail, éviers, hottes et surfaces hygiéniques." },
          { title: "Aménagements hospitaliers et pharmaceutiques", body: "Postes de soins, armoires hermétiques et supports stériles." },
          { title: "Composants architecturaux et industriels", body: "Revêtements, garde-corps et structures modernes." },
          { title: "Supports et fixations anticorrosion", body: "Poutres, charpentes et pièces mécanosoudées en inox." },
        ],
      },
    ],
    relatedSolutions: ["mobilier-hospitalier", "mobilier-laboratoire", "composantes-architecturales"],
    hasSourceCopy: true,
  },

  {
    slug: "acier",
    code: "A36",
    name: "Acier",
    shortName: "Acier",
    fullName: "Acier structurel A36",
    metaDescription:
      "Transformation de l'acier sur mesure à Québec — découpe, pliage et assemblage de haute précision pour structures industrielles, commerciales et institutionnelles.",
    blurb:
      "Un matériau robuste pour des solutions sur mesure. L'acier est la base de nombreuses réalisations industrielles et architecturales, alliant résistance, précision et durabilité.",
    properties: ["Haute résistance", "Soudable partout", "Économique"],
    cardImage: { seed: "ecl-acier-card-plate", alt: "Plaque d'acier structurel" },
    hero: {
      heading: "Acier",
      intro:
        "Chez E.C. Lemelin, l'acier est au cœur de notre savoir-faire. Matériau robuste et polyvalent, il nous permet de concevoir des structures métalliques sur mesure adaptées aux besoins des secteurs industriel, commercial et institutionnel. Grâce à des procédés de découpe, de pliage et d'assemblage de haute précision, nous garantissons des solutions durables et performantes.",
      image: { seed: "ecl-acier-hero-shop", alt: "Atelier de transformation de l'acier", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: "Un savoir-faire de précision pour des réalisations sur mesure",
        paragraphs: [
          "Notre expertise en transformation de l'acier repose sur des techniques avancées qui assurent une finition impeccable et une résistance optimale. Que ce soit pour des équipements sur mesure, des composantes architecturales ou des infrastructures industrielles, nous maîtrisons chaque étape du processus.",
          "Nous répondons ainsi aux exigences les plus strictes en termes de qualité et de fiabilité.",
        ],
      },
      {
        kind: "list",
        heading: "L'acier, un matériau de choix",
        items: [
          { title: "Robustesse inégalée", body: "Résiste aux charges lourdes et aux contraintes mécaniques." },
          { title: "Durabilité accrue", body: "Excellente longévité, même dans des environnements exigeants." },
          { title: "Polyvalence d'application", body: "Adapté aux structures, équipements industriels et éléments architecturaux." },
          { title: "Personnalisation et finitions variées", body: "Acier peint ou plaqué selon les besoins." },
        ],
      },
      {
        kind: "gallery",
        heading: "Quelques réalisations — acier",
        images: [
          { seed: "ecl-acier-real-1", alt: "Structure métallique en acier" },
          { seed: "ecl-acier-real-2", alt: "Escalier en acier" },
          { seed: "ecl-acier-real-3", alt: "Passerelle industrielle" },
          { seed: "ecl-acier-real-4", alt: "Support et profilés en acier" },
        ],
      },
      {
        kind: "feature",
        heading: "Des composants en acier conçus pour la performance et la durabilité",
        intro:
          "Nos réalisations en acier s'adaptent aux exigences techniques et esthétiques des industries les plus rigoureuses.",
        image: { seed: "ecl-acier-feature-blue", alt: "Plaques d'acier", grayscale: true },
        points: [
          { title: "Structures métalliques robustes", body: "Constructions industrielles, escaliers, passerelles et supports." },
          { title: "Éléments mécano-soudés", body: "Assemblages résistants aux fortes contraintes." },
          { title: "Composants architecturaux", body: "Revêtements métalliques, garde-corps et façades modernes." },
          { title: "Supports et fixations", body: "Poutres, cornières et profilés adaptés aux structures complexes." },
        ],
      },
    ],
    relatedSolutions: ["composantes-architecturales", "pieces-sur-mesure", "prototypes"],
    hasSourceCopy: true,
  },

  {
    slug: "aluminium",
    code: "6061",
    name: "Aluminium",
    shortName: "Aluminium",
    fullName: "Aluminium série 6000",
    metaDescription:
      "Transformation de l'aluminium sur mesure à Québec — légèreté, résistance à la corrosion et précision pour l'architecture, l'aéronautique et l'industrie.",
    blurb:
      "Léger, polyvalent et conçu pour la performance. Reconnu pour sa légèreté et sa résistance naturelle à la corrosion, idéal pour les structures performantes et esthétiques.",
    properties: ["Léger", "Anti-corrosion naturel", "Usinable"],
    cardImage: { seed: "ecl-alu-card-profile", alt: "Profilé d'aluminium brossé" },
    hero: {
      heading: "Aluminium",
      intro:
        "L'aluminium est reconnu pour sa légèreté et sa résistance à la corrosion. Chez E.C. Lemelin, nous l'utilisons pour créer des solutions sur mesure adaptées aux secteurs exigeant des structures performantes, précises et esthétiques — de l'architecture à l'aéronautique en passant par l'industrie.",
      image: { seed: "ecl-alu-hero-extrusion", alt: "Profilés d'aluminium en atelier", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: "Léger en apparence, exigeant en réalité",
        paragraphs: [
          "Travailler l'aluminium demande une maîtrise particulière de la découpe, du pliage et de la soudure. Notre équipe technique exploite ses propriétés uniques pour livrer des pièces à la fois légères, résistantes et impeccablement finies.",
          "Le résultat : des solutions performantes qui répondent aux besoins spécifiques de chaque projet.",
        ],
      },
      {
        kind: "list",
        heading: "Pourquoi choisir l'aluminium ?",
        items: [
          { title: "Légèreté", body: "Un rapport résistance/poids idéal pour les structures mobiles ou suspendues." },
          { title: "Résistance naturelle à la corrosion", body: "Sans traitement lourd, même en milieu humide." },
          { title: "Usinabilité", body: "Se découpe, se plie et s'assemble avec une grande précision." },
          { title: "Esthétique moderne", body: "Finitions brossées, anodisées ou peintes selon le projet." },
        ],
      },
      {
        kind: "gallery",
        heading: "Quelques réalisations — aluminium",
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
    name: "Laiton",
    shortName: "Laiton",
    fullName: "Laiton & bronze",
    metaDescription:
      "Transformation du laiton sur mesure à Québec — un alliage raffiné et esthétique pour les applications décoratives, architecturales et techniques.",
    blurb:
      "Un alliage raffiné pour des applications spécifiques. Matériau esthétique et performant, apprécié pour ses teintes chaudes et ses propriétés anticorrosion.",
    properties: ["Teintes chaudes", "Décoratif", "Finition premium"],
    cardImage: { seed: "ecl-laiton-card-interior", alt: "Détail décoratif en laiton" },
    hero: {
      heading: "Laiton",
      intro:
        "Le laiton est un matériau esthétique et performant, apprécié pour ses propriétés anticorrosion et conductrices. Chez E.C. Lemelin, nous l'utilisons pour fabriquer des composants de précision adaptés aux industries technologiques, architecturales et décoratives.",
      image: { seed: "ecl-laiton-hero-bar", alt: "Bar en laiton", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: "La chaleur du laiton, la précision de l'atelier",
        paragraphs: [
          "Apprécié pour ses teintes chaudes et son caractère noble, le laiton demande une finition soignée pour révéler tout son potentiel. Nous le travaillons avec soin pour des réalisations décoratives et techniques d'exception.",
          "De la pièce unique au composant de série, chaque finition est exécutée selon les standards les plus exigeants.",
        ],
      },
      {
        kind: "list",
        heading: "Pourquoi choisir le laiton ?",
        items: [
          { title: "Esthétique chaleureuse", body: "Teintes dorées idéales pour les projets design et hôteliers." },
          { title: "Propriétés anticorrosion", body: "Une bonne tenue dans le temps avec un entretien minimal." },
          { title: "Conductivité", body: "Adapté aux applications techniques et électriques." },
          { title: "Finitions premium", body: "Poli, brossé ou patiné selon l'effet recherché." },
        ],
      },
      {
        kind: "gallery",
        heading: "Quelques réalisations — laiton",
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
    name: "Cuivre",
    shortName: "Cuivre",
    fullName: "Cuivre pur",
    metaDescription:
      "Transformation du cuivre sur mesure à Québec — une matière noble aux performances thermiques et électriques, pour l'industrie, l'électrotechnique et l'architecture.",
    blurb:
      "Une matière noble transformée avec expertise. Incontournable pour ses performances thermiques et électriques, et sa patine architecturale unique.",
    properties: ["Patine unique", "Antimicrobien", "Architectural"],
    cardImage: { seed: "ecl-cuivre-card-facade", alt: "Façade en cuivre patiné" },
    hero: {
      heading: "Cuivre",
      intro:
        "Matériau incontournable pour ses performances thermiques et électriques, le cuivre est travaillé avec soin par notre équipe pour répondre aux besoins spécifiques de l'industrie, de l'électrotechnique et de l'architecture.",
      image: { seed: "ecl-cuivre-hero-detail", alt: "Détail de cuivre patiné", grayscale: true },
    },
    blocks: [
      {
        kind: "prose",
        heading: "Une matière vivante, façonnée avec précision",
        paragraphs: [
          "Le cuivre développe avec le temps une patine unique qui en fait un matériau de choix pour l'architecture. Nous le travaillons avec le soin qu'exige cette matière noble, pour des réalisations durables et singulières.",
          "Performances thermiques, conductivité et esthétique : autant de qualités que nous mettons au service de vos projets.",
        ],
      },
      {
        kind: "list",
        heading: "Pourquoi choisir le cuivre ?",
        items: [
          { title: "Patine architecturale", body: "Évolue avec le temps pour un caractère unique." },
          { title: "Performances thermiques et électriques", body: "Idéal pour les applications techniques exigeantes." },
          { title: "Propriétés antimicrobiennes", body: "Recherché dans les milieux sensibles." },
          { title: "Travail de finition", body: "Poli, bruni ou laissé à patiner selon l'effet recherché." },
        ],
      },
      {
        kind: "gallery",
        heading: "Quelques réalisations — cuivre",
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
