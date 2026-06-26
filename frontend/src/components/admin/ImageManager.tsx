"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Trash,
  UploadSimple,
  Star,
} from "@phosphor-icons/react";
import { uploadRealisationImages } from "@/lib/uploads";
import { mediaUrl, realisationImageIndex } from "@/lib/media";

interface ImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  /** Project name — pictures are stored as <project-slug>-<n>.jpg. */
  projectName: string;
}

/**
 * Upload, reorder, and remove the pictures of a réalisation.
 * The first image (index 0) is the cover. `images` holds Supabase storage keys
 * (photos/realisations/<slug>-<n>.jpg), resolved to URLs with mediaUrl().
 */
export function ImageManager({ images, onChange, projectName }: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isBusy, setIsBusy] = useState(false);
  const hasName = projectName.trim().length > 0;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !hasName) return;
    setIsBusy(true);
    try {
      // Number new pictures from the HIGHEST existing number (not the count) so
      // removing a middle photo then adding one never reuses/overwrites a number.
      const highest = images.reduce(
        (max, img) => Math.max(max, realisationImageIndex(img)),
        0,
      );
      const added = await uploadRealisationImages(
        Array.from(fileList),
        projectName,
        highest,
      );
      if (added.length) onChange([...images, ...added]);
    } finally {
      setIsBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
          Images <span className="text-accent">*</span>
        </label>
        <span className="font-mono text-[11px] text-foreground-muted">
          {images.length} image{images.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Upload zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isBusy || !hasName}
        className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-border bg-background text-foreground-muted hover:border-accent hover:text-foreground transition-colors disabled:opacity-60 disabled:hover:border-border disabled:hover:text-foreground-muted"
      >
        <UploadSimple size={22} />
        <span className="font-sans text-sm">
          {isBusy
            ? "Traitement des images..."
            : hasName
              ? "Cliquez pour téléverser des images"
              : "Entrez d'abord le nom de la réalisation"}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
          JPEG, PNG, WebP
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Thumbnails */}
      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((src, i) => (
            <li
              key={`${i}-${src.slice(-16)}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface-elevated"
            >
              <Image
                src={mediaUrl(src)}
                alt={`Image ${i + 1}`}
                fill
                unoptimized
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />

              {/* Cover badge */}
              {i === 0 && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-white">
                  <Star size={10} weight="fill" />
                  Couverture
                </span>
              )}

              {/* Controls */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-foreground/70 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label="Déplacer vers la gauche"
                    className="p-1 rounded text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === images.length - 1}
                    aria-label="Déplacer vers la droite"
                    className="p-1 rounded text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Supprimer l'image"
                  className="p-1 rounded text-white hover:bg-red-500/70"
                >
                  <Trash size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <p className="mt-2 font-sans text-xs text-foreground-muted">
          La première image sert de couverture. Utilisez les flèches pour
          réordonner.
        </p>
      )}
    </div>
  );
}
