"use client"

import { useState, useEffect } from "react"
import { Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Update state when fullscreen changes (e.g., when user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        await document.documentElement.requestFullscreen()
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleFullscreen}
      className="rounded-full w-7 h-7 border border-primary/20 text-primary/20 hover:bg-primary/5 hover:text-primary/60 absolute top-3 left-3 opacity-20 hover:opacity-100 transition-opacity"
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
    </Button>
  )
}

