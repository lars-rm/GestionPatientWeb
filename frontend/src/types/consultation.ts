export interface Consultation {
  id: number;
  patient: number;
  patient_nom?: string;
  patient_prenom?: string;
  specialite: number | null;
  specialite_nom?: string | null;
  date_consultation: string;
  motif: string;
  diagnostic: string | null;
  prescription: string | null;
  tarif: number | string;
  created_at?: string;
}
