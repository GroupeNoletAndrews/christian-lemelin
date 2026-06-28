import type { Metadata } from "next"
import { Installations } from "@/components/sections/Installations"

export const metadata: Metadata = {
  title: "Nos installations",
  description:
    "Infrastructures modernes et technologies de pointe : CAO, découpe laser plaque et tube, robotique, presse plieuse CNC. 15 000 pi² de production à Québec.",
}

export default function InstallationsPage() {
  return <Installations />
}
