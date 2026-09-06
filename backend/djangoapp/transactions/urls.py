from django.urls import path
from .views import TransactionListCreateView, TransactionDetailView,TransactionDeleteView,TransactionUpdateView, TransactionListView, TransactionDetailView, DistinctFieldValuesView

urlpatterns = [
    path('transactions/create', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('transactions/delete/<int:pk>/', TransactionDeleteView.as_view(), name='transaction-delete'), 
    path('transactions/update/<int:pk>/', TransactionUpdateView.as_view(), name='transaction-update'),
    path('transactions', TransactionListView.as_view(), name='transaction-list'),
    path('transactions/<int:pk>/details/', TransactionDetailView.as_view(), name='transaction-detail'),
    path('transactions/distinct/<str:field>/', DistinctFieldValuesView.as_view(), name='distinct-field-values'),
    
]