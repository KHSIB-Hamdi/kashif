from rest_framework import generics
from .models import Transaction
from .serializers import TransactionSerializer, ModelPerformanceSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination


class TransactionListCreateView(generics.ListCreateAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    
class TransactionUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    partial = True
    
    
class TransactionDeleteView(generics.DestroyAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class TransactionPagination(PageNumberPagination):
    page_size = 20  # Number of transactions per page
    page_size_query_param = 'page_size'
    max_page_size = 1000


class TransactionListView(generics.ListAPIView):
    queryset = Transaction.objects.all().order_by('id')
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['PRODUIT', 'DEV_CPTE', 'LIB_CPTE', 'MONTANT_TRX', 'UTILISATION', 'EMPLACEMENT', 'TERRITOIRE', 'DATE_TRX']
    pagination_class = TransactionPagination
    
    
class TransactionDetailView(APIView):

    def get(self, request, pk, format=None):
        try:
            transaction = Transaction.objects.get(pk=pk)
            performance = transaction.model_performances.all()  
            performance_data = ModelPerformanceSerializer(performance, many=True).data
            transaction_data = TransactionSerializer(transaction).data
            transaction_data['model_performance'] = performance_data
            return Response(transaction_data, status=status.HTTP_200_OK)
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)
        
class DistinctFieldValuesView(APIView):
    def get(self, request, field):
        # Get distinct values for the specified field
        if field in ['PRODUIT', 'DEV_CPTE', 'LIB_CPTE', 'TERRITOIRE']:  # Add your filterable fields here
            distinct_values = Transaction.objects.values_list(field, flat=True).distinct()
            return Response(distinct_values)
        else:
            return Response({"error": "Invalid field name"}, status=400)
