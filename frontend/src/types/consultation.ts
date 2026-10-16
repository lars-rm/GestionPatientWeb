export interface Consultation {
  id: number;
  patient: number; 
  patient_nom?: string; 
  patient_prenom?: string; 
  specialite: number; 
  specialite_nom?: string; 
  date_consultation: string; 
  diagnostic: string;
  prescription?: string | null;
  notes?: string | null;
  tarif: number | string;
  created_at?: string;
}