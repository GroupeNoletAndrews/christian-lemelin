import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MATERIAL_SLUGS, getMaterial, SOLUTIONS_OVERVIEW } from "@/content"
import { DetailLayout } from "@/components/detail/DetailLayout"
import { resolveSectionImages } from "@/lib/server/sections"

export const dynamicParams = false
// Reads published Matériaux image overrides at request time.
export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return MATERIAL_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const m = getMaterial(slug)
  if (!m) return {}
  return { title: m.name, description: m.metaDescription }
}

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const m = getMaterial(slug)
  if (!m) notFound()

  const images = await resolveSectionImages("materiaux")
  const byIndex = new Map(SOLUTIONS_OVERVIEW.index.map((e) => [e.slug, e]))
  const tiles = (m.relatedSolutions ?? [])
    .map((ss) => byIndex.get(ss))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .map((e) => ({ href: `/solutions/${e.slug}`, label: e.title, image: e.hoverImage }))

  return (
    <DetailLayout
      hero={m.hero}
      properties={m.properties}
      blocks={m.blocks}
      section="materiaux"
      slug={slug}
      images={images}
      explore={{
        heading: tiles.length ? "Où on l'utilise" : "",
        tiles,
        contactText: `Un projet en ${m.name.toLowerCase()} ?`,
      }}
    />
  )
}
