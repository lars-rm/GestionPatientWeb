import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PatientsList } from './components/PatientsList';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('patients');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-[#f8f9fa] dark:bg-[#12111a] text-gray-800 dark:text-gray-100 font-sans transition-colors duration-200">
      {/* Menu latéral */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Zone Principale */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barre supérieure */}
        <Header activeTab={activeTab} darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Zone de contenu dynamique */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'patients' && <PatientsList />}

          {activeTab === 'dashboard' && (
            <div className="bg-white dark:bg-[#1a1926] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Tableau de bord</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Les cartes de statistiques s'afficheront ici.
              </p>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="bg-white dark:bg-[#1a1926] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Consultations</h2>
              <p className="text-gray-500 dark:text-gray-400">Gestion des consultations.</p>
            </div>
          )}

          {activeTab === 'rendez-vous' && (
            <div className="bg-white dark:bg-[#1a1926] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Rendez-vous</h2>
              <p className="text-gray-500 dark:text-gray-400">Gestion des rendez-vous.</p>
            </div>
          )}

          {activeTab === 'specialites' && (
            <div className="bg-white dark:bg-[#1a1926] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Spécialités</h2>
              <p className="text-gray-500 dark:text-gray-400">Gestion des spécialités médicales.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;