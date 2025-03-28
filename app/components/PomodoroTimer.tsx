"use client"

import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type TimerMode = "work" | "break"
type TimerPreset = "25/5" | "50/10" | "90/20" | "custom"

interface TimerSettings {
  workTime: number
  breakTime: number
  preset: TimerPreset
}

const DEFAULT_SETTINGS: TimerSettings = {
  workTime: 50 * 60, // 50 minutes in seconds
  breakTime: 10 * 60, // 10 minutes in seconds
  preset: "50/10",
}

export default function PomodoroTimer() {
  // Load settings from localStorage or use defaults
  const loadSettings = (): TimerSettings => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS

    const saved = localStorage.getItem("pomodoroSettings")
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
  }

  const [settings, setSettings] = useState<TimerSettings>(loadSettings())
  const [timeLeft, setTimeLeft] = useState(settings.workTime)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<TimerMode>("work")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [customWorkTime, setCustomWorkTime] = useState(50)
  const [customBreakTime, setCustomBreakTime] = useState(10)

  // Load settings on initial render
  useEffect(() => {
    const savedSettings = loadSettings()
    setSettings(savedSettings)
    setTimeLeft(savedSettings.workTime)
    setCustomWorkTime(Math.floor(savedSettings.workTime / 60))
    setCustomBreakTime(Math.floor(savedSettings.breakTime / 60))
  }, [])

  // Save settings when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoroSettings", JSON.stringify(settings))
    }
  }, [settings])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      // Play sound if enabled
      if (soundEnabled) {
        const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3")
        audio.play().catch((err) => console.error("Error playing sound:", err))
      }

      // Switch modes
      if (mode === "work") {
        setMode("break")
        setTimeLeft(settings.breakTime)
      } else {
        setMode("work")
        setTimeLeft(settings.workTime)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode, soundEnabled, settings])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMode("work")
    setTimeLeft(settings.workTime)
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calculateProgress = () => {
    const total = mode === "work" ? settings.workTime : settings.breakTime
    return ((total - timeLeft) / total) * 100
  }

  const applyPreset = (preset: TimerPreset) => {
    let newSettings: TimerSettings

    switch (preset) {
      case "25/5":
        newSettings = {
          workTime: 25 * 60,
          breakTime: 5 * 60,
          preset,
        }
        break
      case "50/10":
        newSettings = {
          workTime: 50 * 60,
          breakTime: 10 * 60,
          preset,
        }
        break
      case "90/20":
        newSettings = {
          workTime: 90 * 60,
          breakTime: 20 * 60,
          preset,
        }
        break
      case "custom":
        newSettings = {
          workTime: customWorkTime * 60,
          breakTime: customBreakTime * 60,
          preset: "custom",
        }
        break
      default:
        newSettings = DEFAULT_SETTINGS
    }

    setSettings(newSettings)

    // Reset timer with new settings
    setIsActive(false)
    setMode("work")
    setTimeLeft(newSettings.workTime)
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm max-w-md w-full mx-auto">
      <div className="w-full relative">
        <div className="relative h-1.5 bg-primary/10 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary/60"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-1 right-0 text-primary/20 hover:bg-transparent hover:text-primary/50 w-7 h-7 opacity-40 hover:opacity-100 transition-opacity"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background/95 backdrop-blur-sm border-primary/30 text-primary">
            <DialogHeader>
              <DialogTitle className="text-primary/80">Timer Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-2">
              <RadioGroup
                value={settings.preset}
                onValueChange={(value) => applyPreset(value as TimerPreset)}
                className="grid grid-cols-2 gap-2"
              >
                <div className="col-span-2 mb-2">
                  <Label className="text-primary/70 text-sm">Preset Timers</Label>
                </div>
                <Label
                  htmlFor="preset-25-5"
                  className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                    settings.preset === "25/5"
                      ? "bg-primary/20 border-primary/50"
                      : "bg-background/50 border-primary/20 hover:bg-primary/10"
                  } cursor-pointer transition-colors`}
                >
                  <RadioGroupItem value="25/5" id="preset-25-5" className="sr-only" />
                  <span className="text-lg font-medium text-primary/80">25/5</span>
                  <span className="text-xs text-primary/60">Pomodoro</span>
                </Label>
                <Label
                  htmlFor="preset-50-10"
                  className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                    settings.preset === "50/10"
                      ? "bg-primary/20 border-primary/50"
                      : "bg-background/50 border-primary/20 hover:bg-primary/10"
                  } cursor-pointer transition-colors`}
                >
                  <RadioGroupItem value="50/10" id="preset-50-10" className="sr-only" />
                  <span className="text-lg font-medium text-primary/80">50/10</span>
                  <span className="text-xs text-primary/60">Extended</span>
                </Label>
                <Label
                  htmlFor="preset-90-20"
                  className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                    settings.preset === "90/20"
                      ? "bg-primary/20 border-primary/50"
                      : "bg-background/50 border-primary/20 hover:bg-primary/10"
                  } cursor-pointer transition-colors`}
                >
                  <RadioGroupItem value="90/20" id="preset-90-20" className="sr-only" />
                  <span className="text-lg font-medium text-primary/80">90/20</span>
                  <span className="text-xs text-primary/60">Deep Work</span>
                </Label>
                <Label
                  htmlFor="preset-custom"
                  className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                    settings.preset === "custom"
                      ? "bg-primary/20 border-primary/50"
                      : "bg-background/50 border-primary/20 hover:bg-primary/10"
                  } cursor-pointer transition-colors`}
                >
                  <RadioGroupItem value="custom" id="preset-custom" className="sr-only" />
                  <span className="text-lg font-medium text-primary/80">Custom</span>
                  <span className="text-xs text-primary/60">Your Settings</span>
                </Label>
              </RadioGroup>

              {settings.preset === "custom" && (
                <div className="space-y-4 pt-2 border-t border-primary/10">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-primary/70">Work Time: {customWorkTime} minutes</Label>
                    </div>
                    <Slider
                      value={[customWorkTime]}
                      min={5}
                      max={120}
                      step={5}
                      onValueChange={(value) => setCustomWorkTime(value[0])}
                      className="text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-primary/70">Break Time: {customBreakTime} minutes</Label>
                    </div>
                    <Slider
                      value={[customBreakTime]}
                      min={1}
                      max={30}
                      step={1}
                      onValueChange={(value) => setCustomBreakTime(value[0])}
                      className="text-primary"
                    />
                  </div>
                  <Button
                    onClick={() => applyPreset("custom")}
                    className="w-full bg-primary/10 text-primary/80 hover:bg-primary/20 border border-primary/30"
                  >
                    Apply Custom Settings
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-center">
        <div className="text-5xl font-medium text-primary font-mono">{formatTime(timeLeft)}</div>
        <div className="text-xs uppercase tracking-wider mt-1 text-primary/50">
          {mode === "work" ? "focus" : "break"}
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={toggleTimer}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9"
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          onClick={resetTimer}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          onClick={toggleSound}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

