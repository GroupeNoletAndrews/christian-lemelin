import * as yup from "yup"

// Validation client des formulaires — Yup partout, JAMAIS la validation du
// navigateur (les <form> sont noValidate, aucun attribut required/pattern).
// Chaque champ affiche son erreur sous l'input (pattern AdminLogin).

/**
 * Valide `values` contre un schéma Yup et retourne une map champ → message
 * (vide = valide). Toutes les erreurs sont collectées (abortEarly: false),
 * seule la première par champ est gardée.
 */
export async function yupErrors(
  schema: yup.AnyObjectSchema,
  values: unknown,
): Promise<Record<string, string>> {
  try {
    await schema.validate(values, { abortEarly: false })
    return {}
  } catch (err) {
    const out: Record<string, string> = {}
    if (err instanceof yup.ValidationError) {
      for (const e of err.inner.length ? err.inner : [err]) {
        if (e.path && !out[e.path]) out[e.path] = e.message
      }
    }
    return out
  }
}

/** Formulaire « Nous joindre » (/contact). */
export const contactSchema = yup.object({
  name: yup.string().trim().required("Entrez votre nom."),
  email: yup.string().trim().required("Entrez votre courriel.").email("Courriel invalide."),
  message: yup.string().trim().required("Décrivez votre projet."),
})

/** Candidature à un emploi (ApplyModal). */
export const applySchema = yup.object({
  name: yup.string().trim().required("Entrez votre nom."),
  email: yup.string().trim().required("Entrez votre courriel.").email("Courriel invalide."),
})

/** Création / édition d'un emploi (admin). */
export const jobSchema = yup.object({
  title: yup.string().trim().required("Entrez le titre du poste."),
  department: yup.string().trim().required("Entrez le département."),
  location: yup.string().trim().required("Entrez la localisation."),
  description: yup.string().trim().required("Décrivez le poste."),
})

/** Changement de mot de passe (admin). */
export const passwordSchema = yup.object({
  password: yup
    .string()
    .required("Entrez un mot de passe.")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  confirm: yup
    .string()
    .required("Confirmez le mot de passe.")
    .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas."),
})
