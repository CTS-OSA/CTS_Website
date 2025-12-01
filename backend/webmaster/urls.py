from rest_framework.routers import DefaultRouter
from .view.webmasterView import webmasterView
from django.urls import path

app_name= 'webmaster'

router = DefaultRouter()
urlpatterns = [
    path("posters/", webmasterView.as_view(), name="poster-detail"),
    path("posters/create/", webmasterView.as_view(), name="poster-create"),
    path("posters/<int:poster_id>/", webmasterView.as_view(), name="poster-update"),
]