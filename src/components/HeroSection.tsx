import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const START_DATE = new Date("2025-10-10T00:00:00");

const HeroSection = () => {
  const [time, setTime] = useState(getTimeSince());
  const [heartClicks, setHeartClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  function getTimeSince() {
    const now = new Date();
    const diff = now.getTime() - START_DATE.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes };
  }

  useEffect(() => {
    document.title = "Котя и Зая";
    const interval = setInterval(() => setTime(getTimeSince()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleHeartClick = () => {
    const newCount = heartClicks + 1;
    setHeartClicks(newCount);
    if (newCount >= 5) {
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 4000);
      setHeartClicks(0);
    }
  };

  const scrollToStory = () => {
    const element = document.getElementById("love-story");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn("Element with id 'love-story' not found");
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Heart
          className="mx-auto mb-6 text-secondary cursor-pointer heartbeat-hover"
          size={48}
          fill="hsl(340 70% 55%)"
          onClick={handleHeartClick}
        />
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold leading-tight glow-text max-w-3xl mx-auto">
          «Даже если между нами километры — моё сердце всегда рядом с тобой.»
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-10 glass-effect rounded-2xl px-6 py-4 sm:px-10 sm:py-6"
      >
        <p className="text-sm text-muted-foreground mb-2 font-body">Мы вместе уже:</p>
        <div className="flex gap-4 sm:gap-8 text-center">
          {[
            { value: time.days, label: "дней" },
            { value: time.hours, label: "часов" },
            { value: time.minutes, label: "минут" },
          ].map(item => (
            <div key={item.label}>
              <span className="text-3xl sm:text-5xl font-display font-bold text-accent">{item.value}</span>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        onClick={scrollToStory}
        className="mt-10 px-8 py-3 rounded-full bg-primary/20 border border-primary/40 text-primary-foreground font-body hover:bg-primary/30 transition-all hover:scale-105 float-animation"
      >
        Открой нашу историю ✨
      </motion.button>

      {showEasterEgg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-20 glass-effect rounded-2xl px-6 py-4 text-accent font-display text-xl italic"
        >
          💛 Ты нашла секрет! Я люблю тебя бесконечно 💛
        </motion.div>
      )}
    </section>
  );
};

export default HeroSection;
