from rest_framework import serializers
from .models import Patient, Specialite, Consultation, RendezVous

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class SpecialiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialite
        fields = '__all__'

class ConsultationSerializer(serializers.ModelSerializer):
    patient_nom = serializers.ReadOnlyField(source='patient.nom')
    patient_prenom = serializers.ReadOnlyField(source='patient.prenom')

    class Meta:
        model = Consultation
        fields = '__all__'

class RendezVousSerializer(serializers.ModelSerializer):
    patient_nom = serializers.ReadOnlyField(source='patient.nom')
    patient_prenom = serializers.ReadOnlyField(source='patient.prenom')

    class Meta:
        model = RendezVous
        fields = '__all__'