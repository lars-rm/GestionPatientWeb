import { useEffect, useState } from 'react';
import type { Patient } from '../types/patient';
import { getPatients, createPatient, updatePatient, deletePatient } from '../services/api';
import { PatientModal } from './PatientModal';
import { UserPlus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { Toast } from './Toast';
import { Pagination } from './Pagination';
import { useToast } from '../hooks/useToast';

export function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const { toast, showToast } = useToast();

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
      } catch {
        showToast('Erreur lors de la suppression du patient.', 'error');
      }
    }
  };

  // Filtrage et calcul de la pagination
  const filteredPatients = patients.filter((p) =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="lg:p-6 max-w-7xl mx-auto relative">
      <Toast toast={toast} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Patients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ajoutez, modifiez et recherchez les dossiers des patients.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPatient(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium transition cursor-pointer shadow-lg shadow-purple-500/20"
        >
          <UserPlus size={18} />
          Nouveau patient
        </button>
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Tableau des patients */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement des patients...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800">
          <Users className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun patient trouvé.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/30">
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
                {currentPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                    <td className="p-4 font-medium text-gray-800 dark:text-white">
                      {p.nom} {p.prenom}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{formatDateToFR(p.date_naissance)}</td>
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
                    <td className="p-4 text-gray-600 dark:text-gray-300">{p.adresse || '-'}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{p.telephone || '-'}</td>
                    <td className="p-4 font-semibold text-purple-600 dark:text-purple-400">
                      {p.groupe_sanguin || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPatient(p);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredPatients.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={selectedPatient}
      />
    </div>
  );
}
