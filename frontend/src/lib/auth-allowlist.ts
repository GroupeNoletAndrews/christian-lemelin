import type { User } from "@supabase/supabase-js"

// Pure, dependency-free admin allowlist — safe to import from both the proxy
// (no next/headers) and server route handlers.
//
// Supabase Auth answers "who are you"; we still decide "are you allowed in
// /admin". With public sign-up disabled, every Supabase user is an admin — but
// if ADMIN_EMAILS is set (comma-separated), only those addresses pass. A
// defence-in-depth second gate.
function allowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowedAdmin(user: User | null | undefined): boolean {
  if (!user) return false
  const allow = allowedEmails()
  if (allow.length === 0) return true
  return !!user.email && allow.includes(user.email.toLowerCase())
}
