### Image Strategy

- All images use **picsum.photos** placeholder service with semantic seeds
- Allows development without real photography
- **Must be replaced before production** with actual assets

---

## Design System

**Brand Colors**:

- Primary Accent: `#f5a020` (warm gold/orange)
- Accent Hover: `#d4881a`
- Background: `#f3f3f1` (off-white)
- Foreground: `#111113` (near-black)
- Surface: `#e8e8e6`

**Typography**:

- Display: Bebas Neue (headers)
- Body: Barlow Condensed (navigation, text)
- Mono: Geist Mono (code/technical info)

---

## Current Development Status

| Aspect                  | Status            | Notes                                                         |
| ----------------------- | ----------------- | ------------------------------------------------------------- |
| **Core Layout**         | ✅ Complete       | All sections functional                                       |
| **Design System**       | ✅ Complete       | Colors, fonts, spacing defined                                |
| **Animations**          | ✅ Complete       | GSAP + Motion working                                         |
| **3D Setup**            | ⚠️ Partial        | Fiber/Three.js ready; using test model                        |
| **Placeholder Content** | ⚠️ In Use         | 6 projects + materials + sectors = 15 images                  |
| **Page Routes**         | ❌ Missing        | 8 pages not created yet                                       |
| **Contact Form**        | ❌ Missing        | `/contact` page needs implementation                          |
| **Mobile Testing**      | ⚠️ Untested       | Layout responsive but needs device verification               |
| **Accessibility**       | ⚠️ Basic          | Reduced-motion checks in place; missing ARIA labels           |
| **Dark Mode**           | ⚠️ Setup Only     | next-themes installed but not implemented                     |
| **CMS**                 | ❌ Not Integrated | All content hardcoded                                         |
| **Analytics**           | ❌ Not Integrated | No GA or tracking                                             |
| **SEO**                 | ⚠️ Basic          | Meta tags present; missing og:image, structured data, sitemap |

---

## Known TODOs & Issues

1. **Placeholder Images** (4 locations):
   - `Realisations.tsx:93` — 6 project images
   - `Materiaux.tsx:90, 154` — 5 material images
   - `Solutions.tsx:82` — 4 sector images

2. **Missing Pages** (8 routes referenced but not created):
   - `/solutions` — Solutions/services detail
   - `/fabrication` — Custom fabrication overview
   - `/realisations` — Full projects portfolio
   - `/a-propos` — Company about/history
   - `/emplois` — Job postings
   - `/contact` — Contact form
   - `/installations` — Installation services detail

3. **3D Model** — Replace `test-model.glb` with actual product/capability showcase

4. **Performance** — Hero video not lazy-loaded; external image CDN dependency (picsum.photos)

5. **Incomplete Features**:
   - Dark mode UI (infrastructure exists)
   - Full accessibility audit
   - Error boundaries
   - Dynamic content from CMS

---

## Configuration Files

- **next.config.ts** — Image optimization (allows picsum.photos)
- **tsconfig.json** — TypeScript strict mode, path alias `@/*` → `./src/*`
- **eslint.config.mjs** — ESLint 9 flat config (core-web-vitals + TypeScript)
- **postcss.config.mjs** — Tailwind PostCSS plugin
- **globals.css** — Brand colors, typography CSS variables

---

## Priority Implementation Roadmap

### Phase 1: Content Replacement

- [ ] Source actual project photography (6 projects)
- [ ] Source material close-ups (5 materials)
- [ ] Source sector/market photography (4 sectors)
- [ ] Replace test 3D model with real product

### Phase 2: Page Creation

- [ ] Create `/solutions` page (services detail)
- [ ] Create `/contact` page (contact form with submission)
- [ ] Create `/realisations` page (full portfolio grid)
- [ ] Create `/a-propos` page (about/company history)
- [ ] Create `/emplois` page (job listings)
- [ ] Create `/fabrication` page (fabrication process/capabilities)
- [ ] Create `/installations` page (installation services)

### Phase 3: Enhancement

- [ ] Integrate CMS (Contentful/Sanity/Strapi) for content management
- [ ] Implement dark mode UI across all components
- [ ] Add SEO improvements (og:image, structured data, sitemap.xml)
- [ ] Implement analytics (Google Analytics or similar)
- [ ] Mobile device testing & optimization
- [ ] Accessibility audit & ARIA labels
- [ ] Contact form submission backend

### Phase 4: Optimization

- [ ] Image optimization pipeline
- [ ] Video lazy-loading
- [ ] Performance monitoring
- [ ] Error boundaries & fallback pages

---

## Contact Information (Hardcoded)

- **Company**: Entreprises Christian Lemelin
- **Phone**: 418-682-1750
- **Email**: (referenced in Footer but specific address in code)
- **Location**: Quebec, Canada
