from rest_framework.routers import DefaultRouter
from .view.posterView import posterView, reorder_posters
from .view.staffView import staffView, reorder_staff
from django.urls import path

app_name= 'webmaster'

router = DefaultRouter()
urlpatterns = [
    path("poster/", posterView.as_view(), name="poster-detail"),
    path("poster/create/", posterView.as_view(), name="poster-create"),
    path("poster/<int:poster_id>/", posterView.as_view(), name="poster-update"),
    path("poster/reorder/", reorder_posters, name="poster-reorder"),
    
    path("professional/", staffView.as_view(), name="staff-list"),
    path("professional/create/", staffView.as_view(), name="staff-create"),
    path("professional/<int:staff_id>/", staffView.as_view(), name="staff-update"),
    path("professional/reorder/", reorder_staff, name="staff-reorder"),
]