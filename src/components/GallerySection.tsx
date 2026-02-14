import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Heart, Star, Smile, X, Plus } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption: string;
  reactions: { heart: number; laugh: number; star: number };
}

// Placeholder gallery — will be replaced with Cloud storage later
const GallerySection = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = URL.createObjectURL(file);
    const caption = prompt("Добавь подпись к фото:") || "";
    setPhotos(prev => [...prev, {
      id: Date.now().toString(),
      url,
      caption,
      reactions: { heart: 0, laugh: 0, star: 0 },
    }]);
    setUploading(false);
  };

  const addReaction = (photoId: string, type: "heart" | "laugh" | "star") => {
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, reactions: { ...p.reactions, [type]: p.reactions[type] + 1 } } : p
    ));
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
      <p className="text-center text-muted-foreground mb-12 font-body text-sm">
        Загружай фото — они сохранятся для нас двоих
      </p>

      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square glass-effect"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-xs text-foreground font-body">{photo.caption}</p>
            </div>
          </motion.div>
        ))}

        <label className="flex flex-col items-center justify-center rounded-xl aspect-square border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors">
          <Plus className="text-primary/60 mb-2" size={32} />
          <span className="text-xs text-muted-foreground">Добавить фото</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="relative max-w-lg w-full glass-effect rounded-2xl p-4"
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" onClick={() => setSelectedPhoto(null)}>
              <X size={20} />
            </button>
            <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="w-full rounded-xl mb-4" />
            <p className="font-display italic text-center text-lg mb-4">{selectedPhoto.caption}</p>
            <div className="flex justify-center gap-6">
              {[
                { type: "heart" as const, icon: Heart, count: selectedPhoto.reactions.heart },
                { type: "laugh" as const, icon: Smile, count: selectedPhoto.reactions.laugh },
                { type: "star" as const, icon: Star, count: selectedPhoto.reactions.star },
              ].map(r => (
                <button
                  key={r.type}
                  onClick={() => addReaction(selectedPhoto.id, r.type)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
                >
                  <r.icon size={18} />
                  <span className="text-sm">{r.count}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default GallerySection;
