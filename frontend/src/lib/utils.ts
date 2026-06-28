// Tiny `clsx`-style class combiner. We don't pull in `clsx` + `tailwind-merge`
// to keep the dependency surface small — this handles strings, numbers, arrays
// and `{ "class": condition }` objects, which is all our components use.
export type ClassValue =
  | string
  | number
  | null
  | boolean
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  for (const input of inputs) {
    if (!input) continue
    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input))
    } else if (Array.isArray(input)) {
      const inner = cn(...input)
      if (inner) out.push(inner)
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key)
      }
    }
  }
  return out.join(" ")
}
