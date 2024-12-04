import { NavLink } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';

export default function BottomNav() {
  const iconClass = "w-6 h-6";
  const linkClass = "flex flex-col items-center justify-center flex-1 py-3 text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400";
  const activeLinkClass = "text-sky-500 dark:text-sky-400";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe">
      <div className="flex justify-around items-center max-w-md mx-auto relative px-2">
        <NavLink to="/" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <Home className={iconClass} />
          <span className="text-xs mt-1">Home</span>
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <Search className={iconClass} />
          <span className="text-xs mt-1">Explore</span>
        </NavLink>
        
        <NavLink to="/create" className="flex items-center justify-center flex-1 py-3">
          <div className="bg-sky-500 rounded-full p-3 shadow-lg hover:bg-sky-600 transition-colors">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </NavLink>

        <NavLink to="/chat" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <MessageCircle className={iconClass} />
          <span className="text-xs mt-1">Chat</span>
        </NavLink>
        <NavLink to="/profile/me" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <User className={iconClass} />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}