from django.urls import path
from .views import lda


urlpatterns = [
    path('', lda),
]