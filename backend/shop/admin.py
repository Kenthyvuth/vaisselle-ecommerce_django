from django.contrib import admin
from .models import Product, Order, OrderItem, Contact

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'promo_price', 'stock', 'category')
    search_fields = ('name', 'category')

class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'qty', 'price')
    readonly_fields = ('order', 'product', 'qty', 'price')
    search_fields = ('order__id', 'product__name')

class OrderAdmin(admin.ModelAdmin):
    list_display = ('command_id', 'user', 'created_at', 'total')
    readonly_fields = ('user', 'created_at', 'total')
    search_fields = ('user__username',)

    def command_id(self, obj):
        return obj.pk
    command_id.short_description = 'Order ID'

admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem, OrderItemAdmin)
admin.site.register(Contact)