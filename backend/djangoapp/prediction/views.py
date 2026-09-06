from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ModelRating, ModelPerformance
from .serializers import ModelRatingSerializer
from django.contrib.auth.models import User

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class ModelRatingView(APIView):
    def post(self, request, model_performance_id):
        # Retrieve the user field from the request data
        user_id = request.data.get('user')
        rating_value = request.data.get('rating')



        try:
            user = User.objects.get(id=user_id)
            model_performance = ModelPerformance.objects.get(id=model_performance_id)
            model_rating, created = ModelRating.objects.update_or_create(
                user=user,
                model_performance=model_performance,
                defaults={'rating': rating_value}
            )
            # Send the rating data to the WebSocket group
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "ratings",  # Group name
                {
                    "type": "send_rating",
                    "rating": rating_value,
                    "user": user.username
                }
            )
            serializer = ModelRatingSerializer(model_rating)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ModelPerformance.DoesNotExist:
            return Response({"error": "ModelPerformance not found"}, status=status.HTTP_404_NOT_FOUND)    