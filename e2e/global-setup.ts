// Runs once before the Playwright suite:
//  1. Waits for the backend (/health) and frontend to be ready — removes the
//     race where tests start before `prisma db push` + seed have finished.
//  2. Resets réalisations to exactly 6 pinned, so the pin-toggle and 6-pin-limit
//     specs are deterministic regardless of the (persistent) DB volume state.
const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
)
const APP = (process.env.E2E_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
)
const ADMIN = {
  username: process.env.SEED_ADMIN_USERNAME ?? "admin",
  password: process.env.SEED_ADMIN_PASSWORD ?? "password",
}

// Same names/images as backend/src/seed.ts, so a test run leaves the dev DB
// visually intact.
const SEED_REALISATIONS = [
  {
    name: "Mobilier hospitalier en inox",
    images: [
      "/assets/1780581925672-IMG_1281.jpeg",
      "/assets/1780581931474-IMG_1280.jpeg",
    ],
  },
  {
    name: "Bar lounge — hôtellerie",
    images: [
      "/assets/1780581840629-IMG_1294.jpeg",
      "/assets/1780581884668-IMG_1288.jpeg",
    ],
  },
  { name: "Bar circulaire en laiton", images: ["/assets/1780581873317-IMG_1291.jpeg"] },
  { name: "Aménagement de restaurant", images: ["/assets/1780581850553-IMG_1293.jpeg"] },
  { name: "Cuisine extérieure sur mesure", images: ["/assets/1780581936961-IMG_1277.jpeg"] },
  { name: "Escalier & structure d'atelier", images: ["/assets/1780581858443-IMG_1292.jpeg"] },
]

async function waitFor(
  label: string,
  url: string,
  timeoutMs = 90_000,
): Promise<void> {
  const start = Date.now()
  let lastErr: unknown
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
      lastErr = new Error(`${label} responded ${res.status}`)
    } catch (e) {
      lastErr = e
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new Error(
    `Timed out waiting for ${label} at ${url}: ${String(lastErr)}`,
  )
}

export default async function globalSetup(): Promise<void> {
  await waitFor("backend", `${API}/health`)
  await waitFor("frontend", APP)

  // Authenticate
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ADMIN),
  })
  if (!loginRes.ok) {
    throw new Error(`global-setup login failed: ${loginRes.status}`)
  }
  const { token } = (await loginRes.json()) as { token: string }
  const auth = { Authorization: `Bearer ${token}` }

  // Reset réalisations -> exactly the 6 pinned seed rows
  const existing = (await (await fetch(`${API}/realisations`)).json()) as {
    id: string
  }[]
  for (const r of existing) {
    await fetch(`${API}/realisations/${r.id}`, { method: "DELETE", headers: auth })
  }
  for (const r of SEED_REALISATIONS) {
    await fetch(`${API}/realisations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify({ ...r, pinned: true }),
    })
  }
}
