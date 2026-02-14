import StarryBackground from "@/components/StarryBackground";
import HeroSection from "@/components/HeroSection";
import GallerySection from "@/components/GallerySection";
import MapSection from "@/components/MapSection";
import LoveStorySection from "@/components/LoveStorySection";
import LoveJarSection from "@/components/LoveJarSection";
import BouquetSection from "@/components/BouquetSection";
import FinalSection from "@/components/FinalSection";
import MusicPlayer from "@/components/MusicPlayer";

const Index = () => {
  return (
    <div className="relative min-h-screen cosmic-gradient overflow-x-hidden">
      <StarryBackground />
      <HeroSection />
      <GallerySection />
      <MapSection />
      <LoveStorySection />
      <LoveJarSection />
      <BouquetSection />
      <FinalSection />
      <MusicPlayer />
    </div>
  );
};

export default Index;
