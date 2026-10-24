import { useState, useEffect } from 'react';
import { Users, Award, FileText, Calendar, Clock, Activity, PieChart } from 'lucide-react';
import { getPatients, getSpecialites, getConsultations, getRendezVous } from '../services/api';
import type { Patient } from '../types/patient';
import type { Specialite } from '../types/specialite';
import type { Consultation } from '../types/consultation';
import type { RendezVous } from '../types/rendezvous';

export function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [patientsData, specialitesData, consultationsData, rdvData] = await Promise.all([
          getPatients(),
          getSpecialites(),
          getConsultations(),
          getRendezVous(),
        ]);
        setPatients(patientsData);
        setSpecialites(specialitesData);
        setConsultations(consultationsData);
        setRendezVous(rdvData);
      } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalPatients = patients.length;
  const totalSpecialites = specialites.length;
  const totalConsultations = consultations.length;
  const pendingRdv = rendezVous.filter((r) => r.statut === 'EN_ATTENTE').length;
  const confirmedRdv = rendezVous.filter((r) => r.statut === 'CONFIRME').length;
  const cancelledRdv = rendezVous.filter((r) => r.statut === 'ANNULE').length;
  const totalRdv = rendezVous.length || 1; // Éviter la division par zéro

  const confirmedPercent = Math.round((confirmedRdv / totalRdv) * 100);
  const pendingPercent = Math.round((pendingRdv / totalRdv) * 100);
  const cancelledPercent = Math.round((cancelledRdv / totalRdv) * 100);

  const currentMonth = new Date().toISOString().slice(0, 7); // AAAA-MM
  const consultationsThisMonth = consultations.filter((c) => c.date_consultation.startsWith(currentMonth)).length;
  const totalRevenue = consultations.reduce((sum, c) => sum + Number(c.tarif), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20 text-gray-500 gap-3">
        <Activity className="animate-spin text-purple-600" size={28} />
        <span className="text-lg font-medium">Chargement des données en cours...</span>
      </div>
    );
  }

  return (
    <div className="lg:p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg">
        <h1 className="text-xl sm:text-2xl font-extrabold">Tableau de bord</h1>
        <p className="text-purple-100 text-sm mt-1">Vue d'ensemble de l'activité du cabinet.</p>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{totalPatients}</h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-2xl">
              <Users size={26} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Consultations</p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{totalConsultations}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-2xl">
              <FileText size={26} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Spécialités</p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{totalSpecialites}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 rounded-2xl">
              <Award size={26} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">RDV en attente</p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{pendingRdv}</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 rounded-2xl">
              <Clock size={26} />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique 1 : Répartition des statuts de rendez-vous */}
        <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <PieChart size={20} className="text-purple-600" />
              Statistiques des Rendez-vous
            </h2>
            <span className="text-xs font-medium text-gray-400">Total : {rendezVous.length} RDV</span>
          </div>

          <div className="space-y-5">
            {/* Barre Confirmés */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Confirmés
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">{confirmedRdv} ({confirmedPercent}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-3.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${confirmedPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Barre En attente */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span> En attente
                </span>
                <span className="text-amber-600 dark:text-amber-400">{pendingRdv} ({pendingPercent}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-3.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${pendingPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Barre Annulés */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span> Annulés
                </span>
                <span className="text-red-600 dark:text-red-400">{cancelledRdv} ({cancelledPercent}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-3.5 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${cancelledPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Activité des consultations */}
        <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Activité des consultations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-400 uppercase font-semibold">Consultations ce mois</p>
              <p className="text-2xl font-black text-purple-600 mt-2">{consultationsThisMonth}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-400 uppercase font-semibold">Revenus totaux</p>
              <p className="text-2xl font-black text-blue-600 mt-2">{Math.round(totalRevenue).toLocaleString('fr-FR')} Ar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}