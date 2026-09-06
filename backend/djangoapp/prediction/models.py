from django.db import models
from django.utils import timezone
from transactions.models import Transaction
from django.contrib.auth.models import User

# Create your models here.
class ModelPerformance(models.Model):
    model_name = models.CharField(max_length=255)
    accuracy = models.FloatField()
    precision = models.FloatField()
    recall = models.FloatField()
    f1_score = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="model_performances")

    def __str__(self):
        return f'{self.model_name} - {self.timestamp}'
    
class ModelRating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField() 
    timestamp = models.DateTimeField(auto_now_add=True)
    model_performance = models.ForeignKey(ModelPerformance, on_delete=models.CASCADE, related_name="ratings")
    def __str__(self):
        return f'{self.rating} - {self.timestamp}'