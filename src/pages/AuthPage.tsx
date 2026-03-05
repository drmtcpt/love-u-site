import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';

// Карта для сопоставления имен пользователей с их email
const USER_EMAIL_MAP: { [key: string]: string } = {
  'Зая2009': 'zaya2009@our.love',
  'Котя2007': 'kotya2007@our.love',
};

const AuthPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = USER_EMAIL_MAP[username];
    if (!email) {
      setError('Неверное имя пользователя');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Неверный пароль или имя пользователя');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleLogin}
          className="glass-effect rounded-2xl p-8 shadow-lg"
        >
          <div className="text-center mb-8">
            <Heart className="mx-auto text-primary h-12 w-12" />
            <h1 className="font-display text-3xl mt-4 glow-text">Наш мир</h1>
            <p className="text-muted-foreground text-sm mt-1">Вход для своих</p>
          </div>

          {error && (
            <p className="bg-red-500/20 text-red-300 text-sm text-center p-3 rounded-lg mb-4">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Имя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white placeholder:text-white/30"
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white placeholder:text-white/30"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
