'use client'

import { useRef, useEffect, useState } from 'react'

interface TooltipState {
  visible: boolean
  x: number
  y: number
  country: string
  count: number
  percentage: number
}

interface ContributionData {
  country: string
  count: number
  percentage: number
}

export function WorldMapVisualizer({ data, campaignName }: { data: ContributionData[], campaignName?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    country: '',
    count: 0,
    percentage: 0,
  })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Create a map of country names to data
  const countryMap = new Map(
    data.map((d) => [d.country.toLowerCase(), d])
  )

  // Calculate max count for color intensity
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  // Get color intensity for a country (forest green gradient)
  const getCountryColor = (countryName: string): string => {
    const countryData = countryMap.get(countryName.toLowerCase())
    if (!countryData) return '#f3f4f6'
    const intensity = countryData.count / maxCount
    return `hsl(150, 65%, ${90 - intensity * 50}%)`
  }

  // Handle mouse down for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle zoom with wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(1, Math.min(4, zoom * delta))
    setZoom(newZoom)
  }

  // Handle country hover with tooltip
  const handleCountryHover = (
    e: React.MouseEvent<SVGPathElement>,
    countryName: string
  ) => {
    const countryData = countryMap.get(countryName.toLowerCase())
    if (countryData && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        country: countryName,
        count: countryData.count,
        percentage: countryData.percentage,
      })
    }
  }

  const handleCountryLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }))
  }

  // Load SVG and initialize interactivity
  useEffect(() => {
    const loadSVG = async () => {
      if (!svgRef.current) return

      try {
        const response = await fetch('/images/world.svg')
        const svgText = await response.text()
        svgRef.current.innerHTML = svgText

        // Apply colors and interactivity to loaded paths
        const paths = svgRef.current.querySelectorAll('path')
        paths.forEach((path) => {
      const countryName = path.getAttribute('name')
      if (countryName) {
        const color = getCountryColor(countryName)
        path.setAttribute('fill', color)
        path.setAttribute('stroke', '#e5e7eb')
        path.setAttribute('stroke-width', '0.5')

        const hasData = countryMap.has(countryName.toLowerCase())
        if (hasData) {
          path.style.cursor = 'pointer'
          path.style.transition = 'all 0.2s ease'

          path.addEventListener('mouseenter', (evt) => {
            handleCountryHover(evt as any, countryName)
            path.style.fill = 'hsl(150, 75%, 45%)'
            path.style.filter = 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.4))'
          })

          path.addEventListener('mouseleave', () => {
            handleCountryLeave()
            path.style.fill = getCountryColor(countryName)
            path.style.filter = 'none'
          })

          path.addEventListener('mousemove', (evt) => {
            if (tooltip.country === countryName) {
              const rect = svgRef.current?.getBoundingClientRect()
              if (rect) {
                setTooltip((prev) => ({
                  ...prev,
                  x: evt.clientX - rect.left,
                  y: evt.clientY - rect.top,
                }))
              }
            }
          })
        }
      }
    })
      } catch (err) {
        console.error('[v0] Failed to load world map SVG:', err)
      }
    }

    loadSVG()
  }, [data, countryMap, tooltip.country])

  return (
    <div className="w-full rounded-lg border border-border/50 bg-background p-2 sm:p-4">
      <div
        className="relative w-full overflow-hidden rounded-md bg-slate-50 dark:bg-slate-900"
        style={{
          aspectRatio: '2000 / 857',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 2000 857"
          className="h-full w-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease',
          }}
          xmlns="http://www.w3.org/2000/svg"
        />

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="pointer-events-none absolute z-20 rounded-lg border border-border bg-background p-2 text-xs shadow-lg sm:p-3 sm:text-sm"
            style={{
              left: `${tooltip.x + 10}px`,
              top: `${tooltip.y + 10}px`,
              maxWidth: '200px',
            }}
          >
            <div className="font-semibold text-foreground">{tooltip.country}</div>
            <div className="mt-1 space-y-1 text-muted-foreground">
              <div>
                <span className="font-medium">{tooltip.count}</span> couplet
                {tooltip.count !== 1 ? 's' : ''}
              </div>
              <div>
                <span className="font-medium">
                  {tooltip.percentage.toFixed(1)}%
                </span>{' '}
                of total
              </div>
            </div>
          </div>
        )}

        {/* Controls hint */}
        <div className="absolute bottom-2 right-2 z-10 rounded bg-background/80 p-2 text-xs text-muted-foreground backdrop-blur-sm sm:bottom-3 sm:right-3">
          <div>Scroll to zoom</div>
          <div>Drag to pan</div>
        </div>
      </div>
    </div>
  )
}
