from .models import Run, RunStepLog, Artifact
import logging

logger = logging.getLogger(__name__)


class RunLogger:
    """运行日志记录器"""
    
    @staticmethod
    def create_run() -> Run:
        """创建新的运行记录"""
        run = Run.objects.create(status='created')
        logger.info(f"Created run: {run.id}")
        return run
    
    @staticmethod
    def log_step(run: Run, name: str, input_data=None, output_data=None, error=None):
        """记录步骤"""
        step = RunStepLog.objects.create(
            run=run,
            name=name,
            input_data=input_data,
            output_data=output_data,
            error=error
        )
        logger.info(f"Run {run.id} - Step {name}: {'OK' if not error else 'FAILED'}")
        return step
    
    @staticmethod
    def start_step(step: RunStepLog):
        """开始步骤"""
        from django.utils import timezone
        step.started_at = timezone.now()
        step.save()
        logger.info(f"Step {step.name} started")
    
    @staticmethod
    def end_step(step: RunStepLog, output_data=None, error=None):
        """结束步骤"""
        from django.utils import timezone
        step.ended_at = timezone.now()
        if output_data is not None:
            step.output_data = output_data
        if error is not None:
            step.error = error
        step.save()
        logger.info(f"Step {step.name} ended: {'OK' if not error else 'FAILED'}")
    
    @staticmethod
    def add_artifact(run: Run, type: str, ref_id=None, preview_text=None):
        """添加产物"""
        artifact = Artifact.objects.create(
            run=run,
            type=type,
            ref_id=ref_id,
            preview_text=preview_text
        )
        logger.info(f"Run {run.id} - Added artifact: {type}")
        return artifact
    
    @staticmethod
    def update_status(run: Run, status: str):
        """更新运行状态"""
        run.status = status
        run.save()
        logger.info(f"Run {run.id} status updated to {status}")
