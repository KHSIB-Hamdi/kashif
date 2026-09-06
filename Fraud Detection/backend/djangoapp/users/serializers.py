from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserActivity

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class UserActivitySerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = UserActivity
        fields = ['id', 'username' ,'action', 'timestamp']
    
    def get_username(self, obj):
        return obj.user.username if obj.user else None
    
