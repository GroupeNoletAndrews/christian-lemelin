-- « Mobilier hospitalier » n'est plus une ligne de l'accordéon Savoir-faire :
-- c'est une section à part entière (registre « mobilier-hospitalier »). Les
-- résolveurs parcourent le REGISTRE, pas la base — sans cette migration, une
-- photo déjà publiée dans l'emplacement savoir-faire/mobilier deviendrait
-- invisible (ni sur le site, ni dans l'atelier de contenu) tout en occupant du
-- stockage. On la déplace donc vers la photo principale de la nouvelle section.
--
-- `image_key` est stocké par ligne (il n'est pas déduit de section/slot), donc
-- l'objet de stockage existant continue de servir tel quel ; la prochaine
-- publication écrira sous la nouvelle clé.
--
-- Le cadrage (`object_position` / `zoom`) est remis à zéro : il avait été réglé
-- pour un cadre 16/10 plein cadre, la nouvelle photo principale est en 4/5.

UPDATE "section_images" AS s
SET "section" = 'mobilier-hospitalier',
    "slot" = 'poste-soins',
    "object_position" = NULL,
    "zoom" = NULL,
    "is_grayscale" = NULL
WHERE s."section" = 'savoir-faire'
  AND s."slot" = 'mobilier'
  AND NOT EXISTS (
    SELECT 1
    FROM "section_images" t
    WHERE t."section" = 'mobilier-hospitalier'
      AND t."slot" = 'poste-soins'
  );

-- Si la cible existait déjà, la ligne d'origine est désormais inatteignable
-- (aucun emplacement « mobilier » dans le registre) : on la supprime.
DELETE FROM "section_images"
WHERE "section" = 'savoir-faire'
  AND "slot" = 'mobilier';
