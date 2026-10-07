export interface Patient {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  genre: 'M' | 'F';
  telephone: string;
  adresse?: string | null;
  groupe_sanguin?: string | null;
  created_at?: string;
}