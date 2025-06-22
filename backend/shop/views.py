from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .models import Product, Order, Contact
from .serializers import ProductSerializer, UserSerializer, OrderSerializer, ContactSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail

import backend.settings as settings

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class OrderList(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class ContactCreate(generics.CreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.AllowAny]

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_profile = user.userprofile
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "newsletter": user_profile.newsletter,
        })

class NewsletterReminderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user_profile = user.userprofile
        if user_profile.newsletter:
            email = user.email
            if not email:
                return Response({'error': 'Aucune adresse email trouvée.'}, status=400)
            panier = request.data.get('panier', [])
            if panier:
                liste = "\n".join(
                    f"- {item.get('nom', 'Produit')} x{item.get('quantite', 1)} à {item.get('prix', 0):.2f} €"
                    for item in panier
                )
                message = (
                    f"Bonjour {user.username},\n\n"
                    "Vous avez des articles dans votre panier sur Classy Dishes :\n\n"
                    f"{liste}\n\n"
                    "Profitez-en avant qu'ils ne disparaissent !\n\nÀ bientôt sur Classy Dishes."
                )
            else:
                message = (
                    f"Bonjour {user.username},\n\n"
                    "Vous avez des articles dans votre panier sur Classy Dishes. Profitez-en avant qu'ils ne disparaissent !\n\nÀ bientôt sur Classy Dishes."
                )
            send_mail(
                subject="N'oubliez pas de valider votre panier !",
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
            return Response({'success': 'Email envoyé.'})
        else:
            return Response({'error': 'Vous n\'êtes pas inscrit à la newsletter.'}, status=400)

class NewsletterToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = request.user.userprofile
        profile.newsletter = request.data.get('newsletter', False)
        profile.save()
        return Response({'newsletter': profile.newsletter})
