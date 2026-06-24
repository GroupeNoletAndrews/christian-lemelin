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
import { filesToCompressedDataUrls } from "@/lib/image-utils";

interface ImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
}

/**
 * Upload, reorder, and remove the pictures of a réalisation.
 * The first image (index 0) is the cover. Images are stored as compressed
 * data URLs by the parent form.
 */
export function ImageManager({ images, onChange }: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsBusy(true);
    try {
      const added = await filesToCompressedDataUrls(Array.from(fileList));
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
        disabled={isBusy}
        className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-border bg-background text-foreground-muted hover:border-accent hover:text-foreground transition-colors disabled:opacity-60"
      >
        <UploadSimple size={22} />
        <span className="font-sans text-sm">
          {isBusy
            ? "Traitement des images..."
            : "Cliquez pour téléverser des images"}
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
                src={src}
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
