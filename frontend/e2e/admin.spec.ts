import { test, expect, type Page } from "@playwright/test"

// Admin flows against the live stack: real login (bcrypt + JWT), job CRUD,
// réalisation pin toggle, and the 6-pin limit guard.
//
// Serial: tests share the same backing database. Entities are uniquely named
// so re-runs don't collide; `docker compose down -v` resets the DB.
test.describe.configure({ mode: "serial" })

const ADMIN = { username: "admin", password: "password" }

// 1x1 PNG, decoded into an in-memory file for the réalisation image upload.
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
)

async function login(page: Page) {
  await page.goto("/admin")
  await page.fill("#username", ADMIN.username)
  await page.fill("#password", ADMIN.password)
  await page.getByRole("button", { name: /Se connecter/ }).click()
  await expect(page).toHaveURL(/\/admin\/dashboard/)
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible()
}

test("login with seeded credentials reaches the dashboard", async ({
  page,
}) => {
  await login(page)
  await expect(page.getByText(`Bienvenue,`)).toBeVisible()
})

test("rejects invalid credentials", async ({ page }) => {
  await page.goto("/admin")
  await page.fill("#username", "admin")
  await page.fill("#password", "wrong-password")
  await page.getByRole("button", { name: /Se connecter/ }).click()
  await expect(page.getByText("Identifiants invalides")).toBeVisible()
  await expect(page).toHaveURL(/\/admin$/)
})

test("create, edit, and delete a job (persists in the DB)", async ({
  page,
}) => {
  await login(page)
  const title = `E2E Soudeur ${Date.now()}`
  const editedTitle = `${title} (modifié)`

  // Create
  await page.getByRole("link", { name: /Ajouter un emploi/ }).first().click()
  await expect(page).toHaveURL(/jobs\/create\/edit/)
  await page.fill("#title", title)
  await page.fill("#department", "Production")
  await page.fill("#location", "Québec, QC")
  await page.fill("#description", "Poste de test E2E.")
  await page.selectOption("#type", "full-time")
  await page.getByRole("button", { name: /Créer/ }).click()
  await expect(page).toHaveURL(/\/admin\/dashboard$/)
  await expect(page.getByText(title)).toBeVisible()

  // Edit
  await page
    .getByRole("row", { name: new RegExp(escapeRegExp(title)) })
    .getByRole("link", { name: "Modifier" })
    .click()
  await expect(page).toHaveURL(/jobs\/.+\/edit/)
  await page.fill("#title", editedTitle)
  await page.getByRole("button", { name: /Mettre à jour/ }).click()
  await expect(page).toHaveURL(/\/admin\/dashboard$/)
  await expect(page.getByText(editedTitle)).toBeVisible()

  // Delete (confirm dialog)
  page.once("dialog", (d) => d.accept())
  await page
    .getByRole("row", { name: new RegExp(escapeRegExp(editedTitle)) })
    .getByRole("button", { name: "Supprimer" })
    .click()
  await expect(page.getByText(editedTitle)).toHaveCount(0)
})

test("toggle a réalisation pin on and off", async ({ page }) => {
  await login(page)
  await page.getByRole("button", { name: "Réalisations" }).click()

  // Scope to a single seeded card (global-setup guarantees these 6 exist) and
  // assert THAT card's button flips — robust to whatever else is in the DB.
  const card = page
    .locator("div.bg-surface")
    .filter({ hasText: "Mobilier hospitalier en inox" })
    .first()
  await expect(card.getByRole("button", { name: "Épinglée" })).toBeVisible()
  await card.getByRole("button", { name: "Épinglée" }).click()
  await expect(card.getByRole("button", { name: "Épingler" })).toBeVisible()
  await card.getByRole("button", { name: "Épingler" }).click()
  await expect(card.getByRole("button", { name: "Épinglée" })).toBeVisible()
})

test("enforces the 6-pin limit when pinning a 7th réalisation", async ({
  page,
}) => {
  await login(page)
  // Precondition (guaranteed by global-setup): the pin cap is full.
  await expect(page.getByText("6/6")).toBeVisible()
  await page.getByRole("button", { name: "Réalisations" }).click()

  // Create a 7th réalisation (the pin checkbox is disabled once the cap is hit,
  // so it is created unpinned).
  const name = `E2E Réalisation ${Date.now()}`
  await page
    .getByRole("link", { name: /Ajouter une réalisation/ })
    .first()
    .click()
  await expect(page).toHaveURL(/realisations\/create\/edit/)
  await page.fill("#name", name)
  await page.setInputFiles('input[type="file"]', {
    name: "sample.png",
    mimeType: "image/png",
    buffer: PNG_1x1,
  })
  // Wait until the upload is compressed and registered (thumbnail counter).
  await expect(page.getByText(/^1 image/)).toBeVisible()
  await page.getByRole("button", { name: /Ajouter la réalisation/ }).click()
  await expect(page).toHaveURL(/\/admin\/dashboard/)

  // Ensure the réalisations grid is shown (don't rely on the #realisations hash).
  await page.getByRole("button", { name: "Réalisations" }).click()

  // The new card shows an "Épingler" button; clicking it must hit the cap.
  const card = page
    .locator("div.bg-surface")
    .filter({ hasText: name })
    .first()
  let alertMessage = ""
  page.on("dialog", (d) => {
    alertMessage = d.message()
    void d.accept()
  })
  await card.getByRole("button", { name: "Épingler" }).click()
  await expect.poll(() => alertMessage).toContain("Limite atteinte")
})

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
