-- Add admin-controlled ordering to réalisations.
ALTER TABLE "realisations" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing rows by created_at (newest first) to match the prior display order.
WITH ordered AS (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "created_at" DESC) - 1) AS rn
  FROM "realisations"
)
UPDATE "realisations" r
SET "position" = o.rn
FROM ordered o
WHERE r."id" = o."id";

-- CreateIndex
CREATE INDEX "realisations_position_idx" ON "realisations"("position");
