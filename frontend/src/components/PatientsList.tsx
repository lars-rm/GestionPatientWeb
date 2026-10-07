import { useEffect, useState } from 'react';
import type { Patient } from '../types/patient';
import { getPatients, createPatient, updatePatient, deletePatient } from '../services/api';
import { PatientModal } from './PatientModal';
import { UserPlus, Pencil, Trash2, Search, RotateCcw, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [queryInput, setQueryInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const formatDateToFR = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error('Erreur chargement patients :', err);
      showToast('Impossible de charger les patients.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Réinitialiser la page à 1 lors d'une recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSave = async (formData: Omit<Patient, 'id' | 'created_at'>) => {
    const isDuplicate = patients.some(
      (p) =>
        p.nom.trim().toLowerCase() === formData.nom.trim().toLowerCase() &&
        p.prenom.trim().toLowerCase() === formData.prenom.trim().toLowerCase() &&
        (!selectedPatient || p.id !== selectedPatient.id)
    );

    if (isDuplicate) {
      throw new Error(`Le patient "${formData.nom} ${formData.prenom}" existe déjà dans la base.`);
    }

    if (selectedPatient) {
      await updatePatient(selectedPatient.id, formData);
      showToast(`Le patient ${formData.nom} ${formData.prenom} a été mis à jour.`);
    } else {
      await createPatient(formData);
      showToast(`Le patient ${formData.nom} ${formData.prenom} a été créé avec succès.`);
    }
    await fetchPatients();
    setIsModalOpen(false);
  };

  const handleDelete = async (p: Patient) => {
    if (confirm(`Voulez-vous supprimer définitivement ${p.nom} ${p.prenom} ?`)) {
      try {
        await deletePatient(p.id);
        showToast(`Patient ${p.nom} ${p.prenom} supprimé.`, 'success');
        await fetchPatients();
      } catch (err) {
        showToast('Erreur lors de la suppression du patient.', 'error');
      }
    }
  };

  // Filtrage et calcul de la pagination
  const filteredPatients = patients.filter((p) =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/80 dark:border-red-800 dark:text-red-300'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchTerm(queryInput)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#1a1926] border border-gray-100 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
            />
          </div>

          <button
            onClick={() => setSearchTerm(queryInput)}
            className="p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all cursor-pointer"
          >
            <Search size={18} />
          </button>

          <button
            onClick={() => {
              setQueryInput('');
              setSearchTerm('');
            }}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedPatient(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all cursor-pointer shadow-sm"
        >
          <UserPlus size={18} />
          Nouveau Patient
        </button>
      </div>

      {/* Tableau des patients */}
      <div className="bg-white dark:bg-[#1a1926] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="p-4">Patient</th>
              <th className="p-4">Date Nais.</th>
              <th className="p-4">Genre</th>
              <th className="p-4">Adresse</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Sang</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  Chargement des données...
                </td>
              </tr>
            ) : currentPatients.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  Aucun patient trouvé.
                </td>
              </tr>
            ) : (
              currentPatients.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                  <td className="p-4 font-medium text-gray-800 dark:text-white">
                    {p.nom} {p.prenom}
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400">{formatDateToFR(p.date_naissance)}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        p.genre === 'M'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                      }`}
                    >
                      {p.genre === 'M' ? 'Masculin' : 'Féminin'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400">{p.adresse || '-'}</td>
                  <td className="p-4 text-gray-500 dark:text-gray-400">{p.telephone || '-'}</td>
                  <td className="p-4 font-semibold text-purple-600 dark:text-purple-400">
                    {p.groupe_sanguin || '-'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPatient(p);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all cursor-pointer"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Barre de Pagination (5 éléments par page) */}
        {!loading && filteredPatients.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
            <div>
              Affichage de <span className="font-semibold text-gray-800 dark:text-white">{startIndex + 1}</span> à{' '}
              <span className="font-semibold text-gray-800 dark:text-white">
                {Math.min(startIndex + itemsPerPage, filteredPatients.length)}
              </span>{' '}
              sur <span className="font-semibold text-gray-800 dark:text-white">{filteredPatients.length}</span> patients
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold text-xs">
                Page {currentPage} sur {totalPages || 1}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={selectedPatient}
      />
    </div>
  );
}