import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { Heart, ImagePlus } from 'lucide-react';

interface Post {
  id: number;
  image_url: string;
  user_id: string;
  profiles: Profile | null;
  likes: { count: number }[];
}

const GallerySection = () => {
  const { profile, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userLikes, setUserLikes] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
    if (user) fetchUserLikes(user.id);
  }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url), likes(count)')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching posts:', error);
    else setPosts(data as any);
  };

  const fetchUserLikes = async (userId: string) => {
    const { data, error } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId);
    if (error) console.error('Error fetching user likes:', error);
    else setUserLikes(data.map(like => like.post_id));
  };

  const handleLike = async (postId: number) => {
    if (!user) return;
    const hasLiked = userLikes.includes(postId);

    if (hasLiked) {
      // Unlike
      await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
      setUserLikes(userLikes.filter(id => id !== postId));
    } else {
      // Like
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      setUserLikes([...userLikes, postId]);
    }
    fetchPosts(); // Refresh posts to get new like count
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return;
    setUploading(true);
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Ошибка загрузки фото.');
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName);

    await supabase
      .from('posts')
      .insert({ user_id: user.id, image_url: publicUrlData.publicUrl });
    
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
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={post.profiles?.avatar_url} alt="author" className="w-6 h-6 rounded-full" />
                    <span className="text-xs font-bold">{post.profiles?.username}</span>
                  </div>
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full"
                  >
                    <Heart
                      size={14}
                      className={userLikes.includes(post.id) ? 'text-red-500 fill-current' : ''}
                    />
                    {post.likes[0]?.count || 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
