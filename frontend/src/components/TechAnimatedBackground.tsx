'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from './ThemeProvider'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseAlpha: number
  colorIndex: number
  shape: 'circle' | 'cross' | 'diamond'
  size: number
}

interface DataPacket {
  fromIndex: number
  toIndex: number
  progress: number
  speed: number
  colorIndex: number
}

export function TechAnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { theme } = useTheme()
  const [isDark, setIsDark] = useState<boolean>(true)

  // Sync theme with DOM/ThemeProvider
  useEffect(() => {
    const checkDark = () => {
      const hasDark = document.documentElement.classList.contains('dark')
      setIsDark(hasDark || theme === 'dark')
    }

    checkDark()

    const observer = new MutationObserver(() => {
      checkDark()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Palette configurations for both themes
    // Dark: Electric Cyan, Neon Violet, Tech Indigo
    // Light: Deep Cobalt, Vibrant Sky Blue, Tech Teal
    const palettes = {
      dark: {
        nodeColors: ['#38bdf8', '#818cf8', '#c084fc', '#22d3ee'],
        lineColor: 'rgba(56, 189, 248, ', // append alpha
        packetColors: ['#ffffff', '#38bdf8', '#a5f3fc', '#c084fc'],
        mouseLineColor: 'rgba(129, 140, 248, ',
        glowColor: '#38bdf8',
        crossColor: 'rgba(148, 163, 184, 0.4)',
      },
      light: {
        nodeColors: ['#4f46e5', '#0284c7', '#0891b2', '#6366f1'],
        lineColor: 'rgba(79, 70, 229, ', // append alpha
        packetColors: ['#4338ca', '#0284c7', '#312e81', '#0f766e'],
        mouseLineColor: 'rgba(2, 132, 199, ',
        glowColor: '#4f46e5',
        crossColor: 'rgba(100, 116, 139, 0.35)',
      },
    }

    // Determine particle count based on screen size (responsive)
    const particleCount = width < 768 ? 32 : width < 1200 ? 55 : 75
    const maxDistance = width < 768 ? 100 : 135
    const mouseRadius = 150

    const particles: Particle[] = []
    const packets: DataPacket[] = []

    for (let i = 0; i < particleCount; i++) {
      const shapeRand = Math.random()
      const shape: 'circle' | 'cross' | 'diamond' = 
        shapeRand > 0.85 ? 'cross' : shapeRand > 0.7 ? 'diamond' : 'circle'

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        radius: Math.random() * 1.8 + 1.2,
        size: Math.random() * 3 + 2.5,
        baseAlpha: Math.random() * 0.45 + 0.35,
        colorIndex: Math.floor(Math.random() * 4),
        shape,
      })
    }

    // Manage occasional data packets traveling along links
    const spawnPacket = () => {
      if (packets.length > (width < 768 ? 8 : 16)) return
      if (particles.length < 2) return

      const i = Math.floor(Math.random() * particles.length)
      // Find a near neighbor
      let bestNeighbor = -1
      let minD = Infinity
      for (let j = 0; j < particles.length; j++) {
        if (i === j) continue
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.hypot(dx, dy)
        if (dist < maxDistance && dist < minD) {
          minD = dist
          bestNeighbor = j
        }
      }

      if (bestNeighbor !== -1) {
        packets.push({
          fromIndex: i,
          toIndex: bestNeighbor,
          progress: 0,
          speed: Math.random() * 0.015 + 0.008,
          colorIndex: Math.floor(Math.random() * 4),
        })
      }
    }

    const mouse = { x: -9999, y: -9999 }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    let lastPacketSpawn = 0

    // Animation Loop
    const render = (time: number) => {
      const activePalette = isDark ? palettes.dark : palettes.light
      ctx.clearRect(0, 0, width, height)

      // Periodically spawn data packets
      if (time - lastPacketSpawn > 250) {
        spawnPacket()
        lastPacketSpawn = time
      }

      // 1. Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        // Bounce on boundary
        if (p.x < 0) {
          p.x = 0
          p.vx *= -1
        } else if (p.x > width) {
          p.x = width
          p.vx *= -1
        }
        if (p.y < 0) {
          p.y = 0
          p.vy *= -1
        } else if (p.y > height) {
          p.y = height
          p.vy *= -1
        }

        // Draw particle based on shape
        const nodeColor = activePalette.nodeColors[p.colorIndex]
        ctx.fillStyle = nodeColor
        ctx.globalAlpha = p.baseAlpha

        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'diamond') {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(Math.PI / 4)
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
          ctx.restore()
        } else if (p.shape === 'cross') {
          ctx.strokeStyle = activePalette.crossColor
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(p.x - p.size, p.y)
          ctx.lineTo(p.x + p.size, p.y)
          ctx.moveTo(p.x, p.y - p.size)
          ctx.lineTo(p.x, p.y + p.size)
          ctx.stroke()
        }
      }

      // 2. Draw connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.hypot(dx, dy)

          if (dist < maxDistance) {
            const alphaFactor = 1 - dist / maxDistance
            const lineAlpha = (alphaFactor * (isDark ? 0.22 : 0.16)).toFixed(3)
            ctx.strokeStyle = `${activePalette.lineColor}${lineAlpha})`
            ctx.lineWidth = 0.85
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }

        // Mouse proximity connection
        const dxMouse = particles[i].x - mouse.x
        const dyMouse = particles[i].y - mouse.y
        const distMouse = Math.hypot(dxMouse, dyMouse)
        if (distMouse < mouseRadius) {
          const mouseAlpha = ((1 - distMouse / mouseRadius) * (isDark ? 0.45 : 0.3)).toFixed(3)
          ctx.strokeStyle = `${activePalette.mouseLineColor}${mouseAlpha})`
          ctx.lineWidth = 1.1
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      }

      // 3. Draw active data packets
      for (let k = packets.length - 1; k >= 0; k--) {
        const pkt = packets[k]
        pkt.progress += pkt.speed

        if (pkt.progress >= 1) {
          packets.splice(k, 1)
          continue
        }

        const pFrom = particles[pkt.fromIndex]
        const pTo = particles[pkt.toIndex]
        if (!pFrom || !pTo) {
          packets.splice(k, 1)
          continue
        }

        const currentX = pFrom.x + (pTo.x - pFrom.x) * pkt.progress
        const currentY = pFrom.y + (pTo.y - pFrom.y) * pkt.progress

        ctx.fillStyle = activePalette.packetColors[pkt.colorIndex]
        ctx.globalAlpha = isDark ? 0.95 : 0.75
        ctx.beginPath()
        ctx.arc(currentX, currentY, 2.2, 0, Math.PI * 2)
        ctx.fill()

        // Subtle glow for data packet
        if (isDark) {
          ctx.shadowBlur = 6
          ctx.shadowColor = activePalette.glowColor
          ctx.beginPath()
          ctx.arc(currentX, currentY, 1.2, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      ctx.globalAlpha = 1
      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', handleResize)
    }
  }, [isDark])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
    >
      {/* 1. Base Adaptive Gradient Mesh Background */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-500" />

      {/* 2. Cyber Holographic Coordinate Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.45] dark:opacity-[0.25] transition-opacity duration-500 bg-[linear-gradient(to_right,#6366f112_1px,transparent_1px),linear-gradient(to_bottom,#6366f112_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#38bdf815_1px,transparent_1px),linear-gradient(to_bottom,#38bdf815_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      {/* 3. Sweeping Horizontal Cyber Scan Line */}
      <div 
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 dark:via-cyan-400/40 to-transparent animate-techScan pointer-events-none"
      />

      {/* 4. Layered Ambient Glowing Tech Auroras (Fluid Glow Orbs) */}
      {/* Top Left: Indigo / Electric Cyan */}
      <div 
        className="absolute -top-32 -left-32 w-[460px] h-[460px] rounded-full blur-[110px] pointer-events-none transition-colors duration-700 bg-indigo-500/[0.12] dark:bg-indigo-600/[0.18] animate-techPulse"
      />
      {/* Top Right: Sky Blue / Cyan */}
      <div 
        className="absolute top-1/6 -right-28 w-[420px] h-[420px] rounded-full blur-[100px] pointer-events-none transition-colors duration-700 bg-sky-400/[0.10] dark:bg-cyan-500/[0.14] animate-techPulse [animation-delay:3s]"
      />
      {/* Bottom Center / Left: Violet / Purple */}
      <div 
        className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 bg-violet-500/[0.09] dark:bg-violet-600/[0.15] animate-techPulse [animation-delay:6s]"
      />

      {/* 5. Interactive Constellation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* 6. Subtle Tech Vignette to gracefully focus content */}
      <div 
        className="absolute inset-0 bg-radial from-transparent via-transparent to-slate-200/30 dark:to-slate-950/70 pointer-events-none" 
      />
    </div>
  )
}
