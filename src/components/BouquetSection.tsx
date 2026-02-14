import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const flowers = ["🌹", "🌸", "🌺", "🌷", "💐", "🌻", "🌼", "🪻", "🏵️"];

const BouquetSection = () => {
  const [showBouquet, setShowBouquet] = useState(false);
  const [petals, setPetals] = useState<{ id: number; x: number; y: number; emoji: string; delay: number }[]>([]);

  const triggerBouquet = () => {
    setShowBouquet(true);
    const newPetals = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 300 - 150,
      y: Math.random() * -200 - 50,
      emoji: flowers[Math.floor(Math.random() * flowers.length)],
      delay: Math.random() * 0.5,
    }));
    setPetals(newPetals);
  };

  return (
    <section className="relative z-10 py-20 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl sm:text-4xl text-center mb-12 glow-text"
      >
        🌹 Виртуальный букет
      </motion.h2>

      <div className="flex flex-col items-center relative">
        {!showBouquet ? (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerBouquet}
            className="px-8 py-4 rounded-full bg-secondary/20 border border-secondary/40 text-foreground font-body text-lg hover:bg-secondary/30 transition-all"
          >
            Получить букет от меня 💐
          </motion.button>
        ) : (
          <div className="relative flex flex-col items-center">
            {/* Flower explosion */}
            <div className="relative w-64 h-64">
              <AnimatePresence>
                {petals.map(p => (
                  <motion.span
                    key={p.id}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    animate={{ opacity: 1, x: p.x, y: p.y, scale: 1, rotate: Math.random() * 360 }}
                    transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
                    className="absolute left-1/2 top-1/2 text-2xl sm:text-3xl"
                  >
                    {p.emoji}
                  </motion.span>
                ))}
              </AnimatePresence>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute inset-0 flex items-center justify-center text-6xl"
              >
                💐
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8 font-display italic text-lg sm:text-xl text-center max-w-md leading-relaxed"
            >
              «Пока я не могу вручить тебе их лично — пусть они прилетят к тебе через экран.»
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={() => { setShowBouquet(false); setPetals([]); }}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Получить ещё раз ✨
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BouquetSection;
