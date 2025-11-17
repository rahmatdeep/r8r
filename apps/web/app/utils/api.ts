import { ActionFormData } from "../types/actions";
import axios from "axios";
import apiClient from "./apiClient";

/* Credentials Begins */
import {
  CredentialCreateSchema,
  credentialCreateType,
  CredentialDeleteSchema,
  emailMetadataType,
  geminiMetadataType,
  telegramMetadataType,
  credentialUpdateType,
  CredentialUpdateSchema,
  Platform,
} from "@repo/types/types";

export interface CredentialResponse {
  id: string;
  title: string;
  platform: Platform;
  keys: {
    apiKey: string;
  };
  userId: string;
}

export const getCredentials = async (): Promise<CredentialResponse[]> => {
  try {
    const response = await apiClient.get("/credentials");
    return response.data.credentials;
  } catch (error) {
    console.error("Failed to fetch credentials:", error);
    return [];
  }
};

export const createCredential = async (
  credentialData: credentialCreateType
): Promise<void> => {
  try {
    const validatedData = CredentialCreateSchema.parse(credentialData);
    await apiClient.post("/credentials", validatedData);
  } catch (error) {
    console.error("Failed to create credential:", error);
    throw error;
  }
};

export const updateCredential = async (
  credentialData: credentialUpdateType
): Promise<void> => {
  try {
    const validatedData = CredentialUpdateSchema.parse(credentialData);
    await apiClient.put("/credentials", validatedData);
  } catch (error) {
    console.error("Failed to update credential:", error);
    throw error;
  }
};

export const deleteCredential = async (credentialId: string): Promise<void> => {
  try {
    const validatedData = CredentialDeleteSchema.parse({
      credentialsId: credentialId,
    });

    await apiClient.delete("/credentials", {
      data: validatedData,
    });
  } catch (error) {
    console.error("Failed to delete credential:", error);
    throw error;
  }
};

/* Credentials Ends */

export interface WorkflowItem {
  id: string;
  name: string;
  image: string;
  metadata?: { fields?: { label: string; type: string }[] } | null;
}

export type AvailableTrigger = WorkflowItem;
export type AvailableAction = WorkflowItem;

export type WorkflowItemSelectHandler = (
  item: WorkflowItem,
  type: "trigger" | "action"
) => void;

export interface WorkflowAction {
  id: string;
  workflowId: string;
  availableActionsId: string;
  sortingOrder: number;
  metadata: emailMetadataType | telegramMetadataType | geminiMetadataType;
  type: {
    id: string;
    name: string;
    image: string;
  };
}
export interface WorkflowTrigger {
  id: string;
  availableTriggersId: string;
  workflowId: string;
  type: AvailableTrigger;
}

export interface Workflow {
  id: string;
  triggerId: string | null;
  userId: number;
  action: WorkflowAction[];
  trigger: WorkflowTrigger;
}

export interface HistoryItem {
  id: string;
  workflowId: string;
  metaData: Record<string, any>;
  createdAt: string;
  status: string;
  finishedAt: string;
  errorMetadata: any;
}

export const getWorkflowExecutionHistory = async () => {
  try {
    const response = await apiClient.get("/workflow/status");

    return response.data.workflowRun;
  } catch (error) {
    console.error("Failed to fetch workflow status:", error);
    return [];
  }
};
export const getAvailableTriggers = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trigger/available`
    );
    return response.data.availableTriggers;
  } catch (error) {
    console.error("Failed to fetch available triggers:", error);
  }
};

export const getAvailableActions = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/action/available`
    );
    return response.data.availableActions;
  } catch (error) {
    console.error("Failed to fetch available actions:", error);
  }
};

export const getWorkflows = async () => {
  try {
    const response = await apiClient.get(`/workflow`);
    return response.data.workflows;
  } catch (error) {
    console.error("Failed to fetch workflows:", error);
  }
};

export const getWorkflowById = async (workflowId: string) => {
  try {
    const response = await apiClient.get(`/workflow/${workflowId}`);
    return response.data.workflow;
  } catch (error) {
    console.error("Failed to fetch workflow:", error);
  }
};

export const saveWorkflow = async (
  workflowData: {
    id?: string;
    trigger: AvailableTrigger;
    actions: Array<{
      type: AvailableAction;
      metadata: ActionFormData;
    }>;
    userId: number;
  },
  existingWorkflowId?: string
): Promise<Workflow> => {
  try {
    const payload = {
      id: workflowData.id,
      title: "My Workflow", // You can make this dynamic later
      availableTriggerId: workflowData.trigger.id,
      triggerMetadata: workflowData.trigger.metadata || {},
      actions: workflowData.actions.map((action) => ({
        availableActionId: action.type.id,
        actionMetadata: action.metadata,
      })),
    };

    if (existingWorkflowId) {
      // Update existing workflow
      console.log(payload);
      await apiClient.put(`workflow/${existingWorkflowId}`, payload);

      // Fetch and return the updated workflow
      const updatedWorkflow = await getWorkflowById(existingWorkflowId);
      if (!updatedWorkflow) {
        throw new Error("Failed to fetch updated workflow");
      }
      return updatedWorkflow;
    } else {
      // Create new workflow
      await apiClient.post("workflow", payload);

      // Fetch and return the created workflow
      const createdWorkflow = await getWorkflowById(workflowData.id!);
      if (!createdWorkflow) {
        throw new Error("Failed to fetch created workflow");
      }
      return createdWorkflow;
    }
  } catch (error) {
    console.error("Failed to save workflow:", error);
    throw error; // Re-throw so the component can handle it
  }
};

export const deleteWorkflow = async (workflowId: string) => {
  try {
    await apiClient.delete(`/workflow/${workflowId}`);
  } catch (error) {
    console.error("Failed to delete workflow:", error);
    throw error;
  }
};

export const triggerWebhookManually = async (
  userId: string,
  workflowId: string,
  payload: any
) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_HOOKS_URL}/hooks/catch/${userId}/${workflowId}`,
      payload
    );
    console.log("Webhook triggered successfully:", response.data);

    return response.data;
  } catch (error) {
    console.error("Failed to trigger webhook:", error);
    throw error;
  }
};
