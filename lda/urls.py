# from django.conf.urls import url
from django.urls import path
from .views import lda


urlpatterns = [
    path('', lda),
]