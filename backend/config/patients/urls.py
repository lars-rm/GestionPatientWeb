from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet,
    SpecialiteViewSet,
    ConsultationViewSet,
    RendezVousViewSet,
    login,
    logout,
    me,
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'specialites', SpecialiteViewSet)
router.register(r'consultations', ConsultationViewSet)
router.register(r'rendez-vous', RendezVousViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login, name='auth-login'),
    path('auth/logout/', logout, name='auth-logout'),
    path('auth/me/', me, name='auth-me'),
]