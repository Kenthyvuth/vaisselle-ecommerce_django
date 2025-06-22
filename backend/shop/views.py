from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .models import Product, Order, Contact
from .serializers import ProductSerializer, UserSerializer, OrderSerializer, ContactSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail

import backend.settings as settings
import threading

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

class ContactMailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        message = request.data.get('message')

        if not (name and email and message):
            return Response({'error': 'Tous les champs sont obligatoires.'}, status=400)

        # Enregistrement du contact dans la base de données
        contact = Contact(name=name, email=email, message=message)
        contact.save()

        mail_message = (
            f"Message reçu via le formulaire de contact Classy Dishes\n\n"
            f"Nom : {name}\n"
            f"Email : {email}\n"
            f"Message :\n{message}\n"
        )

        threading.Thread(target=send_mail, kwargs={
            'subject': "Nouveau message de contact Classy Dishes",
            'message': mail_message,
            'from_email': email,
            'recipient_list': [settings.EMAIL_HOST_USER],
            'fail_silently': False
        }).start()

        return Response({'success': 'Votre message a bien été envoyé.'})
