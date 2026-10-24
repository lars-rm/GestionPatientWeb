from rest_framework import viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from .models import Patient, Specialite, Consultation, RendezVous
from .serializers import (
    PatientSerializer,
    SpecialiteSerializer,
    ConsultationSerializer,
    RendezVousSerializer
)

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-created_at')
    serializer_class = PatientSerializer

class SpecialiteViewSet(viewsets.ModelViewSet):
    queryset = Specialite.objects.all()
    serializer_class = SpecialiteSerializer

class ConsultationViewSet(viewsets.ModelViewSet):
    # select_related permet d'optimiser les requêtes SQL SQL en joignant patient et spécialité
    queryset = Consultation.objects.all().select_related('patient', 'specialite').order_by('-date_consultation', '-created_at')
    serializer_class = ConsultationSerializer

class RendezVousViewSet(viewsets.ModelViewSet):
    queryset = RendezVous.objects.all().select_related('patient').order_by('-date_heure')
    serializer_class = RendezVousSerializer

    def get_queryset(self):
        queryset = RendezVous.objects.all().select_related('patient').order_by('-date_heure')
        statut = self.request.query_params.get('statut', None)
        if statut is not None:
            queryset = queryset.filter(statut=statut)
        return queryset

@api_view(['GET'])
def dashboard_stats(request):
    """Endpoint personnalisé renvoyant les statistiques clés du dashboard"""
    today = timezone.now().date()
    
    total_patients = Patient.objects.count()
    consultations_mois = Consultation.objects.filter(
        date_consultation__year=today.year,
        date_consultation__month=today.month
    ).count()
    rdv_en_attente = RendezVous.objects.filter(statut='EN_ATTENTE').count()
    revenus_totaux = Consultation.objects.aggregate(total=Sum('tarif'))['total'] or 0.00

    return Response({
        'total_patients': total_patients,
        'consultations_mois': consultations_mois,
        'rdv_en_attente': rdv_en_attente,
        'revenus_totaux': float(revenus_totaux),
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Vérifie les identifiants et renvoie le token d'authentification"""
    serializer = AuthTokenSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'username': user.username})

@api_view(['POST'])
def logout(request):
    """Supprime le token de l'utilisateur connecté"""
    request.auth.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def me(request):
    """Renvoie l'utilisateur connecté"""
    return Response({'username': request.user.username})
