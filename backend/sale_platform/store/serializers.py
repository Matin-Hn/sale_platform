from rest_framework import serializers
from .models import ProductForm, CustomField, ProductInstance
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken


class CustomFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomField
        fields = '__all__'

class ProductFormSerializer(serializers.ModelSerializer):
    fields = CustomFieldSerializer(many=True, read_only=True, source='custom_fields')
    fields_data = serializers.JSONField(write_only=True, default=list)

    class Meta:
        model = ProductForm
        fields = ['id', 'name', 'fields_json', 'created_at', 'fields', 'fields_data']

    def create(self, validated_data):
        fields_data = validated_data.pop('fields_data', [])
        user = self.context['request'].user if self.context['request'].user.is_authenticated else None
        form = ProductForm.objects.create(user=user, name=validated_data.get('name', ''), fields_json=fields_data)

        for field_data in fields_data:
            CustomField.objects.create(
                form=form,
                name=field_data.get("name", ""),
                type=field_data.get("type", "text"),
                required=field_data.get("required", False),
                options=field_data.get("options", []),
                order=field_data.get("order", 0),
            )
        return form

    def update(self, instance, validated_data):
        fields_data = validated_data.pop('fields_data', [])
        instance.name = validated_data.get('name', instance.name)
        instance.fields_json = fields_data
        instance.save()

        # Reset fields safely
        instance.custom_fields.all().delete()
        for field_data in fields_data:
            CustomField.objects.create(
                form=instance,
                name=field_data.get("name", ""),
                type=field_data.get("type", "text"),
                required=field_data.get("required", False),
                options=field_data.get("options", []),
                order=field_data.get("order", 0),
            )
        return instance


class ProductInstanceSerializer(serializers.ModelSerializer):
    form_name = serializers.CharField(source="form.name", read_only=True)

    class Meta:
        model = ProductInstance
        fields = ["id", "form", "form_name", "data", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    token = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'token']

    def get_token(self, obj):
        refresh = RefreshToken.for_user(obj)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user
