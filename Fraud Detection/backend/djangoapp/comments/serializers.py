from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    # Read-only field for retrieving the user as user_username when fetching comments
    user_username = serializers.CharField(source='user.username', read_only=True)

    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)

    class Meta:
        model = Comment
        fields = ['user', 'user_username', 'content', 'created_at', 'subject']
        read_only_fields = ['user', 'created_at']  # Make these fields read-only in responses

    def create(self, validated_data):
        
        # Assign the user to the validated data
        
        # Create and return the comment
        return super().create(validated_data)
