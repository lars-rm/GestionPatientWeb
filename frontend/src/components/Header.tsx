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

      <div className="flex items-center gap-4">
        {/* Bouton Mode Sombre / Clair */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}