-- CreateEnum
CREATE TYPE "public"."Platforms" AS ENUM ('email', 'telegram');

-- CreateEnum
CREATE TYPE "public"."WorkflowStatus" AS ENUM ('Error', 'Complete');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workflow" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Trigger" (
    "id" TEXT NOT NULL,
    "availableTriggersId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Trigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AvailableTriggers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "AvailableTriggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Action" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "availableActionsId" TEXT NOT NULL,
    "sortingOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AvailableActions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "AvailableActions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowRun" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "metaData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."WorkflowStatus",
    "finishedAt" TIMESTAMP(3),
    "errorMetadata" JSONB,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowRunOutbox" (
    "id" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowRunOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Credentials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "platform" "public"."Platforms" NOT NULL,
    "keys" JSONB NOT NULL DEFAULT '{}',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Trigger_workflowId_key" ON "public"."Trigger"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRunOutbox_workflowRunId_key" ON "public"."WorkflowRunOutbox"("workflowRunId");

-- AddForeignKey
ALTER TABLE "public"."Workflow" ADD CONSTRAINT "Workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "public"."Credentials" ADD CONSTRAINT "Credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
