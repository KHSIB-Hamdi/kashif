from rest_framework import generics
from .models import Comment
from .serializers import CommentSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination


class CommentPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 200

class CommentListCreateView(generics.ListCreateAPIView):
    # Newest first and paginated. Was hardcoded to the 10 OLDEST comments
    # (order_by('id')[:10]), which silently hid everything after the first ten.
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    pagination_class = CommentPagination

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class CommentUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    partial = True

class CommentDeleteView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)