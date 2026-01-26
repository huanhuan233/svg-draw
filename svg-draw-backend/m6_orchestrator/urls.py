from django.urls import path, re_path
from .views import RunOrchestratorView

app_name = 'orchestrator'

urlpatterns = [
    # 支持带斜杠和不带斜杠两种形式
    path('run/', RunOrchestratorView.as_view(), name='run'),
    re_path(r'^run$', RunOrchestratorView.as_view(), name='run-no-slash'),
]
