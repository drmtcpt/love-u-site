import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import createGlobe from "cobe";

const MapSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    let phi = 0;
    let width = 0;

    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
    window.addEventListener('resize', onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3, // Немного наклоним глобус
      dark: 1, // Темная тема
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3], // Цвет океана (серый космос)
      markerColor: [0.9, 0.2, 0.6], // Цвет точек (розово-малиновый)
      glowColor: [0.5, 0.2, 0.8], // Цвет свечения (фиолетовый)
      markers: [
        { location: [40.4093, 49.8671], size: 0.1 }, // Баку
        { location: [57.6833, 46.6000], size: 0.1 }, // Шахунья
      ],
      onRender: (state) => {
        // Вращение
        state.phi = phi;
        phi += 0.003; // Скорость вращения
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="relative z-10 py-20 px-4 overflow-hidden">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl sm:text-4xl text-center mb-12 glow-text"
      >
        🌍 Наше расстояние
      </motion.h2>

      <div className="relative max-w-lg mx-auto aspect-square flex items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', maxWidth: 600, maxHeight: 600 }}
          className="cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
          onClick={() => setShowInfo(!showInfo)}
        />
        
        {/* Инфо-блок при клике */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showInfo ? 1 : 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="glass-effect rounded-2xl px-6 py-4 text-center max-w-xs pointer-events-auto backdrop-blur-md bg-black/40">
            <p className="font-display italic text-lg text-foreground">
              «Километры — это всего лишь цифры. Чувства — это выбор.»
            </p>
          </div>
        </motion.div>
      </div>

      <p className="text-center mt-6 text-accent font-display text-2xl">~2 100 км</p>
      <p className="text-center text-muted-foreground text-sm">между нашими сердцами</p>
    </section>
  );
};

export default MapSection;
