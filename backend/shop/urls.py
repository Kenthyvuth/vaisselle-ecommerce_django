from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProductList, ProductDetail, OrderList, ContactMailView, MeView, NewsletterReminderView, NewsletterToggleView

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', TokenObtainPairView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('produits/', ProductList.as_view()),
    path('produits/<int:pk>/', ProductDetail.as_view()),
    path('commandes/', OrderList.as_view()),
    path('contact/', ContactMailView.as_view()),
    path('auth/me/', MeView.as_view()),
    path('newsletter/reminder/', NewsletterReminderView.as_view(), name='newsletter-reminder'),
    path('auth/newsletter/', NewsletterToggleView.as_view()),
]
