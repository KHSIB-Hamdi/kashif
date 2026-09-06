from rest_framework.pagination import CursorPagination

class TransactionCursorPagination(CursorPagination):
    page_size = 50  # Number of records per page
    ordering = '-trans_date_trans_time'  # Order by transaction date (newest first)
