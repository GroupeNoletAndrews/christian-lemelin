import { test, expect } from "@playwright/test"

// Smoke test: every public route serves (HTTP < 400) and renders a heading.
// Dynamic [slug] routes use known static-content slugs; the auth-gated admin
// dashboard / edit routes are covered in admin.spec.ts.
const ROUTES = [
  "/",
  "/a-propos",
  "/contact",
  "/fabrication",
  "/installations",
  "/materiaux",
  "/materiaux/acier-inoxydable",
  "/solutions",
  "/solutions/mobilier-hospitalier",
  "/emplois",
  "/realisations",
  "/admin",
]

for (const route of ROUTES) {
  test(`route ${route} serves and renders a heading`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" })
    expect(response, `no response for ${route}`).toBeTruthy()
    expect(
      response!.status(),
      `unexpected status for ${route}`,
    ).toBeLessThan(400)
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })
}
