from django.urls import path
from .views import SvgDrawListView, SvgDrawDetailView

app_name = 'api'

urlpatterns = [
    path('svg-draws/', SvgDrawListView.as_view(), name='svg-draw-list'),
    path('svg-draws/<int:draw_id>/', SvgDrawDetailView.as_view(), name='svg-draw-detail'),
]
