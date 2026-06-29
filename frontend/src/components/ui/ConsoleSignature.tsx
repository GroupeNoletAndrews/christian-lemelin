"use client"

import { useEffect } from "react"

/**
 * Signature studio dans la console du navigateur (clin d'œil façon site de
 * Lando Norris) : le wordmark "GROUPE NOLET·ANDREWS" est imprimé comme image
 * de fond d'un console.log (`background-image` + `padding`/`font-size`), suivi
 * d'une légende. Aucun rendu visible dans la page.
 *
 * Le logo est embarqué en data URI (base64) plutôt qu'en URL : DevTools ne
 * résout pas de façon fiable les URLs relatives d'image de fond en console.
 * L'image de fond n'est rendue que par Chromium/Edge ; la ligne de légende
 * texte s'affiche partout (Firefox, Safari) en repli.
 */

// Wordmark GNA détouré (fond transparent) — source: public/assets/logo-gna.png
const LOGO_DATA_URI = "data:image/png;base64,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"

export function ConsoleSignature() {
  useEffect(() => {
    if (typeof window === "undefined") return
    // Affichage unique, même au double-montage du mode strict (dev).
    const w = window as Window & { __gnaSignaturePrinted?: boolean }
    if (w.__gnaSignaturePrinted) return
    w.__gnaSignaturePrinted = true

    const ORANGE = "#FDB800" // point orange du logo GNA

    // Logo en image de fond — box ~414×80 (ratio du wordmark 750×145).
    const logoCss = [
      "font-size: 1px;",
      "line-height: 0;",
      "padding: 40px 207px;",
      `background-image: url(${LOGO_DATA_URI});`,
      "background-repeat: no-repeat;",
      "background-position: center;",
      "background-size: contain;",
    ].join(" ")

    console.log("%c ", logoCss)
    console.log(
      "%cConception & développement web%c · Groupe Nolet Andrews%c · noletandrews.ca",
      `color:${ORANGE};font-weight:700;font-size:13px;font-family:system-ui,sans-serif;letter-spacing:.02em;`,
      "color:#8a8f98;font-weight:400;font-size:12px;font-family:system-ui,sans-serif;",
      `color:${ORANGE};font-weight:500;font-size:12px;font-family:system-ui,sans-serif;`
    )
  }, [])

  return null
}
