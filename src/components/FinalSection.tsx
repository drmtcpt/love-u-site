import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Circle, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Стандартные планы (показываются, если не вошли в аккаунт)
const DEFAULT_PLANS = [
  { id: "1", text: "Найти друг друга в этом огромном мире", completed: true },
  { id: "2", text: "Понять, что мы — одно целое", completed: true },
  { id: "3", text: "Пережить расстояние", completed: false },
  { id: "4", text: "Обнять тебя крепко-крепко", completed: false },
  { id: "5", text: "Построить наш уютный дом", completed: false },
  { id: "6", text: "Быть счастливыми вечно", completed: true },
];

interface Plan {
  id: string;
  text: string;
  completed: boolean;
}

const FinalSection = () => {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [newPlan, setNewPlan] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию и загружаем планы
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
        fetchPlans();
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchPlans();
      } else {
        setUserId(null);
        setPlans(DEFAULT_PLANS);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (error) console.error(error);
    else if (data && data.length > 0) setPlans(data);
    else setPlans([]); // Если в базе пусто, показываем пустой список (или можно DEFAULT_PLANS)
  };

  const togglePlan = async (plan: Plan) => {
    // Оптимистичное обновление (сразу меняем интерфейс)
    const updated = { ...plan, completed: !plan.completed };
    setPlans(prev => prev.map(p => p.id === plan.id ? updated : p));

    if (userId) {
      await supabase.from("plans").update({ completed: updated.completed }).eq("id", plan.id);
    }
  };

  const addPlan = async () => {
    if (!newPlan.trim() || isAdding) return;
    const text = newPlan.trim();
    setIsAdding(true);

    if (userId) {
      const { data, error } = await supabase
        .from("plans")
        .insert([{ user_id: userId, text, completed: false }])
        .select()
        .single();
      
      if (error) {
        console.error(error);
        alert("Ошибка сохранения: " + (error.message || "Неизвестная ошибка"));
        // Не очищаем поле ввода, чтобы можно было попробовать снова
      } else if (data) {
        setPlans(prev => [...prev, data]);
        setNewPlan(""); // Очищаем только при успехе
      }
    } else {
      // Локально, если не вошли
      setPlans(prev => [...prev, { id: Date.now().toString(), text, completed: false }]);
      setNewPlan("");
    }
    setIsAdding(false);
  };

  const removePlan = async (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    if (userId) {
      await supabase.from("plans").delete().eq("id", id);
    }
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
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onClick={() => togglePlan(plan)}
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
                onClick={(e) => { e.stopPropagation(); removePlan(plan.id); }}
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
              disabled={isAdding}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white placeholder:text-white/30 disabled:opacity-50"
            />
            <button 
              onClick={addPlan}
              disabled={isAdding}
              className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-2 transition-colors text-white disabled:opacity-50"
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
