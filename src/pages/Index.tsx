import HeroSection from "@/components/HeroSection";
import LoveStorySection from "@/components/LoveStorySection";
import GallerySection from "@/components/GallerySection";
import MapSection from "@/components/MapSection";
import LoveJarSection from "@/components/LoveJarSection";
import BouquetSection from "@/components/BouquetSection";
import CalendarSection from "@/components/CalendarSection"; // 1. Импортируем календарь
import FinalSection from "@/components/FinalSection";
import MusicPlayer from "@/components/MusicPlayer";
import StarryBackground from "@/components/StarryBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <StarryBackground />
      <MusicPlayer />
      
      {/* Порядок секций на сайте: */}
      <HeroSection />
      <LoveStorySection />
      <GallerySection />
      <MapSection />
      <LoveJarSection />
      <BouquetSection />
      
      <CalendarSection /> {/* 2. Вставляем календарь перед финалом */}
      
      <FinalSection />
    </div>
  );
};

export default Index;
