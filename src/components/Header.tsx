import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 h-14">
        <h1 className="text-2xl font-bold text-sky-500">onlyMe</h1>
        <div className="flex items-center space-x-2">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
} 