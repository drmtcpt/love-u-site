import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ImagePlus, Trash2, X } from 'lucide-react';

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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return alert("Пожалуйста, войдите в аккаунт, чтобы загружать фото.");
    setUploading(true);
    const file = event.target.files[0];
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
          <div className="aspect-square glass-effect rounded-2xl flex flex-col items-center justify-center p-4 gap-2 border-2 border-dashed border-white/20">
            <input
              type="text"
              placeholder="Подпись..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:border-primary/50 text-white placeholder:text-white/50"
            />
            <label className="flex flex-col items-center cursor-pointer text-muted-foreground hover:text-white transition-colors">
              <ImagePlus size={32} />
              <span className="mt-1 text-xs">{uploading ? 'Загрузка...' : 'Загрузить'}</span>
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>

          {posts.map((post) => (
            <div 
              key={post.id} 
              className="group relative aspect-square glass-effect rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              {/\.(mp4|webm|ogg|mov)$/i.test(post.image_url) ? (
                <video src={post.image_url} className="w-full h-full object-cover" />
              ) : (
                <img src={post.image_url} alt="moment" className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>

        {selectedPost && createPortal(
            <div
              className="fixed inset-0 bg-black flex items-center justify-center p-4"
              style={{ zIndex: 99999 }}
              onClick={() => setSelectedPost(null)}
            >
              {/* Кнопка закрытия (крестик) - в правом верхнем углу экрана */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 right-6 z-50 text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-full"
              >
                <X size={32} />
              </button>

              {/* Кнопка удаления (мусорка) - в левом верхнем углу экрана */}
              {user && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Удалить это фото?')) {
                      handleDelete(selectedPost.id, selectedPost.image_url);
                      setSelectedPost(null);
                    }
                  }}
                  className="absolute top-6 left-6 z-50 text-red-500 hover:text-red-400 transition-colors p-3 bg-black/50 rounded-full"
                >
                  <Trash2 size={32} />
                </button>
              )}

              <div 
                className="relative max-w-full max-h-full flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-fit mx-auto">
                  {/\.(mp4|webm|ogg|mov)$/i.test(selectedPost.image_url) ? (
                    <video 
                      src={selectedPost.image_url} 
                      className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" 
                      controls 
                      autoPlay 
                      playsInline
                    />
                  ) : (
                    <img 
                      src={selectedPost.image_url} 
                      alt="moment" 
                      className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
                    />
                  )}
                </div>
                {selectedPost.caption && (
                  <p className="mt-4 text-white/90 text-center font-display text-xl bg-black/40 px-6 py-2 rounded-full backdrop-blur-md">
                    {selectedPost.caption}
                  </p>
                )}
              </div>
            </div>,
            document.body
        )}
      </div>
    </section>
  );
};

export default GallerySection;
