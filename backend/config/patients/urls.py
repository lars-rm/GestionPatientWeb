from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet,
    SpecialiteViewSet,
    ConsultationViewSet,
    RendezVousViewSet,
    dashboard_stats,
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'specialites', SpecialiteViewSet)
router.register(r'consultations', ConsultationViewSet)
router.register(r'rendez-vous', RendezVousViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
]