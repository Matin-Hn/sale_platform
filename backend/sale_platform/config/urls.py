from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from store.views import UserViewSet, AddressViewSet, CategoryViewSet, ProductViewSet, OrderViewSet, PaymentViewSet, ReviewViewSet, CartViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'addresses', AddressViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'cart', CartViewSet)

schema_view = get_schema_view(
    openapi.Info(
        title="Food Store API",
        default_version='v1',
        description="API for Food Store",
    ),
    public=True,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]