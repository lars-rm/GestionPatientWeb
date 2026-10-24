import { useState, useEffect } from 'react';
import type { Patient } from '../types/patient';
import { X } from 'lucide-react';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patientData: Omit<Patient, 'id' | 'created_at'>) => Promise<void>;
  initialData?: Patient | null;
}

export function PatientModal({ isOpen, onClose, onSubmit, initialData }: PatientModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<{
    nom: string;
    prenom: string;
    date_naissance: string;
    genre: 'M' | 'F';
    telephone: string;
    adresse: string;
    groupe_sanguin: string;
  }>({
    nom: '',
    prenom: '',
    date_naissance: '',
    genre: 'M',
    telephone: '',
    adresse: '',
    groupe_sanguin: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [globalError, setGlobalError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nom: initialData.nom,
        prenom: initialData.prenom,
        date_naissance: initialData.date_naissance,
        genre: initialData.genre as 'M' | 'F',
        telephone: initialData.telephone || '',
        adresse: initialData.adresse || '',
        groupe_sanguin: initialData.groupe_sanguin || '',
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        date_naissance: '',
        genre: 'M',
        telephone: '',
        adresse: '',
        groupe_sanguin: '',
      });
    }
    setErrors({});
    setGlobalError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire.';
    }
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est obligatoire.';
    }
    if (!formData.date_naissance) {
      newErrors.date_naissance = 'La date de naissance est obligatoire.';
    } else if (formData.date_naissance > today) {
      newErrors.date_naissance = 'La date de naissance ne peut pas être dans le futur.';
    }
    if (!formData.adresse.trim()) {
      newErrors.adresse = "L'adresse est obligatoire.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setGlobalError(err.message || "Une erreur s'est produite lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1a1926] rounded-2xl w-full max-h-[90vh] overflow-y-auto max-w-2xl p-6 shadow-xl relative border border-gray-100 dark:border-gray-800">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          {initialData ? 'Modifier le patient' : 'Nouveau patient'}
        </h2>

        {/* Message d'erreur global (ex: Doublon ou serveur) */}
        {globalError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-xl dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            {globalError}
          </div>
        )}

        {/* noValidate désactive les bulles HTML5 natives */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => {
                  setFormData({ ...formData, nom: e.target.value });
                  if (errors.nom) setErrors({ ...errors, nom: '' });
                }}
                className={`w-full px-4 py-2 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.nom
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
                }`}
              />
              {errors.nom && <p className="mt-1 text-xs text-red-500 font-medium">{errors.nom}</p>}
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => {
                  setFormData({ ...formData, prenom: e.target.value });
                  if (errors.prenom) setErrors({ ...errors, prenom: '' });
                }}
                className={`w-full px-4 py-2 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.prenom
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
                }`}
              />
              {errors.prenom && <p className="mt-1 text-xs text-red-500 font-medium">{errors.prenom}</p>}
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de naissance <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                max={today}
                value={formData.date_naissance}
                onChange={(e) => {
                  setFormData({ ...formData, date_naissance: e.target.value });
                  if (errors.date_naissance) setErrors({ ...errors, date_naissance: '' });
                }}
                className={`w-full px-4 py-2 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.date_naissance
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
                }`}
              />
              {errors.date_naissance && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.date_naissance}</p>
              )}
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Genre <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value as 'M' | 'F' })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => {
                  setFormData({ ...formData, adresse: e.target.value });
                  if (errors.adresse) setErrors({ ...errors, adresse: '' });
                }}
                className={`w-full px-4 py-2 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.adresse
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
                }`}
              />
              {errors.adresse && <p className="mt-1 text-xs text-red-500 font-medium">{errors.adresse}</p>}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
              <input
                type="text"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Groupe Sanguin */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Groupe Sanguin</label>
              <select
                value={formData.groupe_sanguin}
                onChange={(e) => setFormData({ ...formData, groupe_sanguin: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Non précisé</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}