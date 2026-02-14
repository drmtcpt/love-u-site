import { useEffect, useState, useMemo } from "react";

const StarryBackground = () => {
  const [shootingStars, setShootingStars] = useState<{ id: number; top: string; left: string }[]>([]);

  const stars = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      width: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    })), []);

  const petals = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: Math.random() * 8 + 8,
      delay: Math.random() * 10,
    })), []);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      setShootingStars(prev => [...prev.slice(-3), {
        id,
        top: Math.random() * 40 + "%",
        left: Math.random() * 60 + 20 + "%",
      }]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            width: s.width,
            height: s.width,
            top: s.top + "%",
            left: s.left + "%",
            "--duration": s.duration + "s",
            "--delay": s.delay + "s",
          } as React.CSSProperties}
        />
      ))}
      {shootingStars.map(s => (
        <div
          key={s.id}
          className="shooting-star"
          style={{ top: s.top, left: s.left }}
        />
      ))}
      {petals.map(p => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left + "%",
            "--duration": p.duration + "s",
            "--delay": p.delay + "s",
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default StarryBackground;
