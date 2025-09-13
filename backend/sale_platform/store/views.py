from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ProductForm, ProductInstance
from .serializers import ProductFormSerializer
from rest_framework.permissions import IsAuthenticated
from .serializers import ProductInstanceSerializer
from django.contrib.auth.models import User
from .serializers import RegisterSerializer

class ProductFormViewSet(viewsets.ModelViewSet):
    queryset = ProductForm.objects.all()
    serializer_class = ProductFormSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return ProductForm.objects.filter(user=user)
        return ProductForm.objects.none()


    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # user رو ست کن

    # action preview رو نگه دار
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        form = self.get_object()
        return Response({'fields': form.fields_json})
    

class ProductInstanceViewSet(viewsets.ModelViewSet):
    queryset = ProductInstance.objects.all().order_by("-created_at")
    serializer_class = ProductInstanceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()


from rest_framework import generics
from .serializers import RegisterSerializer
from django.contrib.auth.models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


