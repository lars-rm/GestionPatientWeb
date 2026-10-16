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

    def validate_nom(self, value):
        # Vérifie si une spécialité existe déjà avec le même nom (insensible à la casse)
        qs = Specialite.objects.filter(nom__iexact=value.strip())
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        
        if qs.exists():
            raise serializers.ValidationError("Cette spécialité existe déjà.")
        return value

class ConsultationSerializer(serializers.ModelSerializer):
    patient_nom = serializers.ReadOnlyField(source='patient.nom')
    patient_prenom = serializers.ReadOnlyField(source='patient.prenom')
    specialite_nom = serializers.ReadOnlyField(source='specialite.nom')

    class Meta:
        model = Consultation
        fields = '__all__'

    def validate(self, data):
        patient = data.get('patient')
        specialite = data.get('specialite')
        date_consultation = data.get('date_consultation')

        qs = Consultation.objects.filter(
            patient=patient,
            specialite=specialite,
            date_consultation=date_consultation
        )
        
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError({
                "non_field_errors": ["Une consultation existe déjà pour ce patient dans cette spécialité à cette date."]
            })
        
        return data

class RendezVousSerializer(serializers.ModelSerializer):
    patient_nom = serializers.ReadOnlyField(source='patient.nom')
    patient_prenom = serializers.ReadOnlyField(source='patient.prenom')

    class Meta:
        model = RendezVous
        fields = '__all__'