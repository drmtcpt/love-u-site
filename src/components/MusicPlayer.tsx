import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MusicPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user?.id ?? null;
      setUserId(id);
      if (id) await loadSharedMusic();
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (id) loadSharedMusic();
      else setAudioUrl(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (playing && audioRef.current) {
      audioRef.current.play().catch((e) => console.error(e));
    }
  }, [audioUrl]);

  const loadSharedMusic = async () => {
    setLoading(true);
    try {
      // list files in shared Music folder
      const { data: list, error: listErr } = await supabase.storage.from("Music").list("shared");
      if (listErr) throw listErr;
      if (list && list.length > 0) {
        // Сортируем файлы, чтобы взять самый новый (по имени, так как оно начинается с timestamp)
        list.sort((a, b) => b.name.localeCompare(a.name));
        const file = list[0];
        
        // Используем публичную ссылку, так как бакет теперь публичный
        const { data: publicUrlData } = supabase.storage
          .from("Music")
          .getPublicUrl(`shared/${file.name}`);
        setAudioUrl(publicUrlData.publicUrl);
      } else {
        // fallback to public file
        setAudioUrl(`/music.mp3`);
      }
    } catch (err) {
      console.error(err);
      setAudioUrl(`/music.mp3`);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch (e) {
        console.error(e);
      }
    }
    setPlaying(!playing);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!userId) return alert("Сначала войдите в аккаунт.");
    setLoading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const path = `shared/${fileName}`;
      const { error } = await supabase.storage.from("Music").upload(path, file, { upsert: true });
      if (error) throw error;
      
      // Сразу получаем ссылку на новый файл и включаем его
      const { data: publicUrlData } = supabase.storage
        .from("Music")
        .getPublicUrl(path);

      setAudioUrl(publicUrlData.publicUrl);
      setPlaying(true); // Автоматически включаем новую песню
      alert("Музыка загружена.");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      alert(message);
    } finally {
      setLoading(false);
      (e.target as HTMLInputElement).value = "";
    }
  };

  return (
    <>
      <audio ref={audioRef} src={audioUrl ?? undefined} loop />
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <label className="flex items-center gap-2 bg-background/80 rounded-full px-3 py-2 glass-effect cursor-pointer">
          <Upload size={16} />
          <span className="text-xs">{loading ? "Загружается..." : "Загрузить музыку"}</span>
          <input type="file" accept="audio/*" className="hidden" onChange={handleUpload} />
        </label>
        <button
          onClick={toggle}
          className="w-12 h-12 rounded-full glass-effect flex items-center justify-center hover:scale-110 transition-transform"
          aria-label={playing ? "Выключить музыку" : "Включить музыку"}
        >
          {playing ? <Volume2 size={20} className="text-accent" /> : <VolumeX size={20} className="text-muted-foreground" />}
        </button>
      </div>
    </>
  );
};

export default MusicPlayer;
