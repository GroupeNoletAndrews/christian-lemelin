<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design system

The UI follows a design system aligned with the Framer **OPUS** template. **[`DESIGN.md`](DESIGN.md) is the source of truth** for colors, typography, spacing, and component conventions.

- **Read `DESIGN.md` before creating or changing any UI.**
- **Update `DESIGN.md` (including its changelog) on every design change.**
- Use the design tokens from [`src/app/globals.css`](src/app/globals.css) (`bg-background`, `text-foreground`, `text-accent`, `border-border`, `font-sans`, `font-mono`…) — never hard-code hex values in components.
