import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PatientsList } from './components/PatientsList';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { SpecialitesPage } from './pages/SpecialitesPage';
import { RendezVousPage } from './pages/RendezVousPage';
import { DashboardPage } from './pages/DashboardPage';

export function App() {
  // MODIFICATION ICI : 'dashboard' au lieu de 'patients' pour l'affichage à l'ouverture
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-dvh bg-[#f8f9fa] dark:bg-[#12111a] text-gray-800 dark:text-gray-100 font-sans transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'patients' && <PatientsList />}

          {activeTab === 'dashboard' && <DashboardPage />}

          {activeTab === 'consultations' && <ConsultationsPage />}

          {activeTab === 'rendez-vous' && <RendezVousPage />}

          {activeTab === 'specialites' && <SpecialitesPage />}
        </main>
      </div>
    </div>
  );
}

export default App;