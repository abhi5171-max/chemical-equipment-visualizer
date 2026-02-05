
from django.db import models
from django.contrib.auth.models import User

class ChemicalDataset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    filename = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    summary_json = models.JSONField()

    class Meta:
        ordering = ['-timestamp']

class EquipmentItem(models.Model):
    dataset = models.ForeignKey(ChemicalDataset, related_name='items', on_delete=models.CASCADE)
    equipment_name = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    flowrate = models.FloatField()
    pressure = models.FloatField()
    temperature = models.FloatField()
