from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone

class Patient(models.Model):
    GENRE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]
    
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    genre = models.CharField(max_length=1, choices=GENRE_CHOICES)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)
    groupe_sanguin = models.CharField(max_length=5, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['nom', 'prenom'], name='unique_patient_nom_prenom')
        ]

    def clean(self):
        if self.date_naissance and self.date_naissance > timezone.now().date():
            raise ValidationError({'date_naissance': "La date de naissance ne peut pas être dans le futur."})

    def __str__(self):
        return f"{self.nom} {self.prenom}"


class Specialite(models.Model):
    nom = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nom


class Consultation(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='consultations')
    specialite = models.ForeignKey(Specialite, on_delete=models.SET_NULL, null=True, blank=True)
    date_consultation = models.DateField(default=timezone.now)
    motif = models.TextField()
    diagnostic = models.TextField(blank=True, null=True)
    tarif = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        
        if self.date_consultation and self.date_consultation > timezone.now().date():
            raise ValidationError({'date_consultation': "La date de consultation ne peut pas être dans le futur."})

    def __str__(self):
        return f"Consultation - {self.patient.nom} ({self.date_consultation})"


class RendezVous(models.Model):
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('CONFIRME', 'Confirmé'),
        ('ANNULE', 'Annulé'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='rendez_vous')
    date_heure = models.DateTimeField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
       
        if not self.pk and self.date_heure and self.date_heure < timezone.now():
            raise ValidationError({'date_heure': "La date de rendez-vous ne peut pas être dans le passé."})

    def __str__(self):
        return f"RDV {self.patient.nom} - {self.date_heure.strftime('%d/%m/%Y %H:%M')}"