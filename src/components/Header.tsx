import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Если пользователь не авторизован, хедер не показываем (или можно показать кнопку входа)
  if (!user) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto flex justify-end">
        <div className="glass-effect flex items-center gap-3 px-4 py-2 rounded-full">
          {/* <img src={profile.avatar_url} alt={profile.username} className="w-8 h-8 rounded-full" /> */}
          {/* <span className="text-sm font-bold">{profile.username}</span> */}
          <span className="text-sm font-bold text-white">Мой аккаунт</span>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-white transition-colors ml-2" title="Выйти">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
