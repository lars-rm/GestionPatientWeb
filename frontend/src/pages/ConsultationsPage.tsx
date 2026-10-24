import { useState, useEffect } from 'react';
import type { Consultation } from '../types/consultation';
import type { Patient } from '../types/patient';
import type { Specialite } from '../types/specialite';
import {
  getConsultations,
  createConsultation,
  updateConsultation,
  deleteConsultation,
  getPatients,
  getSpecialites,
} from '../services/api';
import { ConsultationModal } from '../components/ConsultationModal';
import { Plus, Edit2, Trash2, Search, FileText, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [consultationsData, patientsData, specialitesData] = await Promise.all([
        getConsultations(),
        getPatients(),
        getSpecialites(),
      ]);
      setConsultations(consultationsData);
      setPatients(patientsData);
      setSpecialites(specialitesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showToast('Impossible de charger les données des consultations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingConsultation(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (consultation: Consultation) => {
    setEditingConsultation(consultation);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette consultation ?')) {
      try {
        await deleteConsultation(id);
        showToast('Consultation supprimée avec succès.', 'success');
        fetchData();
      } catch (error) {
        showToast('Erreur lors de la suppression de la consultation.', 'error');
      }
    }
  };

  const handleSubmit = async (data: Omit<Consultation, 'id' | 'created_at'>) => {
    try {
      if (editingConsultation) {
        await updateConsultation(editingConsultation.id, data);
        showToast('Consultation modifiée avec succès.');
      } else {
        await createConsultation(data);
        showToast('Consultation enregistrée avec succès.');
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      throw error;
    }
  };

  const getPatientName = (patientId: number) => {
    const p = patients.find((p) => p.id === patientId);
    return p ? `${p.nom} ${p.prenom}` : `Patient #${patientId}`;
  };

  const getSpecialiteName = (specId: number) => {
    const s = specialites.find((s) => s.id === specId);
    return s ? s.nom : `Spécialité #${specId}`;
  };

  const filteredConsultations = consultations.filter((c) => {
    const patientName = getPatientName(c.patient).toLowerCase();
    const specName = getSpecialiteName(c.specialite).toLowerCase();
    const diag = (c.diagnostic || '').toLowerCase();
    const motif = ((c as any).motif || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      patientName.includes(term) ||
      specName.includes(term) ||
      diag.includes(term) ||
      motif.includes(term)
    );
  });

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConsultations = filteredConsultations.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Retour à la première page lors d'une recherche
  };

  return (
    <div className="lg:p-6 max-w-7xl mx-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 left-4 right-4 sm:left-auto sm:right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/80 dark:border-red-800 dark:text-red-300'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Consultations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Consultez, ajoutez et modifiez l'historique des consultations médicales.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium transition cursor-pointer shadow-lg shadow-purple-500/20"
        >
          <Plus size={18} />
          Nouvelle consultation
        </button>
      </div>

      {/* Barre de recherche dynamique */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher par patient, spécialité, motif, diagnostic..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1926] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Liste des consultations */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement des consultations...</div>
      ) : filteredConsultations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1a1926] rounded-2xl border border-gray-100 dark:border-gray-800">
          <FileText className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune consultation trouvée.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1926] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/30">
                  <th className="p-4">Date</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Spécialité</th>
                  <th className="p-4">Diagnostic</th>
                  <th className="p-4">Tarif</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {paginatedConsultations.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                    <td className="p-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {new Date(c.date_consultation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">
                      {getPatientName(c.patient)}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                        {getSpecialiteName(c.specialite)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {c.diagnostic}
                    </td>
                    <td className="p-4 font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                      {Math.round(Number(c.tarif)).toLocaleString('fr-FR')} Ar
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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

          {/* Barre de Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400 gap-4">
            <div>
              Affichage de <span className="font-semibold text-gray-800 dark:text-white">{startIndex + 1}</span> à{' '}
              <span className="font-semibold text-gray-800 dark:text-white">
                {Math.min(startIndex + itemsPerPage, filteredConsultations.length)}
              </span>{' '}
              sur <span className="font-semibold text-gray-800 dark:text-white">{filteredConsultations.length}</span> résultats
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="px-3 py-1 font-medium text-gray-800 dark:text-white">
                Page {currentPage} sur {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout / modification */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingConsultation}
        patients={patients}
        specialites={specialites}
      />
    </div>
  );
}