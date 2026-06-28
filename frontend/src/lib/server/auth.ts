import type { User } from "@supabase/supabase-js"
import { AppError } from "./http"
import { supabaseServer } from "@/lib/supabase/server"
import { isAllowedAdmin } from "@/lib/auth-allowlist"

export { isAllowedAdmin }

/**
 * The real authorization boundary — call at the top of every protected route
 * handler. Reads the Supabase session from cookies, validates it against the
 * Auth server, and throws AppError(401) when there's no allowed admin.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await supabaseServer()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !isAllowedAdmin(user)) throw new AppError(401, "Non autorisé")
  return user!
}
