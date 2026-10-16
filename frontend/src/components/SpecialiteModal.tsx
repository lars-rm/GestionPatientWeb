import { useState, useEffect } from 'react';
import type { Specialite } from '../types/specialite';
import { X } from 'lucide-react';

interface SpecialiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (specialiteData: Omit<Specialite, 'id'>) => Promise<void>;
  initialData?: Specialite | null;
}

export function SpecialiteModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SpecialiteModalProps) {
  const [nom, setNom] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setNom(initialData.nom || '');
    } else {
      setNom('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nom.trim()) {
      setError('Le nom de la spécialité est obligatoire.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ nom: nom.trim() });
      onClose();
    } catch (err: any) {
      if (err.response && err.response.data) {
        const serverErr = err.response.data;
        if (typeof serverErr === 'object' && serverErr.nom) {
          setError(Array.isArray(serverErr.nom) ? serverErr.nom.join(' ') : serverErr.nom);
        } else {
          setError("Une erreur s'est produite lors de l'enregistrement.");
        }
      } else {
        setError(err.message || 'Erreur réseau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1a1926] rounded-2xl w-full max-w-md p-5 shadow-xl relative border border-gray-100 dark:border-gray-800">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
          {initialData ? 'Modifier la spécialité' : 'Nouvelle spécialité'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de la spécialité <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="ex: Cardiologie, Pédiatrie..."
              value={nom}
              onChange={(e) => {
                setNom(e.target.value);
                if (error) setError('');
              }}
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
              }`}
            />
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 text-sm rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}