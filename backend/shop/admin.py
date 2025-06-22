from django.contrib import admin
from .models import Product, Order, OrderItem, Contact, UserProfile

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'promo_price', 'stock', 'category')
    search_fields = ('name', 'category')

class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'qty', 'price')
    readonly_fields = ('order', 'product', 'qty', 'price')
    search_fields = ('order__id', 'product__name')

class OrderAdmin(admin.ModelAdmin): 
    list_display = ('command_id', 'user', 'created_at', 'total')
    readonly_fields = ('user', 'first_name', 'last_name', 'address', 'city', 'zip_code', 'country', 'created_at', 'total')
    search_fields = ('user__username',)

    def command_id(self, obj):
        return obj.pk
    command_id.short_description = 'Order ID'

class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    readonly_fields = ('name', 'email', 'message', 'created_at',)
    search_fields = ('name', 'email')

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'newsletter')
    readonly_fields = ('user', 'newsletter')
    search_fields = ('user__username',)

admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem, OrderItemAdmin)
admin.site.register(Contact, ContactAdmin)
admin.site.register(UserProfile, UserProfileAdmin)