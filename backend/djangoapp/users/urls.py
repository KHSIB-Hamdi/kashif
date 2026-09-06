from django.urls import path, include
from users.views import APILoginView, APILogoutView, APIPasswordUpdateView
from .views import UserListCreateView, UserDetailView,AllUsersListView,UserDeleteView,UserUpdateView,UserActivityListView
from .views import send_test_email

urlpatterns = [
    path('login/', APILoginView.as_view(), name='api_login'),
    path('logout/', APILogoutView.as_view(), name='api_logout'),
    path('update_password/', APIPasswordUpdateView.as_view(), name='api_update_password'),
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/all/', AllUsersListView.as_view(), name='all-users-list'),  
    path('users/delete/<int:pk>/', UserDeleteView.as_view(), name='user-delete'), 
    path('users/update/<int:pk>/', UserUpdateView.as_view(), name='user-update'),
    path('send-test-email/', send_test_email, name='send_test_email'),
    path('users/detail/', UserDetailView.as_view(), name='user-detail'),
    path('user-activities/', UserActivityListView.as_view(), name='user-activity-list')
]