from django.db import models
from django.contrib.auth.models import User

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    subject = models.CharField(max_length=255, blank=True,null=True)

    def __str__(self):
        return f"Comment by {self.user.username} "
