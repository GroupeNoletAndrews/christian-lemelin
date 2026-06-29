import { SlotParallaxImage } from "@/components/sections/SlotParallaxImage"
import { imageUrl, type ContentBlock } from "@/content"
import { featureSlot, splitSlot } from "@/lib/sections-registry"
import { GalleryStrip } from "./GalleryStrip"

// Rendu générique des blocs de contenu d'une page de détail. Listes en lignes
// hairline (aucun badge / numéro) ; bloc « feature » sombre full-width. Les
// images (gallery/split/feature) sont éditables via leur slot <slug>/…<index>.
const WRAP = "mx-auto max-w-[1400px] px-6 md:px-12"
const H2 =
  "max-w-[24ch] font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.01em] text-foreground"

export function ContentBlocks({
  blocks,
  section,
  slug,
  images = {},
}: {
  blocks: ContentBlock[]
  section: string
  slug: string
  images?: Record<string, string>
}) {
  return (
    <>
      {blocks.map((block, i) => (
        <Block
          key={i}
          block={block}
          index={i}
          section={section}
          slug={slug}
          images={images}
        />
      ))}
    </>
  )
}

function HairlineRows({
  items,
  dark = false,
}: {
  items: { title: string; body?: string }[]
  dark?: boolean
}) {
  const line = dark ? "border-white/12" : "border-border"
  const title = dark ? "text-white" : "text-foreground"
  const body = dark ? "text-white/55" : "text-foreground-muted"
  return (
    <div className="mt-8">
      {items.map((it, i) => (
        <div
          key={i}
          className={`border-t ${line} py-5 md:grid md:grid-cols-[1fr_1.4fr] md:gap-8 md:py-6`}
        >
          <h3 className={`font-display text-lg font-medium md:text-xl ${title}`}>{it.title}</h3>
          {it.body && (
            <p className={`mt-2 max-w-[54ch] leading-relaxed md:mt-0 ${body}`}>{it.body}</p>
          )}
        </div>
      ))}
      <div className={`border-t ${line}`} />
    </div>
  )
}

function Block({
  block,
  index,
  section,
  slug,
  images,
}: {
  block: ContentBlock
  index: number
  section: string
  slug: string
  images: Record<string, string>
}) {
  switch (block.kind) {
    case "prose":
      return (
        <section className="bg-background py-16 md:py-24">
          <div className={WRAP}>
            {block.heading && <h2 className={H2}>{block.heading}</h2>}
            <div className="mt-6 max-w-[64ch] space-y-4">
              {block.paragraphs.map((p, i) => (
                <p key={i} className="text-lg leading-relaxed text-foreground-muted">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      )

    case "list":
      return (
        <section className="bg-background py-16 md:py-24">
          <div className={WRAP}>
            {block.heading && <h2 className={H2}>{block.heading}</h2>}
            {block.intro && (
              <p className="mt-5 max-w-[60ch] leading-relaxed text-foreground-muted">
                {block.intro}
              </p>
            )}
            <HairlineRows items={block.items} />
          </div>
        </section>
      )

    case "properties":
      return (
        <section className="bg-background py-16 md:py-24">
          <div className={WRAP}>
            {block.heading && <h2 className={H2}>{block.heading}</h2>}
            <dl className="mt-8">
              {block.items.map((it, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-6 border-t border-border py-4"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                    {it.label}
                  </dt>
                  <dd className="text-right text-foreground">{it.value}</dd>
                </div>
              ))}
              <div className="border-t border-border" />
            </dl>
          </div>
        </section>
      )

    case "gallery":
      return (
        <GalleryStrip
          heading={block.heading}
          images={block.images}
          section={section}
          slug={slug}
          blockIndex={index}
          overrides={images}
        />
      )

    case "split": {
      const slot = splitSlot(slug, index)
      const src = images[slot] ?? imageUrl(block.image, 1200, 900)
      return (
        <section className="bg-background py-16 md:py-24">
          <div className={`${WRAP} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
            <div className={block.reverse ? "lg:order-2" : ""}>
              <h2 className={H2}>{block.heading}</h2>
              <div className="mt-6 max-w-[52ch] space-y-4">
                {block.paragraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed text-foreground-muted">
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <div
              className={`relative aspect-[4/3] overflow-hidden rounded-2xl border border-border ${
                block.reverse ? "lg:order-1" : ""
              }`}
            >
              <SlotParallaxImage
                section={section}
                slot={slot}
                src={src}
                alt={block.heading}
                sizes="(min-width: 1024px) 45vw, 90vw"
              />
            </div>
          </div>
        </section>
      )
    }

    case "feature": {
      const slot = featureSlot(slug, index)
      const src = images[slot] ?? imageUrl(block.image, 1400, 1400)
      return (
        <section data-header-theme="dark" className="bg-background px-3 py-3 md:px-4 md:py-4">
          <div className="overflow-hidden rounded-[1.75rem] bg-ink md:rounded-[2.5rem]">
            <div className="grid lg:grid-cols-2">
              <div className="relative min-h-[300px] lg:min-h-[540px]">
                <SlotParallaxImage
                  section={section}
                  slot={slot}
                  src={src}
                  alt={block.heading}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/30" />
              </div>
              <div className="flex flex-col justify-center px-6 py-14 md:px-12 md:py-20">
                <h2 className="max-w-[18ch] font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.01em] text-white">
                  {block.heading}
                </h2>
                {block.intro && (
                  <p className="mt-5 max-w-[48ch] leading-relaxed text-white/65">{block.intro}</p>
                )}
                <HairlineRows items={block.points} dark />
              </div>
            </div>
          </div>
        </section>
      )
    }
  }
}
