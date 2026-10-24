export type StatutRendezVous = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE';

export interface RendezVous {
  id: number;
  patient: number;
  patient_nom?: string;
  patient_prenom?: string;
  date_heure: string;
  statut: StatutRendezVous;
  notes?: string | null;
  created_at?: string;
}
