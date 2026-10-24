import { useState, useEffect } from 'react';
import type { RendezVous } from '../types/rendezvous';
import type { Patient } from '../types/patient';
import {
  getRendezVous,
  createRendezVous,
  updateRendezVous,
  deleteRendezVous,
  getPatients,
} from '../services/api';
import { RendezVousModal } from '../components/RendezVousModal';
import { Plus, Edit2, Trash2, Search, Calendar, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export function RendezVousPage() {
  const [rendezVousList, setRendezVousList] = useState<RendezVous[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TOUS');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRdv, setEditingRdv] = useState<RendezVous | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rdvData, patientsData] = await Promise.all([
        getRendezVous(),
        getPatients(),
      ]);
      setRendezVousList(rdvData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      showToast('Impossible de charger les rendez-vous.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingRdv(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rdv: RendezVous) => {
    setEditingRdv(rdv);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce rendez-vous ?')) {
      try {
        await deleteRendezVous(id);
        showToast('Rendez-vous supprimé avec succès.', 'success');
        fetchData();
      } catch (error) {
        showToast('Erreur lors de la suppression.', 'error');
      }
    }
  };

  const handleSubmit = async (data: Omit<RendezVous, 'id' | 'created_at'>) => {
    try {
      if (editingRdv) {
        await updateRendezVous(editingRdv.id, data);
        showToast('Rendez-vous modifié avec succès.');
      } else {
        await createRendezVous(data);
        showToast('Rendez-vous enregistré avec succès.');
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

  // Filtrage par recherche et par statut
  const filteredRdv = rendezVousList.filter((rdv) => {
    const patientName = getPatientName(rdv.patient).toLowerCase();
    const notes = (rdv.notes || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = patientName.includes(term) || notes.includes(term);
    const matchesStatus = statusFilter === 'TOUS' || rdv.statut === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRdv.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRdv = filteredRdv.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'CONFIRME':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300">Confirmé</span>;
      case 'ANNULE':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300">Annulé</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300">En attente</span>;
    }
  };

  return (
    <div className="lg:p-6 max-w-7xl mx-auto relative">
      {/* Toast */}
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Rendez-vous</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Planifiez, suivez et gérez les rendez-vous des patients.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium transition cursor-pointer shadow-lg shadow-purple-500/20"
        >
          <Plus size={18} />
          Nouveau rendez-vous
        </button>
      </div>

      {/* Barre de recherche et Filtre par statut */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par patient ou notes..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1926] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1926] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRME">Confirmé</option>
            <option value="ANNULE">Annulé</option>
          </select>
        </div>
      </div>

      {/* Liste des Rendez-vous */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement des rendez-vous...</div>
      ) : filteredRdv.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1a1926] rounded-2xl border border-gray-100 dark:border-gray-800">
          <Calendar className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun rendez-vous trouvé.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1926] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/30">
                  <th className="p-4">Date & Heure</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {paginatedRdv.map((rdv) => (
                  <tr key={rdv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                    <td className="p-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {new Date(rdv.date_heure).toLocaleString('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="p-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">
                      {getPatientName(rdv.patient)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(rdv.statut)}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {rdv.notes || '-'}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(rdv)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(rdv.id)}
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

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400 gap-4">
            <div>
              Affichage de <span className="font-semibold text-gray-800 dark:text-white">{startIndex + 1}</span> à{' '}
              <span className="font-semibold text-gray-800 dark:text-white">
                {Math.min(startIndex + itemsPerPage, filteredRdv.length)}
              </span>{' '}
              sur <span className="font-semibold text-gray-800 dark:text-white">{filteredRdv.length}</span> résultats
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

      {/* Modal */}
      <RendezVousModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingRdv}
        patients={patients}
      />
    </div>
  );
}