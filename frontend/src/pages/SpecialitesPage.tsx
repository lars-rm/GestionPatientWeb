import { useState, useEffect } from 'react';
import type { Specialite } from '../types/specialite';
import {
  getSpecialites,
  createSpecialite,
  updateSpecialite,
  deleteSpecialite,
} from '../services/api';
import { SpecialiteModal } from '../components/SpecialiteModal';
import { Plus, Pencil, Trash2, Search, Award } from 'lucide-react';
import { Toast } from '../components/Toast';
import { Pagination } from '../components/Pagination';
import { useToast } from '../hooks/useToast';

export function SpecialitesPage() {
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialite, setEditingSpecialite] = useState<Specialite | null>(null);

  const { toast, showToast } = useToast();

  const fetchSpecialites = async () => {
    try {
      setLoading(true);
      const data = await getSpecialites();
      setSpecialites(data);
    } catch (error) {
      console.error('Erreur lors du chargement des spécialités:', error);
      showToast('Impossible de charger les spécialités.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialites();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSpecialite(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (specialite: Specialite) => {
    setEditingSpecialite(specialite);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette spécialité ?')) {
      try {
        await deleteSpecialite(id);
        showToast('Spécialité supprimée avec succès.', 'success');
        fetchSpecialites();
      } catch {
        showToast('Erreur lors de la suppression de la spécialité.', 'error');
      }
    }
  };

  const handleSubmit = async (data: Omit<Specialite, 'id'>) => {
    if (editingSpecialite) {
      await updateSpecialite(editingSpecialite.id, data);
      showToast(`La spécialité "${data.nom}" a été modifiée avec succès.`);
    } else {
      await createSpecialite(data);
      showToast(`La spécialité "${data.nom}" a été ajoutée avec succès.`);
    }
    fetchSpecialites();
    setIsModalOpen(false);
  };

  const filteredSpecialites = specialites.filter((s) =>
    s.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcul de la pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSpecialites = filteredSpecialites.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Retour à la première page lors d'une recherche
  };

  return (
    <div className="lg:p-6 max-w-7xl mx-auto relative">
      <Toast toast={toast} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Spécialités</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gérez les spécialités médicales disponibles dans votre établissement.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium transition cursor-pointer shadow-lg shadow-purple-500/20"
        >
          <Plus size={18} />
          Nouvelle spécialité
        </button>
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher une spécialité..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Tableau des spécialités */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement des spécialités...</div>
      ) : filteredSpecialites.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800">
          <Award className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune spécialité trouvée.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/30">
                <th className="p-4">Spécialité</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {paginatedSpecialites.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                  <td className="p-4 font-medium text-gray-800 dark:text-white">
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                      {s.nom}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="p-1.5 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
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

          <Pagination
            currentPage={currentPage}
            totalItems={filteredSpecialites.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal d'ajout / modification */}
      <SpecialiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingSpecialite}
      />
    </div>
  );
}