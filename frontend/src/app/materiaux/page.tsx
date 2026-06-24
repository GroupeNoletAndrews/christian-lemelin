import { redirect } from "next/navigation"

// Pas de page d'index « /materiaux » : la vue d'ensemble des matériaux vit sur
// /fabrication (showcase). On redirige pour éviter un 404 sur l'URL nue.
export default function MateriauxIndex() {
  redirect("/fabrication")
}
