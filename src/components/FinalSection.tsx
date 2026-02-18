import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Circle, Plus, Trash2 } from "lucide-react";

// ✏️ ТУТ МОЖНО МЕНЯТЬ ВАШИ ПЛАНЫ
const PLANS = [
  { text: "Найти друг друга в этом огромном мире", completed: true },
  { text: "Понять, что мы — одно целое", completed: true },
  { text: "Пережить расстояние", completed: false }, // false - значит еще не выполнено (пустой кружок)
  { text: "Обнять тебя крепко-крепко", completed: false },
  { text: "Построить наш уютный дом", completed: false },
  { text: "Быть счастливыми вечно", completed: true }, // Это мы уже выполняем :)
];

const FinalSection = () => {
  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem("our_plans");
    return saved ? JSON.parse(saved) : PLANS;
  });
  const [newPlan, setNewPlan] = useState("");

  useEffect(() => {
    localStorage.setItem("our_plans", JSON.stringify(plans));
  }, [plans]);

  const togglePlan = (index: number) => {
    setPlans(prev => prev.map((p, i) => i === index ? { ...p, completed: !p.completed } : p));
  };

  const addPlan = () => {
    if (!newPlan.trim()) return;
    setPlans(prev => [...prev, { text: newPlan.trim(), completed: false }]);
    setNewPlan("");
  };

  const removePlan = (index: number) => {
    setPlans(prev => prev.filter((_, i) => i !== index));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center py-20">
      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="font-display text-4xl sm:text-6xl font-bold glow-text max-w-2xl leading-tight"
      >
        Расстояние — временно. Мы — навсегда.
      </motion.h2>

      {/* Блок с планами */}
      <div className="mt-16 max-w-md w-full text-left">
        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl mb-6 text-center text-white/90"
        >
          Наши планы 📝
        </motion.h3>
        <div className="flex flex-col gap-3">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => togglePlan(i)}
              className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm transition-colors cursor-pointer select-none group ${
                plan.completed 
                  ? "bg-primary/10 border-primary/30" 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className={`p-1 rounded-full flex-shrink-0 ${plan.completed ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"}`}>
                {plan.completed ? <Check size={16} /> : <Circle size={16} />}
              </div>
              <span className={`font-body text-sm sm:text-base flex-1 ${plan.completed ? "text-white" : "text-muted-foreground"}`}>
                {plan.text}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); removePlan(i); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-400 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
          
          {/* Add new plan input */}
          <div className="flex gap-2 mt-2">
            <input 
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlan()}
              placeholder="Добавить новую мечту..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white placeholder:text-white/30"
            />
            <button 
              onClick={addPlan}
              className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-2 transition-colors text-white"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 1 }}
        className="mt-16 font-display italic text-xl text-accent"
      >
        С любовью из Баку в Шахунью 💜
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
        onClick={scrollToTop}
        className="mt-8 px-6 py-3 rounded-full border border-primary/30 text-muted-foreground hover:text-foreground hover:border-primary/60 transition-all text-sm font-body"
      >
        Пересмотреть снова ↑
      </motion.button>
    </section>
  );
};

export default FinalSection;
