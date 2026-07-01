import type { Metadata } from "next"
import { Installations } from "@/components/sections/Installations"
import { resolveSectionImages } from "@/lib/server/sections"

export const metadata: Metadata = {
  title: "Nos installations",
  description:
    "Infrastructures modernes et technologies de pointe : CAO, découpe laser plaque et tube, robotique, presse plieuse CNC. 15 000 pi² de production à Québec.",
}

// Reads published Installations image overrides at request time.
export const dynamic = "force-dynamic"

export default async function InstallationsPage() {
  const images = await resolveSectionImages("installations")
  return <Installations images={images} />
}
