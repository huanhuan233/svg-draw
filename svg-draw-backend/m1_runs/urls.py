from django.urls import path
from .views import RunDetailView, RunArtifactsView

app_name = 'runs'

urlpatterns = [
    path('<uuid:run_id>/', RunDetailView.as_view(), name='run-detail'),
    path('<uuid:run_id>/artifacts/', RunArtifactsView.as_view(), name='run-artifacts'),
]
