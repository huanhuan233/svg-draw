from django.urls import path, re_path
from .views import SubmitInputView

app_name = 'inputs'

urlpatterns = [
    # 支持带斜杠和不带斜杠两种形式
    path('submit/', SubmitInputView.as_view(), name='submit'),
    re_path(r'^submit$', SubmitInputView.as_view(), name='submit-no-slash'),
]
