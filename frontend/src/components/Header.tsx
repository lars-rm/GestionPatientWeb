import { Sun, Moon, Bell, Search } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export function Header({ activeTab, darkMode, setDarkMode }: HeaderProps) {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    patients: 'Gestion des Patients',
    consultations: 'Consultations',
    'rendez-vous': 'Rendez-vous',
    specialites: 'Spécialités Médicales',
  };

  return (
    <header className="h-20 bg-white dark:bg-[#1a1926] border-b border-gray-100 dark:border-gray-800 px-8 flex items-center justify-between transition-colors duration-200">
      {/* Titre du menu actif */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
        {titles[activeTab] || activeTab}
      </h1>

      {/* Recherche & Profil */}
      <div className="flex items-center gap-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm border-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
          />
        </div>

        {/* Bouton Mode Sombre / Clair */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer">
          <Bell size={18} />
        </button>

        {/* Profil Utilisateur */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center">
            DR
          </div>
        </div>
      </div>
    </header>
  );
}