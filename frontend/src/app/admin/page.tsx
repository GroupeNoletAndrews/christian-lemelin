import { resolveSectionImages, resolveSectionStyles } from "@/lib/server/sections"
import { mediaUrl, SITE_MEDIA, PLACEHOLDER_SRC } from "@/lib/media"
import { SectionStyleProvider } from "@/components/sections/SectionStyle"
import { AdminLogin } from "@/components/admin/AdminLogin"

// Resolves the (editable) login image at request time so an admin publish shows
// on the login page immediately.
export const dynamic = "force-dynamic"

export default async function AdminLoginPage() {
  const [images, styles] = await Promise.all([
    resolveSectionImages("admin-login"),
    resolveSectionStyles("admin-login"),
  ])
  // The login always shows a real image: the published override, else the code
  // default (never the "no photo yet" placeholder).
  const override = images["hero"]
  const imageUrl =
    override && override !== PLACEHOLDER_SRC
      ? override
      : mediaUrl(SITE_MEDIA.savoirFaire.fabrication)
  return (
    <SectionStyleProvider styles={styles}>
      <AdminLogin imageUrl={imageUrl} />
    </SectionStyleProvider>
  )
}
