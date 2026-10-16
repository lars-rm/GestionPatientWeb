export interface RendezVous {
  id: number;
  patient: number;
  patient_nom?: string;
  patient_prenom?: string;
  date_heure: string;
  statut: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE';
  notes?: string;
  created_at?: string;
}