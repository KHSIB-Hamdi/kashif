from django.urls import path
from .views import AllAlertsListView

urlpatterns = [
    path('alerts/', AllAlertsListView.as_view(), name='alert-list'),
    
]