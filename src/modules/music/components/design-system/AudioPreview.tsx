"use client";

import { useRef, useState } from "react";
import { IconPlayerPlay, IconPlayerPause, IconPlayerTrackNext } from "@tabler/icons-react";

export function AudioPreview({ previewUrl, onEnded }: { previewUrl: string; onEnded?: () => void }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    onEnded?.();
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={previewUrl}
        onEnded={handleEnded}
        preload="none"
        className="hidden"
      />
      <button
        onClick={toggle}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
        title={playing ? "Pause preview" : "Play 30s preview"}
      >
        {playing ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
      </button>
    </>
  );
}
