from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from core.serializers import *
from core.models import *
from core.utils import *

class ScanQRView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not isGuard(request.user):
            return permission_denied()
        try:
            order_number = request.data.get("order_number")
            if not order_number:
                return error("Order number required")
            order = (
                Order.objects
                .select_related("store", "user")
                .prefetch_related("items__product")
                .get(order_number=order_number)
            )
            serializer = StoreOrderSerializer(order)
            return success(data=serializer.data)

        except Order.DoesNotExist:
            return not_found("Order")
        except Exception as e:
            return exception(str(e))