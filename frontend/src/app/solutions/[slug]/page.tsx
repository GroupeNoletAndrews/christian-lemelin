import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SOLUTION_SLUGS, getSolution, getMaterial } from "@/content"
import { DetailLayout } from "@/components/detail/DetailLayout"
import { resolveSectionImages } from "@/lib/server/sections"

export const dynamicParams = false
// Reads published Solutions image overrides at request time.
export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return SOLUTION_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const s = getSolution(slug)
  if (!s) return {}
  return { title: s.title, description: s.metaDescription }
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const s = getSolution(slug)
  if (!s) notFound()

  const images = await resolveSectionImages("solutions")
  const tiles = (s.relatedMaterials ?? [])
    .map((ms) => getMaterial(ms))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((m) => ({ href: `/materiaux/${m.slug}`, label: m.name, image: m.cardImage }))

  return (
    <DetailLayout
      hero={s.hero}
      blocks={s.blocks}
      section="solutions"
      slug={slug}
      images={images}
      explore={{
        heading: tiles.length ? "Les matériaux de cette solution" : "",
        tiles,
        contactText: "Donnons forme à votre projet.",
      }}
    />
  )
}
