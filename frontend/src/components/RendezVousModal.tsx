import { useState, useEffect } from 'react';
import type { RendezVous } from '../types/rendezvous';
import type { Patient } from '../types/patient';
import { X } from 'lucide-react';

interface RendezVousModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rdvData: Omit<RendezVous, 'id' | 'created_at'>) => Promise<void>;
  initialData?: RendezVous | null;
  patients: Patient[];
}

export function RendezVousModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  patients,
}: RendezVousModalProps) {
  // Format date-heure pour l'input datetime-local (YYYY-MM-DDTHH:mm)
  const now = new Date();
  const formatLocalDateTime = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [formData, setFormData] = useState<{
    patient: number | '';
    date_heure: string;
    statut: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE';
    notes: string;
  }>({
    patient: '',
    date_heure: formatLocalDateTime(now),
    statut: 'EN_ATTENTE',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [globalError, setGlobalError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        patient: initialData.patient,
        date_heure: initialData.date_heure ? initialData.date_heure.slice(0, 16) : formatLocalDateTime(now),
        statut: initialData.statut || 'EN_ATTENTE',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        patient: patients.length > 0 ? patients[0].id : '',
        date_heure: formatLocalDateTime(now),
        statut: 'EN_ATTENTE',
        notes: '',
      });
    }
    setErrors({});
    setGlobalError('');
  }, [initialData, isOpen, patients]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.patient) newErrors.patient = 'Veuillez sélectionner un patient.';
    if (!formData.date_heure) {
      newErrors.date_heure = 'La date et l\'heure sont obligatoires.';
    } else if (!initialData && new Date(formData.date_heure) < new Date()) {
      newErrors.date_heure = 'La date de rendez-vous ne peut pas être dans le passé.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        patient: Number(formData.patient),
        date_heure: new Date(formData.date_heure).toISOString(),
        statut: formData.statut,
        notes: formData.notes.trim() || '',
      };

      await onSubmit(payload as any);
      onClose();
    } catch (err: any) {
      if (err.response && err.response.data) {
        const serverErrors = err.response.data;
        if (typeof serverErrors === 'object') {
          const formattedErrors: { [key: string]: string } = {};
          let globalMsg = '';

          Object.keys(serverErrors).forEach((key) => {
            const val = Array.isArray(serverErrors[key]) ? serverErrors[key].join(' ') : serverErrors[key];
            if (key === 'detail' || key === 'non_field_errors') {
              globalMsg += val + ' ';
            } else {
              formattedErrors[key] = val;
            }
          });

          setErrors((prev) => ({ ...prev, ...formattedErrors }));
          if (globalMsg) setGlobalError(globalMsg.trim());
        } else {
          setGlobalError(String(serverErrors));
        }
      } else {
        setGlobalError(err.message || "Une erreur s'est produite lors de l'enregistrement.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1a1926] rounded-2xl w-full max-w-lg p-5 shadow-xl relative border border-gray-100 dark:border-gray-800">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">
          {initialData ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
        </h2>

        {globalError && (
          <div className="mb-3 p-2.5 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {/* Patient */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Patient <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.patient}
              onChange={(e) => {
                setFormData({ ...formData, patient: e.target.value ? Number(e.target.value) : '' });
                if (errors.patient) setErrors({ ...errors, patient: '' });
              }}
              className={`w-full px-3 py-1.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                errors.patient ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
              }`}
            >
              <option value="">-- Sélectionner un patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} {p.prenom}
                </option>
              ))}
            </select>
            {errors.patient && <p className="mt-0.5 text-[11px] text-red-500 font-medium">{errors.patient}</p>}
          </div>

          {/* Date et Heure */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date et Heure <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.date_heure}
              onChange={(e) => {
                setFormData({ ...formData, date_heure: e.target.value });
                if (errors.date_heure) setErrors({ ...errors, date_heure: '' });
              }}
              className={`w-full px-3 py-1.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                errors.date_heure ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
              }`}
            />
            {errors.date_heure && <p className="mt-0.5 text-[11px] text-red-500 font-medium">{errors.date_heure}</p>}
          </div>

          {/* Statut */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
              className="w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="EN_ATTENTE">En attente</option>
              <option value="CONFIRME">Confirmé</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
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