"use client"

import { useRef, useEffect, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Environment } from "@react-three/drei"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import * as THREE from "three"

gsap.registerPlugin(ScrollTrigger)

function Model({ rotationRef }: { rotationRef: React.MutableRefObject<number> }) {
  const { scene } = useGLTF("/models/test-model.glb")
  const groupRef = useRef<THREE.Group>(null!)

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    scene.position.sub(center)
    scene.scale.setScalar(2.4 / maxDim)
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = rotationRef.current * Math.PI * 2
  })

  return <primitive ref={groupRef} object={scene} dispose={null} />
}

export function ModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rotationRef = useRef(0)

  useEffect(() => {
    if (!containerRef.current) return
    const card = containerRef.current.closest(".sf-card") as HTMLElement
    if (!card) return

    const st = ScrollTrigger.create({
      trigger: card,
      start: "top top",
      end: "+=" + window.innerHeight,
      scrub: 1.5,
      onUpdate: (self) => {
        rotationRef.current = self.progress
      },
    })

    return () => st.kill()
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.4, 5], fov: 42 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[6, 8, 6]} intensity={2.5} />
        <directionalLight position={[-4, 2, -4]} intensity={0.6} />
        <Suspense fallback={null}>
          <Model rotationRef={rotationRef} />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload("/models/test-model.glb")
