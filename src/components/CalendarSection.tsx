// c:\Users\Ali\Desktop\Love u\src\components\CalendarSection.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
}

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const CalendarSection = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Получаем текущий месяц и год для отображения
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Вычисляем дни в месяце
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // Сдвигаем, чтобы Пн был 0

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
        fetchEvents(data.session.user.id);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchEvents(session.user.id);
      } else {
        setUserId(null);
        setEvents([]);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const fetchEvents = async (uid: string) => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", uid);
    if (error) console.error(error);
    else if (data) setEvents(data);
  };

  const addEvent = async () => {
    if (!newEventTitle.trim() || !selectedDate || !userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("calendar_events")
      .insert([{ user_id: userId, title: newEventTitle.trim(), date: selectedDate }])
      .select()
      .single();

    if (error) {
      alert("Ошибка: " + error.message);
    } else if (data) {
      setEvents([...events, data]);
      setNewEventTitle("");
    }
    setLoading(false);
  };

  const deleteEvent = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (!error) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);

  const renderDays = () => {
    const days = [];
    // Пустые ячейки до начала месяца
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const isSelected = selectedDate === dateStr;

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedDate(dateStr)}
          className={`aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer relative transition-colors ${
            isSelected 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
              : isToday 
                ? "bg-white/10 border border-primary/50 text-accent" 
                : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="text-sm font-medium">{day}</span>
          {dayEvents.length > 0 && (
            <div className="flex gap-0.5 mt-1">
              {dayEvents.slice(0, 3).map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`} />
              ))}
            </div>
          )}
        </motion.div>
      );
    }
    return days;
  };

  return (
    <section className="relative z-10 py-20 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl sm:text-4xl text-center mb-12 glow-text"
      >
        📅 Наш Календарь
      </motion.h2>

      <div className="max-w-4xl mx-auto grid md:grid-cols-[1.5fr_1fr] gap-8">
        {/* Календарь */}
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-display text-xl capitalize">{MONTHS[month]} {year}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-xs text-muted-foreground font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderDays()}
          </div>
        </div>

        {/* Список событий для выбранной даты */}
        <div className="glass-effect rounded-2xl p-6 flex flex-col h-full min-h-[300px]">
          <h3 className="font-display text-xl mb-4 flex items-center gap-2">
            {selectedDate ? (
              <>
                События {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </>
            ) : (
              "Выберите дату ✨"
            )}
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4 custom-scrollbar">
            {selectedDate ? (
              getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map(event => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group"
                  >
                    <div className="flex items-center gap-3">
                      <Heart size={14} className="text-primary fill-primary/20" />
                      <span className="text-sm">{event.title}</span>
                    </div>
                    <button 
                      onClick={() => deleteEvent(event.id)}
                      className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  На этот день пока нет планов.<br/>Самое время что-то придумать! 😉
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <CalendarIcon size={48} className="mb-4" />
                <p className="text-sm text-center">Нажми на дату,<br/>чтобы добавить событие</p>
              </div>
            )}
          </div>

          {/* Форма добавления */}
          {selectedDate && (
            <div className="flex gap-2 mt-auto pt-4 border-t border-white/10">
              <input
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                placeholder="Новое событие..."
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                disabled={loading}
              />
              <button
                onClick={addEvent}
                disabled={loading || !newEventTitle.trim()}
                className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded-xl p-2 transition-colors disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CalendarSection;
