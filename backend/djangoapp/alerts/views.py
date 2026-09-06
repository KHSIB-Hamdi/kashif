from .models import Alert
from .serializers import AlertSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.
class AllAlertsListView(APIView):
    def get(self, request, *args, **kwargs):
        alerts = Alert.objects.all().order_by('-timestamp')[:10]
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)
