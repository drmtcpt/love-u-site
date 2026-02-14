import { motion } from "framer-motion";

const FinalSection = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="font-display text-4xl sm:text-6xl font-bold glow-text max-w-2xl leading-tight"
      >
        Расстояние — временно. Мы — навсегда.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 1 }}
        className="mt-8 font-display italic text-xl text-accent"
      >
        С любовью из Баку в Шахунью 💜
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
        onClick={scrollToTop}
        className="mt-12 px-6 py-3 rounded-full border border-primary/30 text-muted-foreground hover:text-foreground hover:border-primary/60 transition-all text-sm font-body"
      >
        Пересмотреть снова ↑
      </motion.button>
    </section>
  );
};

export default FinalSection;
