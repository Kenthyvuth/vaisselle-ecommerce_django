from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.mail import send_mail
from .models import Product, Order, OrderItem, Contact, UserProfile

import backend.settings as settings
import threading

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    newsletter = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'newsletter')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        newsletter = validated_data.pop('newsletter', False)
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        
        # Crée le profil associé
        UserProfile.objects.create(user=user, newsletter=newsletter)

        # Envoi du mail de promotions
        if newsletter is True:
            threading.Thread(target=self.send_email_promotions, args=(user,)).start()
        return user

    def send_email_promotions(self, user):
        produits_promo = Product.objects.filter(promo_price__isnull=False)
        if produits_promo.exists() and user.email:
            liste_promos = "\n".join([
                f"- {p.name} : {p.promo_price:.2f} € au lieu de {p.price:.2f} €"
                for p in produits_promo
            ])
            message = (
                f"Bienvenue {user.username} sur Classy Dishes !\n\n"
                "Voici les promotions en cours :\n\n"
                f"{liste_promos}\n\n"
                "Profitez-en vite sur notre site !"
            )
            send_mail(
                subject=f"Hello {user.username} ! Découvrez nos promotions en cours",
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=True,
            )

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    class Meta:
        model = OrderItem
        fields = ('product', 'product_name', 'qty', 'price')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ('id', 'user', 'total', 'created_at', 'items', 'first_name', 'last_name', 'address', 'city', 'zip_code', 'country')

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'
