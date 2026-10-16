import axios from 'axios';
import type { Patient } from '../types/patient';
import type { Consultation } from '../types/consultation';
import type { Specialite } from '../types/specialite';
import type { RendezVous } from '../types/rendezvous';

const BASE_URL = 'http://127.0.0.1:8000/api';

// --- PATIENTS ---
export const getPatients = async (): Promise<Patient[]> => {
  const response = await axios.get<Patient[]>(`${BASE_URL}/patients/`);
  return response.data;
};

export const createPatient = async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
  const response = await axios.post<Patient>(`${BASE_URL}/patients/`, patient);
  return response.data;
};

export const updatePatient = async (id: number, patient: Partial<Patient>): Promise<Patient> => {
  const response = await axios.put<Patient>(`${BASE_URL}/patients/${id}/`, patient);
  return response.data;
};

export const deletePatient = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/patients/${id}/`);
};

// --- SPÉCIALITÉS ---
export const getSpecialites = async (): Promise<Specialite[]> => {
  const response = await axios.get<Specialite[]>(`${BASE_URL}/specialites/`);
  return response.data;
};

export const createSpecialite = async (specialite: Omit<Specialite, 'id'>): Promise<Specialite> => {
  const response = await axios.post<Specialite>(`${BASE_URL}/specialites/`, specialite);
  return response.data;
};

export const updateSpecialite = async (id: number, specialite: Partial<Specialite>): Promise<Specialite> => {
  const response = await axios.put<Specialite>(`${BASE_URL}/specialites/${id}/`, specialite);
  return response.data;
};

export const deleteSpecialite = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/specialites/${id}/`);
};

// --- CONSULTATIONS ---
export const getConsultations = async (): Promise<Consultation[]> => {
  const response = await axios.get<Consultation[]>(`${BASE_URL}/consultations/`);
  return response.data;
};

export const createConsultation = async (
  consultation: Omit<Consultation, 'id' | 'created_at'>
): Promise<Consultation> => {
  const response = await axios.post<Consultation>(`${BASE_URL}/consultations/`, consultation);
  return response.data;
};

export const updateConsultation = async (
  id: number,
  consultation: Partial<Consultation>
): Promise<Consultation> => {
  const response = await axios.put<Consultation>(`${BASE_URL}/consultations/${id}/`, consultation);
  return response.data;
};

export const deleteConsultation = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/consultations/${id}/`);
};

// --- RENDEZ-VOUS ---
export const getRendezVous = async (): Promise<RendezVous[]> => {
  const response = await axios.get<RendezVous[]>(`${BASE_URL}/rendez-vous/`);
  return response.data;
};

export const createRendezVous = async (
  rdv: Omit<RendezVous, 'id' | 'created_at'>
): Promise<RendezVous> => {
  const response = await axios.post<RendezVous>(`${BASE_URL}/rendez-vous/`, rdv);
  return response.data;
};

export const updateRendezVous = async (
  id: number,
  rdv: Partial<RendezVous>
): Promise<RendezVous> => {
  const response = await axios.put<RendezVous>(`${BASE_URL}/rendez-vous/${id}/`, rdv);
  return response.data;
};

export const deleteRendezVous = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/rendez-vous/${id}/`);
};