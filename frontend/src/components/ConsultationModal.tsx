import { useState, useEffect } from 'react';
import type { Consultation } from '../types/consultation';
import type { Patient } from '../types/patient';
import type { Specialite } from '../types/specialite';
import { X } from 'lucide-react';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (consultationData: Omit<Consultation, 'id' | 'created_at'>) => Promise<void>;
  initialData?: Consultation | null;
  patients: Patient[];
  specialites: Specialite[];
}

export function ConsultationModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  patients,
  specialites,
}: ConsultationModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<{
    patient: number | '';
    specialite: number | '';
    date_consultation: string;
    motif: string;
    diagnostic: string;
    prescription: string;
    notes: string;
    tarif: string | number;
  }>({
    patient: '',
    specialite: '',
    date_consultation: today,
    motif: '',
    diagnostic: '',
    prescription: '',
    notes: '',
    tarif: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [globalError, setGlobalError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        patient: initialData.patient,
        specialite: initialData.specialite,
        date_consultation: initialData.date_consultation ? initialData.date_consultation.split('T')[0] : today,
        motif: (initialData as any).motif || '',
        diagnostic: initialData.diagnostic || '',
        prescription: initialData.prescription || '',
        notes: initialData.notes || '',
        tarif: initialData.tarif !== undefined && initialData.tarif !== null ? String(initialData.tarif) : '',
      });
    } else {
      setFormData({
        patient: patients.length > 0 ? patients[0].id : '',
        specialite: specialites.length > 0 ? specialites[0].id : '',
        date_consultation: today,
        motif: '',
        diagnostic: '',
        prescription: '',
        notes: '',
        tarif: '',
      });
    }
    setErrors({});
    setGlobalError('');
  }, [initialData, isOpen, patients, specialites]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.patient) newErrors.patient = 'Veuillez sélectionner un patient.';
    if (!formData.specialite) newErrors.specialite = 'Veuillez sélectionner une spécialité.';
    if (!formData.date_consultation) {
      newErrors.date_consultation = 'La date est obligatoire.';
    } else if (formData.date_consultation > today) {
      newErrors.date_consultation = 'La date ne peut pas être dans le futur.';
    }
    if (!formData.motif.trim()) newErrors.motif = 'Le motif de consultation est obligatoire.';
    if (!formData.diagnostic.trim()) newErrors.diagnostic = 'Le diagnostic est obligatoire.';
    if (formData.tarif === '' || isNaN(Number(formData.tarif)) || Number(formData.tarif) < 0) {
      newErrors.tarif = 'Tarif invalide.';
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
        specialite: Number(formData.specialite),
        date_consultation: formData.date_consultation,
        motif: formData.motif.trim(),
        diagnostic: formData.diagnostic.trim(),
        prescription: formData.prescription.trim() || null,
        notes: formData.notes.trim() || null,
        tarif: Number(formData.tarif),
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
      <div className="bg-white dark:bg-[#1a1926] rounded-2xl w-full max-w-xl p-5 shadow-xl relative border border-gray-100 dark:border-gray-800">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">
          {initialData ? 'Modifier la consultation' : 'Nouvelle consultation'}
        </h2>

        {globalError && (
          <div className="mb-3 p-2.5 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* Spécialité */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Spécialité <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.specialite}
                onChange={(e) => {
                  setFormData({ ...formData, specialite: e.target.value ? Number(e.target.value) : '' });
                  if (errors.specialite) setErrors({ ...errors, specialite: '' });
                }}
                className={`w-full px-3 py-1.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.specialite ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
                }`}
              >
                <option value="">-- Sélectionner une spécialité --</option>
                {specialites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nom}
                  </option>
                ))}
              </select>
              {errors.specialite && <p className="mt-0.5 text-[11px] text-red-500 font-medium">{errors.specialite}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de consultation <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                max={today}
                value={formData.date_consultation}
                onChange={(e) => {
                  setFormData({ ...formData, date_consultation: e.target.value });
                  if (errors.date_consultation) setErrors({ ...errors, date_consultation: '' });
                }}
                className={`w-full px-3 py-1.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.date_consultation ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
                }`}
              />
              {errors.date_consultation && <p className="mt-0.5 text-[11px] text-red-500 font-medium">{errors.date_consultation}</p>}
            </div>

            {/* Tarif */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tarif <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.tarif}
                onChange={(e) => {
                  setFormData({ ...formData, tarif: e.target.value });
                  if (errors.tarif) setErrors({ ...errors, tarif: '' });
                }}
                className={`w-full px-3 py-1.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.tarif ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
                }`}
              />
              {errors.tarif && <p className="mt-0.5 text-[11px] text-red-500 font-medium">{errors.tarif}</p>}
            </div>

            {/* Motif */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Motif de consultation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.motif}
                onChange={(e) => {
                  setFormData({ ...formData, motif: e.target.value });
                  if (errors.motif) setErrors({ ...errors, motif: '' });
                }}
                className={`w-full px-3 py-1.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.motif ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
                }`}
              />
              {errors.motif && <p className="mt-0.5 text-[11px] text-red-500 font-medium">{errors.motif}</p>}
            </div>

            {/* Diagnostic */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Diagnostic <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={formData.diagnostic}
                onChange={(e) => {
                  setFormData({ ...formData, diagnostic: e.target.value });
                  if (errors.diagnostic) setErrors({ ...errors, diagnostic: '' });
                }}
                className={`w-full px-3 py-1.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.diagnostic ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500'
                }`}
              />
              {errors.diagnostic && <p className="mt-0.5 text-[11px] text-red-500 font-medium">{errors.diagnostic}</p>}
            </div>

            {/* Prescription & Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ordonnance / Prescription</label>
              <textarea
                rows={1}
                value={formData.prescription}
                onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                className="w-full px-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
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