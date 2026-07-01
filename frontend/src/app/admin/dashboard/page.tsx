"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { imgSrc } from "@/lib/media";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Trash,
  PencilSimple,
  Plus,
  SignOut,
  ArrowLeft,
  DotsSixVertical,
  PushPin,
  ImageSquare,
} from "@phosphor-icons/react";
import { useAdmin } from "@/lib/admin-context";
import { useConfirm, useToast } from "@/components/admin/FeedbackProvider";

const typeLabel = (type: string) =>
  type === "full-time"
    ? "Temps plein"
    : type === "part-time"
      ? "Temps partiel"
      : "Contrat";

type Tab = "emplois" | "realisations";

export default function AdminDashboard() {
  const router = useRouter();
  const {
    isAuthenticated,
    authLoading,
    email,
    jobs,
    logout,
    deleteJob,
    realisations,
    pinnedCount,
    maxPinned,
    togglePinned,
    deleteRealisation,
    reorderRealisations,
  } = useAdmin();
  const confirm = useConfirm();
  const toast = useToast();

  // Land on the réalisations tab when returning from a réalisation action
  // (e.g. router.push("/admin/dashboard#realisations")). Read synchronously
  // and SSR-safely so we never call setState inside an effect.
  const [tab, setTab] = useState<Tab>(() =>
    typeof window !== "undefined" && window.location.hash === "#realisations"
      ? "realisations"
      : "emplois"
  );

  useEffect(() => {
    // Wait for the initial session check — otherwise a refresh bounces to login
    // before getUser() restores the persisted Supabase session.
    if (!authLoading && !isAuthenticated) {
      router.push("/admin");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  const handleDeleteJob = async (id: string) => {
    const ok = await confirm({
      title: "Supprimer ce poste ?",
      message: "Cette action est irréversible.",
      confirmLabel: "Supprimer",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteJob(id);
      toast("Poste supprimé.");
    } catch {
      toast("La suppression a échoué. Veuillez réessayer.", "error");
    }
  };

  const handleDeleteRealisation = async (id: string) => {
    const ok = await confirm({
      title: "Supprimer cette réalisation ?",
      message: "La réalisation et ses images seront supprimées définitivement.",
      confirmLabel: "Supprimer",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteRealisation(id);
      toast("Réalisation supprimée.");
    } catch {
      toast("La suppression a échoué. Veuillez réessayer.", "error");
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const okPin = await togglePinned(id);
      if (!okPin) {
        toast(
          `Limite atteinte : maximum ${maxPinned} réalisations épinglées à l'accueil.`,
          "error",
        );
      }
    } catch {
      toast("L'action a échoué. Veuillez réessayer.", "error");
    }
  };

  const stats = [
    { label: "Total d'emplois", value: jobs.length },
    { label: "Réalisations", value: realisations.length },
    { label: "Épinglées à l'accueil", value: `${pinnedCount}/${maxPinned}` },
  ];

  const tabClass = (active: boolean) =>
    `px-4 py-2 rounded-full font-sans text-sm transition-colors ${
      active
        ? "bg-foreground text-white"
        : "text-foreground-muted hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted hover:text-foreground transition-colors mb-2"
              >
                <ArrowLeft size={12} />
                Retour au site
              </Link>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Tableau de bord
              </h1>
              <p className="text-foreground-muted font-sans text-sm mt-1">
                Bienvenue, <span className="text-foreground">{email}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard/content"
                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors font-sans text-sm font-medium active:scale-[0.99]"
              >
                <ImageSquare size={18} />
                Contenu du site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-full hover:bg-surface-elevated hover:border-foreground/30 transition-colors font-sans text-sm"
              >
                <SignOut size={18} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-surface rounded-2xl p-6 border border-border">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-3">
                {s.label}
              </p>
              <p className="font-display text-4xl font-semibold text-foreground tracking-tight">
                {s.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border border-border rounded-full p-1 w-fit bg-surface">
          <button className={tabClass(tab === "emplois")} onClick={() => setTab("emplois")}>
            Emplois
          </button>
          <button
            className={tabClass(tab === "realisations")}
            onClick={() => setTab("realisations")}
          >
            Réalisations
          </button>
        </div>

        {tab === "emplois" ? (
          <JobsPanel
            jobs={jobs}
            onDelete={handleDeleteJob}
            typeLabel={typeLabel}
          />
        ) : (
          <RealisationsPanel
            realisations={realisations}
            onTogglePin={handleTogglePin}
            onDelete={handleDeleteRealisation}
            onReorder={reorderRealisations}
          />
        )}
      </main>
    </div>
  );
}

/* ---------------- Jobs panel ---------------- */

function JobsPanel({
  jobs,
  onDelete,
  typeLabel,
}: {
  jobs: ReturnType<typeof useAdmin>["jobs"];
  onDelete: (id: string) => void;
  typeLabel: (t: string) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">
          Emplois
        </h2>
        <Link
          href="/admin/dashboard/jobs/create/edit"
          className="flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors font-sans text-sm font-medium active:scale-[0.99]"
        >
          <Plus size={18} weight="bold" />
          Ajouter un emploi
        </Link>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-foreground-muted font-sans mb-5">Aucun emploi trouvé</p>
            <Link
              href="/admin/dashboard/jobs/create/edit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors font-sans text-sm font-medium"
            >
              <Plus size={16} weight="bold" />
              Créer le premier emploi
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  {["Titre", "Département", "Type", "Localisation"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="text-center px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border last:border-0 hover:bg-background transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-sans font-medium text-foreground">{job.title}</p>
                    </td>
                    <td className="px-6 py-4 font-sans text-foreground-muted">
                      {job.department}
                    </td>
                    <td className="px-6 py-4 font-sans text-foreground-muted">
                      {typeLabel(job.type)}
                    </td>
                    <td className="px-6 py-4 font-sans text-foreground-muted">
                      {job.location}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/dashboard/jobs/${job.id}/edit`}
                          aria-label="Modifier"
                          className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-foreground"
                        >
                          <PencilSimple size={18} />
                        </Link>
                        <button
                          onClick={() => onDelete(job.id)}
                          aria-label="Supprimer"
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------- Réalisations panel ------------- */

function RealisationsPanel({
  realisations,
  onTogglePin,
  onDelete,
  onReorder,
}: {
  realisations: ReturnType<typeof useAdmin>["realisations"];
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}) {
  // Local working order so drag-and-drop stays smooth. The backend list is the
  // source of truth: when it changes (add / delete / pin / revert) we re-sync the
  // working order during render — React's documented pattern for prop-driven state.
  const [order, setOrder] = useState(realisations);
  const [prevSource, setPrevSource] = useState(realisations);
  if (realisations !== prevSource) {
    setPrevSource(realisations);
    setOrder(realisations);
  }

  const sensors = useSensors(
    // Small activation distance so a click on the handle doesn't start a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.findIndex((r) => r.id === active.id);
    const newIndex = order.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next); // optimistic, local
    onReorder(next.map((r) => r.id)); // persist; context reverts on API failure
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">
          Réalisations
        </h2>
        <Link
          href="/admin/dashboard/realisations/create/edit"
          className="flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors font-sans text-sm font-medium active:scale-[0.99]"
        >
          <Plus size={18} weight="bold" />
          Ajouter une réalisation
        </Link>
      </div>

      {realisations.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border text-center py-16">
          <p className="text-foreground-muted font-sans mb-5">
            Aucune réalisation pour le moment
          </p>
          <Link
            href="/admin/dashboard/realisations/create/edit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors font-sans text-sm font-medium"
          >
            <Plus size={16} weight="bold" />
            Ajouter la première réalisation
          </Link>
        </div>
      ) : (
        <>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted mb-4">
            Glissez-déposez pour réordonner
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={order.map((r) => r.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {order.map((r) => (
                  <SortableRealisationCard
                    key={r.id}
                    realisation={r}
                    onTogglePin={onTogglePin}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}

function SortableRealisationCard({
  realisation: r,
  onTogglePin,
  onDelete,
}: {
  realisation: ReturnType<typeof useAdmin>["realisations"][number];
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: r.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-surface rounded-2xl border overflow-hidden flex flex-col ${
        isDragging ? "border-accent/40 shadow-xl" : "border-border"
      }`}
    >
      <div className="relative aspect-[4/3] bg-surface-elevated">
        {r.images[0] ? (
          <Image
            src={imgSrc(r.images[0], r.updatedAt.getTime())}
            alt={r.name}
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-foreground-muted">
            <ImageSquare size={28} />
          </div>
        )}
        {r.pinned && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-white">
            <PushPin size={11} weight="fill" />
            Accueil
          </span>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-foreground/70 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-white">
          <ImageSquare size={11} />
          {r.images.length}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <h3 className="font-display text-lg font-medium text-foreground leading-tight">
            {r.name}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Drag handle — dragging is bound to this grip so the action
              buttons stay clickable. */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Glisser pour réordonner"
            className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors cursor-grab active:cursor-grabbing touch-none"
          >
            <DotsSixVertical size={18} />
          </button>
          <button
            onClick={() => onTogglePin(r.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-sans transition-colors ${
              r.pinned
                ? "bg-accent text-white hover:bg-accent-hover"
                : "border border-border text-foreground hover:bg-surface-elevated"
            }`}
          >
            <PushPin size={14} weight={r.pinned ? "fill" : "regular"} />
            {r.pinned ? "Épinglée" : "Épingler"}
          </button>
          <Link
            href={`/admin/dashboard/realisations/${r.id}/edit`}
            aria-label="Modifier"
            className="ml-auto p-2 hover:bg-surface-elevated rounded-lg transition-colors text-foreground"
          >
            <PencilSimple size={18} />
          </Link>
          <button
            onClick={() => onDelete(r.id)}
            aria-label="Supprimer"
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
