import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, 
  UserCog, 
  Shield, 
  DollarSign, 
  HelpCircle, 
  Mail, 
  FileText,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

function MenuItem({ icon, title, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="text-gray-600 dark:text-gray-400">
          {icon}
        </div>
        <span className="text-gray-900 dark:text-white">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      icon: <UserCog className="w-5 h-5" />,
      title: "Manage Profile",
      onClick: () => navigate('/manage-profile')
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Security",
      onClick: () => navigate('/settings/security')
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Earnings",
      onClick: () => navigate('/settings/earnings')
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: "Help and Support",
      onClick: () => navigate('/settings/help')
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Contact Us",
      onClick: () => navigate('/settings/contact')
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Terms and Conditions",
      onClick: () => console.log("Terms clicked")
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="pt-14 pb-16 px-4">
        <div className="max-w-md mx-auto">
          {/* Menu List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-4 divide-y divide-gray-200 dark:divide-gray-700">
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                title={item.title}
                onClick={item.onClick}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}