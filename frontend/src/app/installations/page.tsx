import type { Metadata } from "next"
import { Installations } from "@/components/sections/Installations"
import { SectionStyleProvider } from "@/components/sections/SectionStyle"
import { resolveSectionImages, resolveSectionStyles } from "@/lib/server/sections"
import { getLocale } from "@/lib/server/locale"
import { t } from "@/lib/i18n"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: t("Nos installations", "Our facilities", locale),
    description: t(
      "Infrastructures modernes et technologies de pointe : CAO, découpe laser plaque et tube, robotique, presse plieuse CNC. 15 000 pi² de production à Québec.",
      "Modern infrastructure and cutting-edge technology: CAD, plate and tube laser cutting, robotics, CNC press brake. 15,000 sq ft of production in Québec City.",
      locale,
    ),
  }
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
