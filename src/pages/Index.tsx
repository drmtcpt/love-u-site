import HeroSection from "@/components/HeroSection";
import LoveStorySection from "@/components/LoveStorySection";
import GallerySection from "@/components/GallerySection";
import MapSection from "@/components/MapSection";
import LoveJarSection from "@/components/LoveJarSection";
import BouquetSection from "@/components/BouquetSection";
import CalendarSection from "@/components/CalendarSection";
import FinalSection from "@/components/FinalSection";
import MusicPlayer from "@/components/MusicPlayer";
import StarryBackground from "@/components/StarryBackground";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <StarryBackground />
      <MusicPlayer />
      <Header />
      
      {/* Порядок секций на сайте: */}
      <HeroSection />
      <LoveStorySection />
      <GallerySection />
      <MapSection />
      <LoveJarSection />
      <BouquetSection />
      
      <CalendarSection />
      
      <FinalSection />
    </div>
  );
};

export default Index;
