import { useAuth } from '@/contexts/AuthContext';
import { LogOut, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const { profile, logout } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto flex justify-end">
        <div className="glass-effect flex items-center gap-3 px-4 py-2 rounded-full">
          <img src={profile.avatar_url} alt={profile.username} className="w-8 h-8 rounded-full" />
          <span className="text-sm font-bold">{profile.username}</span>
          <button onClick={logout} className="text-muted-foreground hover:text-white transition-colors ml-2">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
