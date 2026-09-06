
from django.urls import path
from .views import ModelRatingView

urlpatterns = [
    path('model-rating/<int:model_performance_id>/', ModelRatingView.as_view(), name='model-rating'),
]