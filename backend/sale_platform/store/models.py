from django.db import models
from django.contrib.auth.models import User

class ProductForm(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # e.g., "فرم میوه‌ها"
    fields_json = models.JSONField(default=list)  # [{"name": "نام", "type": "text", "required": true}, ...]
    created_at = models.DateTimeField(auto_now_add=True)

class CustomField(models.Model):
    FIELD_TYPES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('select', 'Select'),  # با options JSON
    ]
    form = models.ForeignKey(ProductForm, on_delete=models.CASCADE, related_name='custom_fields')
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=20, choices=FIELD_TYPES)
    required = models.BooleanField(default=False)
    options = models.JSONField(default=list, blank=True)  # برای select: ["سیب", "موز"]
    order = models.IntegerField(default=0)  # برای مرتب‌سازی 
    

class ProductInstance(models.Model):
    form = models.ForeignKey(ProductForm, on_delete=models.CASCADE, related_name="instances")
    data = models.JSONField(default=dict)  # Dynamic user-entered data
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Instance of {self.form.name} (ID {self.id})"
