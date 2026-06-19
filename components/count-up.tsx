"use client"

import { useEffect, useRef, useState } from "react"

interface CountUpProps {
  end: number
  duration?: number
  className?: string
}

// Animated rolling number that counts up to `end` once it scrolls into view.
export function CountUp({ end, duration = 1600, className }: CountUpProps) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (prefersReduced) {
      setValue(end)
      return
    }

    const run = () => {
      if (startedRef.current) return
      startedRef.current = true

      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        // easeOutCubic for a smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(eased * end))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run()
            observer.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString()}
    </span>
  )
}
