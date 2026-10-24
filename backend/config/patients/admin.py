from django.contrib import admin
from .models import Patient, Specialite, Consultation, RendezVous


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prenom', 'date_naissance', 'genre', 'telephone', 'groupe_sanguin')
    search_fields = ('nom', 'prenom')
    list_filter = ('genre', 'groupe_sanguin')


@admin.register(Specialite)
class SpecialiteAdmin(admin.ModelAdmin):
    search_fields = ('nom',)


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('date_consultation', 'patient', 'specialite', 'tarif')
    list_filter = ('specialite',)
    search_fields = ('patient__nom', 'patient__prenom', 'motif', 'diagnostic')


@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    list_display = ('date_heure', 'patient', 'statut')
    list_filter = ('statut',)
    search_fields = ('patient__nom', 'patient__prenom', 'notes')
