"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipForward, SkipBack, Trash2, Plus, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { getYouTubePlayer } from "@/utils/youtube"

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: any
  }
}

interface Track {
  id: string
  title: string
  url: string
}

export default function MusicPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [newTrackUrl, setNewTrackUrl] = useState("")
  const [volume, setVolume] = useState(70)
  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)

  // Load playlist from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlaylist = localStorage.getItem("musicPlaylist")
      if (savedPlaylist) {
        setPlaylist(JSON.parse(savedPlaylist))
      }
    }
  }, [])

  // Save playlist to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("musicPlaylist", JSON.stringify(playlist))
    }
  }, [playlist])

  // Initialize YouTube API
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // Define the onYouTubeIframeAPIReady function
    window.onYouTubeIframeAPIReady = () => {
      // @ts-ignore
      const YT = window.YT

      // Create a div element for the player
      const playerDiv = document.createElement("div")
      playerDiv.id = "youtube-player"
      playerDiv.style.display = "none"

      // Append it to the container
      if (playerContainerRef.current) {
        playerContainerRef.current.appendChild(playerDiv)

        // Initialize the player
        playerRef.current = getYouTubePlayer("youtube-player", {
          height: "0",
          width: "0",
          playerVars: {
            playsinline: 1,
            controls: 0,
            disablekb: 1,
          },
          events: {
            onStateChange: (event: any) => {
              if (event.data === YT.PlayerState.ENDED) {
                playNextTrack()
              }
            },
            onError: (event: any) => {
              console.error("YouTube player error:", event.data)
              playNextTrack()
            },
          },
        })
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [])

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Extract video title from URL (simplified version)
  const extractTitle = (url: string): string => {
    const videoId = extractVideoId(url)
    return videoId ? `YouTube (${videoId.substring(0, 6)}...)` : "Unknown Track"
  }

  // Add a new track to the playlist
  const addTrack = async () => {
    if (!newTrackUrl.trim()) return

    let trackId: string | null = null
    trackId = extractVideoId(newTrackUrl)

    if (!trackId) {
      alert("Invalid YouTube URL")
      return
    }

    const title = extractTitle(newTrackUrl)
    const newTrack: Track = {
      id: trackId,
      title,
      url: newTrackUrl,
    }

    setPlaylist([...playlist, newTrack])
    setNewTrackUrl("")

    // If this is the first track, start playing it
    if (playlist.length === 0) {
      setCurrentTrackIndex(0)
    }
  }

  // Remove a track from the playlist
  const removeTrack = (index: number) => {
    const newPlaylist = [...playlist]
    newPlaylist.splice(index, 1)
    setPlaylist(newPlaylist)

    // Adjust currentTrackIndex if necessary
    if (index === currentTrackIndex) {
      if (isPlaying) {
        playerRef.current?.stopVideo()
        setIsPlaying(false)
      }
      if (newPlaylist.length > 0) {
        setCurrentTrackIndex(0)
      } else {
        setCurrentTrackIndex(-1)
      }
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    }
  }

  // Play/pause the current track
  const togglePlay = () => {
    if (currentTrackIndex === -1 && playlist.length > 0) {
      setCurrentTrackIndex(0)
      loadAndPlayTrack(0)
      return
    }

    if (!playlist[currentTrackIndex]) return

    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    }

    setIsPlaying(!isPlaying)
  }

  // Load and play a specific track
  const loadAndPlayTrack = (index: number) => {
    if (!playlist[index]) return

    const track = playlist[index]

    if (playerRef.current) {
      const videoId = extractVideoId(track.url)
      if (videoId) {
        playerRef.current.loadVideoById(videoId)
        playerRef.current.setVolume(volume)
        setIsPlaying(true)
      }
    }
  }

  // Play the previous track
  const playPreviousTrack = () => {
    if (playlist.length === 0) return

    const newIndex = currentTrackIndex <= 0 ? playlist.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(newIndex)
    loadAndPlayTrack(newIndex)
  }

  // Play the next track
  const playNextTrack = () => {
    if (playlist.length === 0) return

    const newIndex = (currentTrackIndex + 1) % playlist.length
    setCurrentTrackIndex(newIndex)
    loadAndPlayTrack(newIndex)
  }

  // Update volume
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume)
    }
  }, [volume])

  // Load and play track when currentTrackIndex changes
  useEffect(() => {
    if (currentTrackIndex >= 0) {
      loadAndPlayTrack(currentTrackIndex)
    }
  }, [currentTrackIndex, playlist])

  return (
    <div className="flex flex-col space-y-3 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm max-w-md w-full mx-auto">
      <h2 className="text-lg font-medium text-primary/80 text-center">(music)</h2>

      {/* Hidden player container */}
      <div ref={playerContainerRef} className="hidden"></div>

      <div className="flex space-x-2">
        <Input
          value={newTrackUrl}
          onChange={(e) => setNewTrackUrl(e.target.value)}
          placeholder="Paste YouTube URL"
          className="flex-grow border-primary/20 bg-background/50 text-primary placeholder:text-primary/30 h-8 text-sm"
        />
        <Button
          onClick={addTrack}
          className="bg-primary/10 text-primary/70 hover:bg-primary/20 border-none h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Current track info */}
      <div className="text-center py-1">
        <p className="text-sm text-primary/80 truncate">
          {currentTrackIndex >= 0 && playlist[currentTrackIndex]
            ? playlist[currentTrackIndex].title
            : "No track selected"}
        </p>
      </div>

      {/* Volume slider */}
      <div className="space-y-1">
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setVolume(value[0])}
          className="h-1.5"
        />
        <p className="text-xs text-primary/50 text-right">Vol: {volume}%</p>
      </div>

      {/* Playback controls */}
      <div className="flex justify-center space-x-3">
        <Button
          onClick={playPreviousTrack}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8"
          disabled={playlist.length === 0}
        >
          <SkipBack className="h-3 w-3" />
        </Button>

        <Button
          onClick={togglePlay}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8"
          disabled={playlist.length === 0}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>

        <Button
          onClick={playNextTrack}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8"
          disabled={playlist.length === 0}
        >
          <SkipForward className="h-3 w-3" />
        </Button>
      </div>

      {/* Playlist */}
      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
        {playlist.length === 0 ? (
          <p className="text-primary/30 text-xs italic text-center">No tracks added</p>
        ) : (
          playlist.map((track, index) => (
            <div
              key={track.id}
              className={`flex justify-between items-center p-1.5 rounded group ${
                index === currentTrackIndex ? "bg-primary/10" : ""
              }`}
            >
              <div
                className="flex-1 truncate cursor-pointer text-primary/70 hover:text-primary/90 flex items-center gap-1 text-xs"
                onClick={() => {
                  setCurrentTrackIndex(index)
                  loadAndPlayTrack(index)
                }}
              >
                <Music className="h-2.5 w-2.5 flex-shrink-0" />
                <span>{track.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTrack(index)}
                className="opacity-0 group-hover:opacity-100 text-primary/40 hover:text-primary/60 hover:bg-transparent h-6 w-6"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

