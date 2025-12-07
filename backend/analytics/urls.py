from django.urls import path
from analytics.views import (
    bar_data_view,
    summary_data_view,
    recent_submissions_view,
    recent_bis_submissions_view,
    recent_scif_submissions_view,
    recent_drafts_view,
    admin_reports
)

urlpatterns = [
    path('summary/', summary_data_view),
    path('bar-data/', bar_data_view),
    path('recent-submissions/', recent_submissions_view),
    path('recent-bis-submissions/', recent_bis_submissions_view),
    path('recent-scif-submissions/', recent_scif_submissions_view),
    path('recent-drafts/', recent_drafts_view),
    path('admin-reports/', admin_reports),
]
