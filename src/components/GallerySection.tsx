import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { ImagePlus } from 'lucide-react';

interface Post {
  id: number;
  image_url: string;
  user_id: string;
}

const GallerySection = () => {
  const { profile, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

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
      .insert({ user_id: user.id, image_url: publicUrlData.publicUrl });
    
    if (dbError) {
      console.error('DB Error:', dbError);
      alert('Ошибка сохранения в базу: ' + dbError.message);
    }
    
    fetchPosts();
    setUploading(false);
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
          <label className="aspect-square glass-effect rounded-2xl flex flex-col items-center justify-center text-muted-foreground hover:text-white hover:border-primary/50 border-2 border-dashed border-white/20 cursor-pointer transition-all">
            <ImagePlus size={48} />
            <span className="mt-2 text-sm">{uploading ? 'Загрузка...' : 'Добавить фото/видео'}</span>
            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>

          {posts.map((post) => (
            <div key={post.id} className="group relative aspect-square glass-effect rounded-2xl overflow-hidden">
              {/\.(mp4|webm|ogg|mov)$/i.test(post.image_url) ? (
                <video src={post.image_url} className="w-full h-full object-cover" controls />
              ) : (
                <img src={post.image_url} alt="moment" className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
