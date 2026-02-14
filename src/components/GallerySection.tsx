import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PhotoRow {
  id: string;
  path: string;
  filename: string | null;
  created_at: string;
}

const GallerySection = () => {
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; filename?: string }>>([]);
  const [selected, setSelected] = useState<{ id: string; url: string; filename?: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const loadGallery = useCallback(async (uid?: string) => {
    const id = uid || userId;
    if (!id) return;
    const { data, error } = await supabase
      .from("photos")
      .select("id, path, filename, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .returns<PhotoRow[]>();
    if (error) {
      console.error(error);
      return;
    }
    const items = await Promise.all((data || []).map(async (r) => {
      const { data: fileData, error: dlErr } = await supabase.storage.from("photos").download(r.path);
      if (dlErr) {
        console.error(dlErr);
        return null;
      }
      const url = URL.createObjectURL(fileData);
      return { id: r.id, url, filename: r.filename ? r.filename : undefined };
    }));
    setPhotos(items.filter((item) => item !== null) as Array<{ id: string; url: string; filename?: string }>);
  }, [userId]);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setUserId(data.session.user.id);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      if (session?.user?.id) loadGallery(session.user.id);
    });

    return () => listener.subscription.unsubscribe();
  }, [loadGallery]);

  const signIn = async () => {
    if (!email) return alert("Введите email");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Письмо со ссылкой для входа отправлено на вашу почту.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPhotos([]);
    setUserId(null);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return alert("Сначала войдите");
    setUploading(true);
    try {
      const path = `${userId}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, file);
      if (upErr) throw upErr;
      // save metadata
      const { error: dbErr } = await supabase.from("photos").insert([{ user_id: userId, path, filename: file.name }]);
      if (dbErr) throw dbErr;
      await loadGallery(userId);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      alert(message);
    } finally {
      setUploading(false);
      // reset input
      (e.target as HTMLInputElement).value = "";
    }
  };

  return (
    <section id="gallery" className="relative z-10 py-20 px-4 sm:px-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl sm:text-4xl text-center mb-4 glow-text"
      >
        📸 Моменты, которые делают нас нами
      </motion.h2>
      <p className="text-center text-muted-foreground mb-6 font-body text-sm">
        Только вы сможете видеть и загружать свои фото — войдите по email.
      </p>

      {!userId ? (
        <div className="max-w-md mx-auto flex gap-2">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email вашей девушки" className="input" />
          <button onClick={signIn} className="btn">Войти</button>
        </div>
      ) : (
        <div className="max-w-md mx-auto flex gap-2 justify-center items-center mb-6">
          <div className="text-sm">Вы вошли как <strong>{userId.slice(0,8)}</strong></div>
          <button onClick={signOut} className="btn">Выйти</button>
        </div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square glass-effect" onClick={() => setSelected(p)}>
            <img src={p.url} alt={p.filename} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-xs text-foreground font-body">{p.filename}</p>
            </div>
          </motion.div>
        ))}

        <label className="flex flex-col items-center justify-center rounded-xl aspect-square border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors">
          <Plus className="text-primary/60 mb-2" size={32} />
          <span className="text-xs text-muted-foreground">Добавить фото</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      </div>

      {/* Lightbox */}
      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative max-w-lg w-full glass-effect rounded-2xl p-4" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" onClick={() => setSelected(null)}>
              <X size={20} />
            </button>
            <img src={selected.url} alt={selected.filename} className="w-full rounded-xl mb-4" />
            <p className="font-display italic text-center text-lg mb-4">{selected.filename}</p>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default GallerySection;
