from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ProductFormSchemaViewSet, ProductInstanceViewSet

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('schemas', ProductFormSchemaViewSet)

urlpatterns = router.urls
