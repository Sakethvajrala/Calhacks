from django.db import models
import uuid

class Property(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    grade = models.CharField(max_length=10, blank=True, null=True)
    estimated_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)
    tour_date = models.DateField(blank=True, null=True)
    total_issues = models.IntegerField(default=0)
    critical_issues = models.IntegerField(default=0)
    high_issues = models.IntegerField(default=0)
    moderate_issues = models.IntegerField(default=0)
    estimated_repair_cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'properties'   # map to SQL table
        managed = False           # Django won't try to alter this table
