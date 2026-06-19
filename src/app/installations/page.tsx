import type { Metadata } from "next"
import { INSTALLATIONS } from "@/content"
import { Installations } from "@/components/sections/Installations"
import { ContactCTA } from "@/components/sections/ContactCTA"

export const metadata: Metadata = {
  title: "Nos installations",
  description:
    "Infrastructures modernes et technologies de pointe : CAO, découpe laser plaque et tube, robotique, presse plieuse CNC. 15 000 pi² de production à Québec.",
}

export default function InstallationsPage() {
  const { cta } = INSTALLATIONS
  return (
    <>
      <Installations />
      <ContactCTA
        heading={cta?.heading}
        body={cta?.body}
        label={cta?.label}
        href={cta?.href}
      />
    </>
  )
}
