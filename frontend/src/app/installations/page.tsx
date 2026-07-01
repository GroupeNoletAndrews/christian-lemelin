import type { Metadata } from "next"
import { Installations } from "@/components/sections/Installations"
import { SectionStyleProvider } from "@/components/sections/SectionStyle"
import { resolveSectionImages, resolveSectionStyles } from "@/lib/server/sections"

export const metadata: Metadata = {
  title: "Nos installations",
  description:
    "Infrastructures modernes et technologies de pointe : CAO, découpe laser plaque et tube, robotique, presse plieuse CNC. 15 000 pi² de production à Québec.",
}

// Reads published Installations image overrides + presentation at request time.
export const dynamic = "force-dynamic"

export default async function InstallationsPage() {
  const [images, styles] = await Promise.all([
    resolveSectionImages("installations"),
    resolveSectionStyles("installations"),
  ])
  return (
    <SectionStyleProvider styles={styles}>
      <Installations images={images} />
    </SectionStyleProvider>
  )
}
