from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Run, Artifact
from common.responses import success_response, error_response
from common.schemas import RunRecord, StepLog, ArtifactInfo
from datetime import datetime


class RunDetailView(APIView):
    """获取运行详情"""
    parser_classes = [JSONParser]
    
    def get(self, request, run_id):
        try:
            run = get_object_or_404(Run, id=run_id)
            
            steps = []
            for step in run.steps.all():
                steps.append(StepLog(
                    name=step.name,
                    started_at=step.started_at,
                    ended_at=step.ended_at,
                    input=step.input_data,
                    output=step.output_data,
                    error=step.error
                ))
            
            artifacts = []
            for art in run.artifacts.all():
                artifacts.append(ArtifactInfo(
                    type=art.type,
                    ref_id=art.ref_id or '',
                    preview_text=art.preview_text or ''
                ))
            
            record = RunRecord(
                run_id=str(run.id),
                status=run.status,
                steps=steps,
                artifacts=artifacts
            )
            
            return success_response(record.to_dict())
        except Exception as e:
            return error_response(str(e), status=500)


class RunArtifactsView(APIView):
    """获取运行产物列表"""
    parser_classes = [JSONParser]
    
    def get(self, request, run_id):
        try:
            run = get_object_or_404(Run, id=run_id)
            artifacts = []
            for art in run.artifacts.all():
                artifacts.append(ArtifactInfo(
                    type=art.type,
                    ref_id=art.ref_id or '',
                    preview_text=art.preview_text or ''
                ).to_dict())
            
            return success_response(artifacts)
        except Exception as e:
            return error_response(str(e), status=500)
