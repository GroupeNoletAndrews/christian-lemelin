"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, PushPin } from "@phosphor-icons/react";
import { useAdmin } from "@/lib/admin-context";
import { ImageManager } from "@/components/admin/ImageManager";

export default function RealisationFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string | undefined;
  const isEditMode = id && id !== "create";

  const {
    isAuthenticated,
    getRealisation,
    addRealisation,
    updateRealisation,
    pinnedCount,
    maxPinned,
  } = useAdmin();

  const [name, setName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [wasPinned, setWasPinned] = useState(false);
  const [error, setError] = useState("");

  // Load réalisation when editing
  useEffect(() => {
    if (isEditMode && id) {
      const r = getRealisation(id);
      if (r) {
        setName(r.name);
        setImages(r.images);
        setPinned(r.pinned);
        setWasPinned(r.pinned);
      }
    }
  }, [isEditMode, id, getRealisation]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  // How many *other* réalisations are already pinned
  const otherPinned = pinnedCount - (wasPinned ? 1 : 0);
  const pinLimitReached = otherPinned >= maxPinned;
  const canPin = !pinLimitReached;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Le nom de la réalisation est obligatoire.");
      return;
    }
    if (images.length === 0) {
      setError("Ajoutez au moins une image.");
      return;
    }

    const data = {
      name: name.trim(),
      images,
      pinned: pinned && canPin,
    };

    try {
      if (isEditMode && id) {
        await updateRealisation(id, data);
      } else {
        await addRealisation(data);
      }
      router.push("/admin/dashboard#realisations");
    } catch {
      setError("L'enregistrement a échoué. Veuillez réessayer.");
    }
  };

  const labelClass =
    "block font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-2";
  const fieldClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all font-sans";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link
            href="/admin/dashboard#realisations"
            aria-label="Retour"
            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-foreground"
          >
            <ArrowLeft size={22} />
          </Link>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-1">
              {isEditMode ? "Modifier" : "Nouvelle"}
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {isEditMode ? "Modifier la réalisation" : "Ajouter une réalisation"}
            </h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-surface rounded-2xl p-8 border border-border space-y-6"
        >
          {/* Name + Category */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Nom <span className="text-accent">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Comptoir bar — Hôtel Le Château"
              className={fieldClass}
              required
            />
          </div>

          {/* Images */}
          <ImageManager images={images} onChange={setImages} />

          {/* Pin to home */}
          <div className="rounded-xl border border-border bg-background p-4">
            <label
              className={`flex items-start gap-3 ${
                canPin ? "cursor-pointer" : "cursor-not-allowed opacity-60"
              }`}
            >
              <input
                type="checkbox"
                checked={pinned && canPin}
                disabled={!canPin}
                onChange={(e) => setPinned(e.target.checked)}
                className="mt-1 h-4 w-4 accent-accent"
              />
              <span>
                <span className="flex items-center gap-1.5 font-sans text-sm font-medium text-foreground">
                  <PushPin size={15} weight={pinned && canPin ? "fill" : "regular"} />
                  Épingler à la page d&apos;accueil
                </span>
                <span className="block mt-1 font-sans text-xs text-foreground-muted">
                  Les réalisations épinglées apparaissent dans la section
                  Réalisations de l&apos;accueil (max {maxPinned}).{" "}
                  {pinLimitReached && !wasPinned
                    ? "Limite atteinte — désépinglez-en une autre d'abord."
                    : `${pinnedCount}/${maxPinned} épinglée${
                        pinnedCount > 1 ? "s" : ""
                      }.`}
                </span>
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-sans">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/admin/dashboard#realisations"
              className="flex-1 flex items-center justify-center px-6 py-3 border border-border text-foreground rounded-full hover:bg-surface-elevated hover:border-foreground/30 transition-colors font-sans text-sm font-medium"
            >
              Annuler
            </Link>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors font-sans text-sm font-medium active:scale-[0.99]"
            >
              {isEditMode ? "Mettre à jour" : "Ajouter"} la réalisation
            </button>
          </div>
        </motion.form>
      </main>
    </div>
  );
}
