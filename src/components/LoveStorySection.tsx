import { motion } from "framer-motion";

const phrases = [
  "Я ценю, как ты меня поддерживаешь.",
  "Ты — мой самый родной человек.",
  "С тобой даже расстояние не страшно.",
  "Я выбираю тебя каждый день.",
  "Ты — моя тишина и мой смех.",
  "Каждый день с тобой — подарок.",
];

const LoveStorySection = () => {
  return (
    <section id="love-story" className="relative z-10 py-20 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl sm:text-4xl text-center mb-16 glow-text"
      >
        💌 Наша история
      </motion.h2>

      <div className="max-w-xl mx-auto space-y-16">
        {phrases.map((phrase, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="glass-effect rounded-2xl p-6 sm:p-8"
          >
            <p className="font-display italic text-xl sm:text-2xl text-center leading-relaxed">
              «{phrase}»
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LoveStorySection;
