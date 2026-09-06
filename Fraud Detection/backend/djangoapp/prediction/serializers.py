from rest_framework import serializers
from .models import ModelRating

class ModelRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelRating
        fields = '__all__'