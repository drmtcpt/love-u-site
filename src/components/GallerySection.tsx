import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { ImagePlus, Trash2, X, Check } from 'lucide-react';

interface Post {
  id: number;
  image_url: string;
  user_id: string;
  caption?: string;
}

const GallerySection = () => {
  const { profile, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedPost]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching posts:', error);
    else setPosts(data as any);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return alert("Пожалуйста, войдите в аккаунт, чтобы загружать фото.");
    const file = event.target.files[0];
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!previewFile || !user) return;
    setUploading(true);
    const file = previewFile;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const currentCaption = caption;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Ошибка загрузки фото: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('posts')
      .insert({ user_id: user.id, image_url: publicUrlData.publicUrl, caption: currentCaption });
    
    if (dbError) {
      console.error('DB Error:', dbError);
      alert('Ошибка сохранения в базу: ' + dbError.message);
    }
    
    fetchPosts();
    setUploading(false);
    setCaption(''); // Clear caption after upload
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const cancelUpload = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setCaption('');
  };

  const handleDelete = async (postId: number, imageUrl: string) => {
    if (!user) return;
    
    // Удаляем запись из базы (теперь можно удалять любые посты, если ты авторизован)
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    
    if (error) {
      console.error("Error deleting post:", error);
      alert("Не удалось удалить фото: " + error.message);
    }

    fetchPosts();
  };

  return (
    <section className="relative z-10 py-20 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl sm:text-4xl text-center mb-12 glow-text"
      >
        📷 Наши моменты
      </motion.h2>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Кнопка загрузки */}
          <div className="aspect-square glass-effect rounded-2xl flex flex-col items-center justify-center p-4 gap-2 border-2 border-dashed border-white/20 relative overflow-hidden">
            {previewUrl ? (
              <>
                {previewFile?.type.startsWith('video/') ? (
                  <video src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                ) : (
                  <img src={previewUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                )}
                
                <div className="z-10 flex flex-col items-center w-full gap-2 mt-auto">
                  <input
                    type="text"
                    placeholder="Подпись..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-black/60 border border-white/30 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:border-primary/50 text-white placeholder:text-white/50"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpload} 
                      disabled={uploading}
                      className="bg-primary hover:bg-primary/80 p-2 rounded-full text-white transition-colors disabled:opacity-50"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={cancelUpload}
                      disabled={uploading}
                      className="bg-red-500/80 hover:bg-red-500 p-2 rounded-full text-white transition-colors disabled:opacity-50"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center cursor-pointer text-muted-foreground hover:text-white transition-colors w-full h-full justify-center">
                <ImagePlus size={32} />
                <span className="mt-1 text-xs">Загрузить</span>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
              </label>
            )}
          </div>

          {posts.map((post) => (
            <div 
              key={post.id} 
              className="group relative aspect-square glass-effect rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              {/\.(mp4|webm|ogg|mov)$/i.test(post.image_url) ? (
                <video src={post.image_url} className="w-full h-full object-cover" controls />
              ) : (
                <img src={post.image_url} alt="moment" className="w-full h-full object-cover" />
              )}
              
              {/* Overlay with caption and delete button */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <p className="text-white text-xs text-center line-clamp-3">{post.caption}</p>
                
                {user && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(post.id, post.image_url); }}
                    className="self-end text-white/70 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {selectedPost && (
            createPortal(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <div 
                className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Кнопка закрытия (крестик) - в правом верхнем углу контента */}
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute -top-10 right-0 sm:top-4 sm:right-4 z-50 text-white/70 hover:text-white transition-colors p-2 bg-black/50 rounded-full hover:bg-black/70"
                >
                  <X size={24} />
                </button>

                {/* Кнопка удаления (мусорка) - в левом верхнем углу контента, если это пост текущего пользователя */}
                {user && (
                  <button
                    onClick={() => {
                      handleDelete(selectedPost.id, selectedPost.image_url);
                      setSelectedPost(null);
                    }}
                    className="absolute -top-10 left-0 sm:top-4 sm:left-4 z-50 text-white/70 hover:text-red-400 transition-colors p-2 bg-black/50 rounded-full hover:bg-black/70"
                  >
                    <Trash2 size={24} />
                  </button>
                )}

                {/\.(mp4|webm|ogg|mov)$/i.test(selectedPost.image_url) ? (
                  <video 
                    src={selectedPost.image_url} 
                    className="max-w-full max-h-[80vh] rounded-lg shadow-2xl relative" 
                    controls 
                    autoPlay 
                  />
                ) : (
                  <img 
                    src={selectedPost.image_url} 
                    alt="moment" 
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl relative" 
                  />
                )}
                {selectedPost.caption && (
                  <p className="mt-6 text-white/90 text-center font-display text-xl bg-black/40 px-6 py-2 rounded-full backdrop-blur-md">
                    {selectedPost.caption}
                  </p>
                )}
              </div>
            </motion.div>,
            document.body
            )
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GallerySection;
