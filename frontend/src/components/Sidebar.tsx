import { LayoutDashboard, Users, Stethoscope, Calendar, Award, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'consultations', label: 'Consultations', icon: Stethoscope },
    { id: 'rendez-vous', label: 'Rendez-vous', icon: Calendar },
    { id: 'specialites', label: 'Spécialités', icon: Award },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#1a1926] border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between h-screen transition-colors duration-200">
      <div>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <span className="font-bold text-xl tracking-wide dark:text-white">MEDICARE</span>
        </div>

        {/* Menu Navigation */}
        <nav className="px-4 space-y-1 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer">
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}