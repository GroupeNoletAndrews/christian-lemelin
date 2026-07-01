-- Published image override per static-section slot. Absence of a row = code
-- default. Drafts are staged client-side, so no draft column. See SectionImage.

-- CreateTable
CREATE TABLE "section_images" (
    "section" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "image_key" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "section_images_pkey" PRIMARY KEY ("section","slot")
);

-- CreateIndex
CREATE INDEX "section_images_section_idx" ON "section_images"("section");
