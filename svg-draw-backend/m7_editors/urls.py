from django.urls import path
from .views import DraftListView, DraftDetailView, DraftCreateView

app_name = 'editors'

urlpatterns = [
    path('drafts/', DraftListView.as_view(), name='draft-list'),
    path('drafts/<int:draft_id>/', DraftDetailView.as_view(), name='draft-detail'),
    path('drafts/create/', DraftCreateView.as_view(), name='draft-create'),
]
