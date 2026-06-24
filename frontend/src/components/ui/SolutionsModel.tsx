"use client"

import { Suspense, useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import {
  useGLTF,
  Environment,
  OrbitControls,
  ContactShadows,
  Html,
} from "@react-three/drei"
import * as THREE from "three"

const MODEL_URL = "/assets/home._zip.glb"

export type Hotspot = {
  id: string
  index: number
  title: string
  /** Position in the centred, normalised model space (model spans roughly ±1.2). */
  position: [number, number, number]
}

type SceneProps = {
  hotspots: Hotspot[]
  activeId: string | null
  onSelect: (id: string) => void
  compact: boolean
  shiftX: boolean
  fitScale: number
  reduce: boolean
}

/* ── A single 3D-anchored hotspot ───────────────────────────────────────────
   Anchored in the rotating model group so it orbits with the house. We fade
   it out (and disable clicks) when it faces away from the camera — a clean,
   raycast-free "occlusion" that reads as the marker dipping behind the model. */
function HotspotMarker({
  data,
  active,
  onSelect,
  reduce,
}: {
  data: Hotspot
  active: boolean
  onSelect: (id: string) => void
  reduce: boolean
}) {
  const anchorRef = useRef<THREE.Group>(null!)
  const elRef = useRef<HTMLButtonElement>(null)
  const { camera } = useThree()

  const tmp = useMemo(
    () => ({
      world: new THREE.Vector3(),
      normalW: new THREE.Vector3(),
      toCam: new THREE.Vector3(),
    }),
    [],
  )
  // Outward normal ≈ direction from model centre to the anchor.
  const normalLocal = useMemo(
    () => new THREE.Vector3(...data.position).normalize(),
    [data.position],
  )

  useFrame(() => {
    const g = anchorRef.current
    const el = elRef.current
    if (!g || !el) return
    g.getWorldPosition(tmp.world)
    tmp.normalW.copy(normalLocal).transformDirection(g.matrixWorld)
    tmp.toCam.copy(camera.position).sub(tmp.world).normalize()
    const facing = THREE.MathUtils.clamp(
      (tmp.normalW.dot(tmp.toCam) + 0.1) / 0.6,
      0,
      1,
    )
    const opacity = active ? 1 : 0.2 + 0.8 * facing
    el.style.opacity = opacity.toFixed(3)
    el.style.transform = `scale(${(active ? 1 : 0.72 + 0.28 * facing).toFixed(3)})`
    el.style.pointerEvents = active || facing > 0.25 ? "auto" : "none"
  })

  const label = `${String(data.index).padStart(2, "0")} · ${data.title}`

  return (
    <group ref={anchorRef} position={data.position}>
      <Html center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <button
          ref={elRef}
          type="button"
          onClick={() => onSelect(data.id)}
          aria-label={data.title}
          data-active={active || undefined}
          className="group/hs relative grid h-8 w-8 cursor-pointer place-items-center will-change-transform"
        >
          {/* radar pulse (idle markers only) */}
          {!reduce && !active && (
            <span className="absolute inset-1.5 animate-ping rounded-full bg-white/25" />
          )}
          {/* glow halo on active */}
          <span
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              active ? "bg-accent/25 blur-[2px]" : "bg-transparent"
            }`}
          />
          {/* core dot */}
          <span
            className={`relative h-3 w-3 rounded-full ring-2 transition-colors duration-300 ${
              active
                ? "bg-accent ring-accent/50"
                : "bg-white ring-white/40 group-hover/hs:bg-accent group-hover/hs:ring-accent/50"
            }`}
          />
          {/* label */}
          <span
            className={`pointer-events-none absolute left-1/2 top-[calc(100%+0.5rem)] -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur-md transition-all duration-300 ${
              active
                ? "border-accent/40 bg-accent text-white opacity-100"
                : "border-white/15 bg-black/50 text-white/85 opacity-0 group-hover/hs:opacity-100"
            }`}
          >
            {label}
          </span>
        </button>
      </Html>
    </group>
  )
}

function Model({ hotspots, activeId, onSelect, compact, shiftX, fitScale, reduce }: SceneProps) {
  const { scene } = useGLTF(MODEL_URL)
  const groupRef = useRef<THREE.Group>(null!)

  // Centre + normalise the model once (so hotspot positions live in ±1.2 space).
  // The GLB ships a flat white ground plane — we hide it so the house "floats"
  // on the dark stage (Blender-viewer look) grounded only by a soft contact shadow.
  useEffect(() => {
    const meshes: THREE.Mesh[] = []
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) meshes.push(m)
    })
    scene.updateMatrixWorld(true)
    // Identify the ground: the flattest (small world Y) mesh with the biggest
    // horizontal footprint, then hide it so the house floats on the dark stage.
    let ground: THREE.Mesh | null = null
    let bestArea = 0
    meshes.forEach((m) => {
      const s = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3())
      const area = s.x * s.z
      const flat = s.y < 0.15 * Math.max(s.x, s.z)
      if (flat && area > bestArea) {
        bestArea = area
        ground = m
      }
      const mat = m.material as THREE.MeshStandardMaterial
      if (mat && "envMapIntensity" in mat) mat.envMapIntensity = 0.85
    })
    if (ground) (ground as THREE.Mesh).visible = false

    const measure = () => {
      scene.updateMatrixWorld(true)
      const b = new THREE.Box3()
      meshes.forEach((m) => {
        if (m.visible) b.expandByObject(m)
      })
      return b
    }
    // Pass 1 — normalise scale from a clean baseline.
    scene.position.set(0, 0, 0)
    scene.scale.setScalar(1)
    const size = measure().getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    scene.scale.setScalar(fitScale / maxDim)
    // Pass 2 — recentre on the now-scaled bounds (origin = model centre).
    scene.position.sub(measure().getCenter(new THREE.Vector3()))
  }, [scene, fitScale])

  // "Se tasser" — when a card is open the model glides left + shrinks a touch
  // to cede space to the panel. Damped so it feels weighty, not snappy.
  useFrame((_, dt) => {
    const g = groupRef.current
    if (!g) return
    const targetX = compact && shiftX ? -0.19 * fitScale : 0
    const targetS = compact ? 0.9 : 1
    if (reduce) {
      g.position.x = targetX
      g.scale.setScalar(targetS)
      return
    }
    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 5, dt)
    const s = THREE.MathUtils.damp(g.scale.x, targetS, 5, dt)
    g.scale.setScalar(s)
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} dispose={null} />
      {hotspots.map((h) => (
        <HotspotMarker
          key={h.id}
          data={h}
          active={activeId === h.id}
          onSelect={onSelect}
          reduce={reduce}
        />
      ))}
    </group>
  )
}

export function SolutionsModel({
  hotspots,
  activeId,
  onSelect,
  compact,
  shiftX = true,
  fitScale = 2.4,
  liftFactor = 0.18,
  autoRotate = true,
  reduce = false,
}: {
  hotspots: Hotspot[]
  activeId: string | null
  onSelect: (id: string) => void
  compact: boolean
  shiftX?: boolean
  /** Largest model dimension in world units — raise to enlarge the GLB. */
  fitScale?: number
  /** Fraction of fitScale the look-at target sits below centre — lifts the
      subject up in frame (needed in wide stages, ~0 in tall mobile ones). */
  liftFactor?: number
  /** Gentle idle spin — disable while a side panel is being read. */
  autoRotate?: boolean
  reduce?: boolean
}) {
  return (
    <Canvas
      camera={{ position: [2.6, 1.85, 3.65], fov: 36 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 7, 3]} intensity={1.7} />
      <directionalLight position={[-5, 2, -3]} intensity={0.45} color="#9db4ff" />
      <Suspense fallback={null}>
        <Model
          hotspots={hotspots}
          activeId={activeId}
          onSelect={onSelect}
          compact={compact}
          shiftX={shiftX}
          fitScale={fitScale}
          reduce={reduce}
        />
        <Environment preset="city" />
        <ContactShadows
          position={[0, -0.34 * fitScale, 0]}
          opacity={0.5}
          scale={2.9 * fitScale}
          blur={2.6}
          far={1.1 * fitScale}
          color="#000000"
        />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        autoRotate={!reduce && autoRotate}
        autoRotateSpeed={0.5}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.54}
        target={[0, -liftFactor * fitScale, 0]}
      />
    </Canvas>
  )
}

useGLTF.preload(MODEL_URL)
