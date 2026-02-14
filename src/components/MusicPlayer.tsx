import { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MusicPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <>
      {/* Place your mp3 file at public/music.mp3 */}
      <audio ref={audioRef} src="/music.mp3" loop />
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full glass-effect flex items-center justify-center hover:scale-110 transition-transform"
        aria-label={playing ? "Выключить музыку" : "Включить музыку"}
      >
        {playing ? <Volume2 size={20} className="text-accent" /> : <VolumeX size={20} className="text-muted-foreground" />}
      </button>
    </>
  );
};

export default MusicPlayer;
