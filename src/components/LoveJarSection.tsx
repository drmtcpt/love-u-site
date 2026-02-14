import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ✏️ Отредактируй фразы здесь:
const LOVE_NOTES = [
  "Ты моя гордость.",
  "Я верю в нас.",
  "Спасибо, что ты есть.",
  "Ты делаешь меня сильнее.",
  "Ты — лучшее, что со мной случилось.",
  "Я скучаю по тебе каждую секунду.",
  "Ты мой дом, где бы ты ни была.",
  "С тобой я чувствую себя собой.",
  "Ты моя звезда в этом космосе.",
  "Я горжусь тем, что ты — моя.",
];

const LoveJarSection = () => {
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const pickNote = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentNote(null);
    setTimeout(() => {
      const note = LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)];
      setCurrentNote(note);
      setIsAnimating(false);
    }, 600);
  };

  return (
    <section className="relative z-10 py-20 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl sm:text-4xl text-center mb-12 glow-text"
      >
        🫙 Баночка любви
      </motion.h2>
      <p className="text-center text-muted-foreground mb-8 text-sm">Нажми на баночку — получи записку</p>

      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={pickNote}
          className="cursor-pointer select-none"
        >
          {/* Jar SVG */}
          <svg width="120" height="160" viewBox="0 0 120 160" className="drop-shadow-lg" style={{ filter: "drop-shadow(0 0 15px hsl(280 80% 75% / 0.4))" }}>
            {/* Lid */}
            <rect x="30" y="5" width="60" height="15" rx="4" fill="hsl(45 80% 60%)" />
            <rect x="25" y="18" width="70" height="6" rx="2" fill="hsl(45 80% 50%)" />
            {/* Jar body */}
            <path d="M25 24 Q20 24 20 34 L20 140 Q20 155 35 155 L85 155 Q100 155 100 140 L100 34 Q100 24 95 24 Z"
              fill="hsl(230 30% 20% / 0.3)"
              stroke="hsl(280 60% 65% / 0.4)"
              strokeWidth="1.5"
            />
            {/* Hearts inside */}
            <text x="42" y="70" fontSize="14">💜</text>
            <text x="58" y="90" fontSize="12">💗</text>
            <text x="48" y="110" fontSize="10">✨</text>
            <text x="62" y="130" fontSize="12">💛</text>
            <text x="38" y="125" fontSize="10">💕</text>
          </svg>
        </motion.div>

        <AnimatePresence>
          {currentNote && (
            <motion.div
              initial={{ opacity: 0, y: 20, rotateZ: -5 }}
              animate={{ opacity: 1, y: 0, rotateZ: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 glass-effect rounded-2xl px-8 py-6 max-w-sm text-center"
            >
              <p className="font-display italic text-xl text-accent">«{currentNote}»</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default LoveJarSection;
