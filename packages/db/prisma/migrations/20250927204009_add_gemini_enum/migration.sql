-- AlterEnum
ALTER TYPE "public"."Platforms" ADD VALUE 'gemini';

-- DropForeignKey
ALTER TABLE "public"."Action" DROP CONSTRAINT "Action_availableActionsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Action" DROP CONSTRAINT "Action_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Trigger" DROP CONSTRAINT "Trigger_availableTriggersId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Trigger" DROP CONSTRAINT "Trigger_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkflowRun" DROP CONSTRAINT "WorkflowRun_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkflowRunOutbox" DROP CONSTRAINT "WorkflowRunOutbox_workflowRunId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Trigger" ADD CONSTRAINT "Trigger_availableTriggersId_fkey" FOREIGN KEY ("availableTriggersId") REFERENCES "public"."AvailableTriggers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Trigger" ADD CONSTRAINT "Trigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Action" ADD CONSTRAINT "Action_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Action" ADD CONSTRAINT "Action_availableActionsId_fkey" FOREIGN KEY ("availableActionsId") REFERENCES "public"."AvailableActions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowRunOutbox" ADD CONSTRAINT "WorkflowRunOutbox_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "public"."WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
