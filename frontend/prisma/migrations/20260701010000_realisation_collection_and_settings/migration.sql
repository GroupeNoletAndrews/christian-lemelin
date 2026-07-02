-- Independent home/collection membership for réalisations.
ALTER TABLE "realisations" ADD COLUMN "in_collection" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX "realisations_in_collection_idx" ON "realisations" ("in_collection");

-- Generic key/value site settings (layout choices, etc.).
CREATE TABLE "site_settings" (
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);
