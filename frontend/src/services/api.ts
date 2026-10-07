import axios from 'axios';
import type { Patient } from '../types/patient';

const API_URL = 'http://127.0.0.1:8000/api/patients/';

export const getPatients = async (): Promise<Patient[]> => {
  const response = await axios.get<Patient[]>(API_URL);
  return response.data;
};

export const createPatient = async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
  const response = await axios.post<Patient>(API_URL, patient);
  return response.data;
};

export const updatePatient = async (id: number, patient: Partial<Patient>): Promise<Patient> => {
  const response = await axios.put<Patient>(`${API_URL}${id}/`, patient);
  return response.data;
};

export const deletePatient = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}${id}/`);
};