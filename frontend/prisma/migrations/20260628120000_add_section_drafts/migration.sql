-- Pending (unpublished) edits to a public site section, keyed by section id
-- (e.g. "realisations"). Merged over live data only in admin preview; applied
-- on publish. See SectionDraft in schema.prisma.

-- CreateTable
CREATE TABLE "section_drafts" (
    "section" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "section_drafts_pkey" PRIMARY KEY ("section")
);
