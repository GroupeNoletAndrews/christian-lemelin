-- Drop the réalisations draft table. The draft → preview → publish backbone it
-- supported was superseded by the STAGED client-side editing model (edits held
-- in the browser as File + data: URL, previewed via postMessage, persisted only
-- on publish), so nothing reads or writes section_drafts anymore. Static-section
-- overrides use section_images (no draft column). See SectionImage in schema.prisma.

-- DropTable
DROP TABLE IF EXISTS "section_drafts";
