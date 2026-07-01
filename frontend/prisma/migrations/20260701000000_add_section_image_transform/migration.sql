-- Non-destructive per-slot presentation for static-section images.
-- All columns are nullable so existing rows keep working (null = code default).
ALTER TABLE "section_images"
  ADD COLUMN "object_position" TEXT,
  ADD COLUMN "zoom" DOUBLE PRECISION,
  ADD COLUMN "is_grayscale" BOOLEAN,
  ADD COLUMN "border_radius" TEXT,
  ADD COLUMN "border_style" TEXT;
