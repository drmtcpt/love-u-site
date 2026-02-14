import { useState } from "react";
import { motion } from "framer-motion";

const MapSection = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="relative z-10 py-20 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl sm:text-4xl text-center mb-12 glow-text"
      >
        🌍 Наше расстояние
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <svg viewBox="0 0 600 300" className="w-full" xmlns="http://www.w3.org/2000/svg">
          {/* Background shape */}
          <ellipse cx="300" cy="150" rx="280" ry="130" fill="hsl(230 30% 12%)" stroke="hsl(280 60% 65% / 0.2)" strokeWidth="1" />

          {/* Shakhunya dot */}
          <circle cx="350" cy="80" r="6" fill="hsl(340 70% 55%)" className="animate-pulse" />
          <circle cx="350" cy="80" r="12" fill="hsl(340 70% 55% / 0.3)" className="animate-pulse" />
          <text x="360" y="68" fill="hsl(220 20% 90%)" fontSize="12" fontFamily="Cormorant Garamond" fontWeight="600">
            Шахунья
          </text>

          {/* Baku dot */}
          <circle cx="380" cy="190" r="6" fill="hsl(280 60% 65%)" className="animate-pulse" />
          <circle cx="380" cy="190" r="12" fill="hsl(280 60% 65% / 0.3)" className="animate-pulse" />
          <text x="395" y="195" fill="hsl(220 20% 90%)" fontSize="12" fontFamily="Cormorant Garamond" fontWeight="600">
            Баку
          </text>

          {/* Glowing line */}
          <line
            x1="350" y1="80" x2="380" y2="190"
            stroke="url(#lineGrad)"
            strokeWidth="2"
            strokeDasharray="6 4"
            style={{ animation: "glowLine 3s ease-in-out infinite" }}
          />

          {/* Heart in the middle */}
          <text x="355" y="140" fontSize="16" textAnchor="middle">💜</text>

          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(340 70% 55%)" />
              <stop offset="100%" stopColor="hsl(280 60% 65%)" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="glass-effect rounded-2xl px-6 py-4 text-center max-w-xs">
            <p className="font-display italic text-lg text-foreground">
              «Километры — это всего лишь цифры. Чувства — это выбор.»
            </p>
          </div>
        </motion.div>

        <p className="text-center mt-6 text-accent font-display text-2xl">~2 100 км</p>
        <p className="text-center text-muted-foreground text-sm">между нашими сердцами</p>
      </motion.div>
    </section>
  );
};

export default MapSection;
