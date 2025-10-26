from django.db import models
import uuid
from .properties import Property

class Inspection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    priority = models.CharField(max_length=20, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    concern_level = models.IntegerField(blank=True, null=True)
    estimated_cost_low = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    estimated_cost_high = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)
    detected_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'issues'
        managed = False
