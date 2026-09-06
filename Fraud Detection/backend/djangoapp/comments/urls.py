from django.urls import path
from .views import CommentListCreateView, CommentDetailView,  CommentDeleteView, CommentUpdateView

urlpatterns = [
    path('comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('comments/update/<int:pk>/', CommentUpdateView.as_view(), name='comment-update'),
    path('comments/delete/<int:pk>/', CommentDeleteView.as_view(), name='comment-delete'),
]
