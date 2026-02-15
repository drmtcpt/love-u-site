// c:\Users\Ali\Desktop\Love u\src\components\GallerySection.tsx

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, LogIn, Send, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PhotoRow {
  id: string;
  path: string;
  filename: string | null;
  caption: string | null;
  created_at: string;
}

const GallerySection = () => {
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; filename?: string; caption?: string | null; path: string }>>([]);
  const [selected, setSelected] = useState<{ id: string; url: string; filename?: string; caption?: string | null; path: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Upload preview state
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Auth states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const loadGallery = useCallback(async (uid?: string) => {
    const id = uid || userId;
    if (!id) return;
    const { data, error } = await supabase
      .from("photos")
      .select("id, path, filename, caption, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .returns<PhotoRow[]>();
    if (error) {
      console.error(error);
      return;
    }
    const items = await Promise.all((data || []).map(async (r) => {
      // Use signed URL for private bucket
      const { data: signedUrl, error: signErr } = await supabase.storage
        .from("photos")
        .createSignedUrl(r.path, 3600); // 1 hour expiration
      if (signErr) {
        console.error(signErr);
        return null;
      }
      return { id: r.id, url: signedUrl.signedUrl, filename: r.filename ? r.filename : undefined, caption: r.caption, path: r.path };
    }));
    setPhotos(items.filter((item) => item !== null) as Array<{ id: string; url: string; filename?: string; caption?: string | null; path: string }>);
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
    if (!username || !password) return alert("Введите логин и пароль");
    
    // Автоматически добавляем домен, если введен просто логин
    const emailToUse = username.includes("@") ? username : `${username}@love-u.site`;

    const { error } = await supabase.auth.signInWithPassword({ 
      email: emailToUse, 
      password 
    });

    if (error) {
      alert("Ошибка входа: " + error.message);
    } else {
      setPassword(""); // Очищаем пароль после успешного входа
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPhotos([]);
    setUserId(null);
    setUsername("");
    setPassword("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    // Reset input so same file can be selected again if needed
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!previewFile || !userId) return;
    setUploading(true);
    try {
      const path = `${userId}/${Date.now()}_${previewFile.name}`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, previewFile);
      if (upErr) throw upErr;
      // save metadata
      const { error: dbErr } = await supabase.from("photos").insert([{ 
        user_id: userId, 
        path, 
        filename: previewFile.name, 
        caption: captionText 
      }]);
      if (dbErr) throw dbErr;
      
      await loadGallery(userId);
      closeUploadModal();
    } catch (err: unknown) {
      console.error(err);
      let message = "Произошла ошибка при загрузке";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null) {
        const e = err as { message?: string; error_description?: string };
        message = e.message || e.error_description || JSON.stringify(err);
      }
      alert(message);
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    setPreviewFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaptionText("");
  };

  const handleDelete = async () => {
    if (!selected || !userId) return;
    try {
      // 1. Удаляем файл из хранилища
      const { error: storageError } = await supabase.storage.from("photos").remove([selected.path]);
      if (storageError) throw storageError;

      // 2. Удаляем запись из базы данных
      const { error: dbError } = await supabase.from("photos").delete().eq("id", selected.id);
      if (dbError) throw dbError;

      setShowDeleteConfirm(false);
      setSelected(null);
      await loadGallery(userId);
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить фото. Попробуйте еще раз.");
    }
  };

  const isModalOpen = selected || (previewFile && previewUrl) || showDeleteConfirm;

  return (
    <section id="gallery" className={`relative py-20 px-4 sm:px-8 ${isModalOpen ? "z-[100]" : "z-10"}`}>
      {userId ? (
        <>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl text-center mb-4 glow-text"
          >
            📸 Моменты, которые делают нас нами
          </motion.h2>
          <p className="text-center text-muted-foreground mb-6 font-body text-sm">
            Только вы сможете видеть и загружать свои фото.
          </p>
        </>
      ) : (
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl sm:text-4xl text-center mb-8 glow-text"
        >
          Открой нашу историю
        </motion.h2>
      )}

      {!userId ? (
        <div className="max-w-xs mx-auto flex flex-col gap-3 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
          <input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Логин (semya1618)" 
            className="input bg-black/20 border-white/10 text-center" 
          />
          <input 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Пароль" 
            className="input bg-black/20 border-white/10 text-center" 
          />
          <button onClick={signIn} className="btn w-full flex justify-center items-center gap-2 mt-2">
            <LogIn size={18} />
            Войти
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto flex gap-2 justify-center items-center mb-6">
          <div className="text-sm">Вы вошли как <strong>{username || "semya1618"}</strong></div>
          <button onClick={signOut} className="btn bg-red-500/20 hover:bg-red-500/40 border-red-500/50">Выйти</button>
        </div>
      )}

      {userId && (
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 auto-rows-fr">
          {photos.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square glass-effect" onClick={() => setSelected(p)}>
              <img src={p.url} alt={p.filename} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-sm text-white font-body line-clamp-2">{p.caption || p.filename}</p>
              </div>
            </motion.div>
          ))}

          <label className="flex flex-col items-center justify-center rounded-xl aspect-square border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors bg-white/5 group">
            <Plus className="text-primary/60 mb-2 group-hover:scale-110 transition-transform" size={32} />
            <span className="text-xs text-muted-foreground">Добавить фото</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </label>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {previewFile && previewUrl && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-md w-full glass-effect rounded-2xl p-6 flex flex-col gap-4"
            >
              <button 
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" 
                onClick={closeUploadModal}
                disabled={uploading}
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-display text-center">Новое фото</h3>
              
              <div className="rounded-xl overflow-hidden aspect-square bg-black/20">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>

              <input 
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Добавь подпись..." 
                className="input bg-black/20 border-white/10 text-center"
                disabled={uploading}
              />

              <button 
                onClick={handleUpload} 
                disabled={uploading}
                className="btn w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {uploading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Send size={18} />
                    Опубликовать
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="relative max-w-lg w-full glass-effect rounded-2xl p-4" onClick={e => e.stopPropagation()}>
              <button className="absolute top-3 left-3 text-muted-foreground hover:text-red-500 bg-black/50 rounded-full p-2 transition-colors" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={20} />
              </button>
              <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground bg-black/50 rounded-full p-1" onClick={() => setSelected(null)}>
                <X size={20} />
              </button>
              <img src={selected.url} alt={selected.filename} className="w-full rounded-xl mb-4 max-h-[80vh] object-contain" />
              <p className="font-display italic text-center text-lg mb-4">{selected.caption || selected.filename}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-background border border-white/10 p-6 rounded-xl max-w-sm w-full text-center shadow-2xl">
              <h3 className="text-lg font-bold mb-6 font-display">Вы точно хотите удалить это воспоминание?</h3>
              <div className="flex justify-center gap-4">
                <button onClick={handleDelete} className="btn bg-red-500 hover:bg-red-600 text-white border-none px-6">Да</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn bg-secondary hover:bg-secondary/80 text-white border-none px-6">Нет</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
