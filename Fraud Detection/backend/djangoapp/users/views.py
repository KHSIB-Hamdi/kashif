from dj_rest_auth.views import (LoginView, LogoutView, PasswordChangeView)
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework import status
from rest_framework.response import Response
from django.conf import settings
from django.core.mail import send_mail
from django.http import HttpResponse
from rest_framework.views import APIView
from .models import UserActivity
from .serializers import UserActivitySerializer

# Create your views here.
class APILogoutView(LogoutView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

class APILoginView(LoginView):
    pass

class APIPasswordUpdateView(PasswordChangeView):
    authentication_classes = [TokenAuthentication]

class AllUsersListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
class UserUpdateView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    partial = True
    
    
class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class UserDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # Get the currently authenticated user
        serializer = UserSerializer(user)
        return Response(serializer.data)

def send_test_email(request):
    try:
        send_mail(
            'Test Email Subject',
            'This is a test email sent from Django using Gmail.',
            settings.DEFAULT_FROM_EMAIL,
            [settings.DEFAULT_FROM_EMAIL],
            fail_silently=False,
        )
        return HttpResponse('Test email sent!')
    except Exception as e:
        return HttpResponse(f'Error: {str(e)}')
    

class UserActivityListView(generics.ListAPIView):
    queryset = UserActivity.objects.all().order_by('-timestamp')[:10]
    serializer_class = UserActivitySerializer
    

    
    
