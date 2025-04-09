"""
Simple health check view for the Django application.
"""

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def health_check(request):
    """Simple health check view that returns a 200 OK response."""
    return HttpResponse("OK", content_type="text/plain")