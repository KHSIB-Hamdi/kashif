from django.db import models

class Alert(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    transaction_id = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='low')


    def __str__(self):
        return f'Alert {self.transaction_id} at {self.timestamp}'
