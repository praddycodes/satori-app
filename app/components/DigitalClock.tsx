"use client"

import { useState, useEffect } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type DatePosition = "above" | "below" | "hidden"

// Kanji representation of months
const monthKanji = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]

// Kanji representation of numbers 1-31 for days
const dayKanji = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
  "十九",
  "二十",
  "二十一",
  "二十二",
  "二十三",
  "二十四",
  "二十五",
  "二十六",
  "二十七",
  "二十八",
  "二十九",
  "三十",
  "三十一",
]

export default function DigitalClock() {
  const [time, setTime] = useState(new Date())
  const [datePosition, setDatePosition] = useState<DatePosition>("below")

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    // Load date position preference
    const savedPosition = localStorage.getItem("datePosition") as DatePosition
    if (savedPosition) {
      setDatePosition(savedPosition)
    }

    return () => {
      clearInterval(timer)
    }
  }, [])

  const updateDatePosition = (position: DatePosition) => {
    setDatePosition(position)
    localStorage.setItem("datePosition", position)
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")
    return `${hours}:${minutes}:${seconds}`
  }

  const formatJapaneseDate = (date: Date) => {
    const day = date.getDate() - 1 // Array is 0-indexed
    const month = date.getMonth() // Array is 0-indexed
    const year = date.getFullYear()

    return `${dayKanji[day]}日 ${monthKanji[month]} ${year}年`
  }

  return (
    <div className="relative text-6xl font-bold text-primary bg-transparent p-4 font-mono">
      <div className="absolute -top-2 -right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary/10 hover:bg-transparent hover:text-primary/40 w-7 h-7 opacity-40 hover:opacity-100 transition-opacity"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border-primary/30">
            <DropdownMenuLabel className="text-primary/70">Date Display</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem
              className="text-primary/70 cursor-pointer hover:bg-primary/10"
              onClick={() => updateDatePosition("above")}
            >
              Above Time
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-primary/70 cursor-pointer hover:bg-primary/10"
              onClick={() => updateDatePosition("below")}
            >
              Below Time
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-primary/70 cursor-pointer hover:bg-primary/10"
              onClick={() => updateDatePosition("hidden")}
            >
              Hidden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col items-center">
        {datePosition === "above" && <div className="text-lg mb-2 text-primary/60">{formatJapaneseDate(time)}</div>}
        <div>{formatTime(time)}</div>
        {datePosition === "below" && <div className="text-lg mt-2 text-primary/60">{formatJapaneseDate(time)}</div>}
      </div>
    </div>
  )
}

