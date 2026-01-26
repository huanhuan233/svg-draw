from django.contrib import admin
from .models import Run, RunStepLog, Artifact


@admin.register(Run)
class RunAdmin(admin.ModelAdmin):
    list_display = ['id', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    search_fields = ['id']


@admin.register(RunStepLog)
class RunStepLogAdmin(admin.ModelAdmin):
    list_display = ['run', 'name', 'started_at', 'ended_at']
    list_filter = ['name', 'started_at']
    search_fields = ['run__id', 'name']


@admin.register(Artifact)
class ArtifactAdmin(admin.ModelAdmin):
    list_display = ['run', 'type', 'ref_id', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['run__id', 'type']
