"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "motion/react"
import { ArrowDown } from "@phosphor-icons/react"

// Module-level: survives client-side navigation, resets on full page reload
let heroHasPlayed = false

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [skipVideo] = useState(() => heroHasPlayed)

  useEffect(() => {
    heroHasPlayed = true

    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.volume = 0

    const enforceMute = () => {
      video.muted = true
      video.volume = 0
    }
    video.addEventListener("volumechange", enforceMute)
    return () => video.removeEventListener("volumechange", enforceMute)
  }, [])

  return (
    <section data-header-theme="light" className="relative w-full bg-[#f3f3f1]">

      {/* Video: fills full width at natural aspect ratio */}
      {!skipVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          className="block w-full h-auto"
          aria-hidden="true"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      ) : (
        <div className="min-h-[100dvh] bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200" />
      )}

      {/* Bottom fade — blends into next section */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 55%, rgb(243 243 241 / 0.60) 78%, #f3f3f1 100%)",
        }}
      />

      {/* Scroll indicator — dark on light */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: skipVideo ? 0.4 : 5.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-[11px] text-white/70 font-sans tracking-[0.28em] uppercase">
          Défiler
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        >
          <ArrowDown size={20} weight="light" className="text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  )
}
