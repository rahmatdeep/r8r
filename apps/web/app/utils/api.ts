// api.ts - Dummy data for triggers, actions, workflows, credentials, and history
import { ActionFormData } from "../types/actions";
import axios from "axios";
import apiClient from "./apiClient";

/* Credentials Begins */
import {
  CredentialCreateSchema,
  credentialCreateType,
  CredentialDeleteSchema,
  emailMetadataType,
  telegramMetadataType,
  //   emailCredentialsType,
  //   telegramCredentialsType,
} from "@repo/types/types";

// export type Credential = emailCredentialsType | telegramCredentialsType;

export interface CredentialResponse {
  id: string;
  title: string;
  platform: "email" | "telegram";
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
  metadata: emailMetadataType | telegramMetadataType;
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

// History interface and mock data
export interface HistoryItem {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerName: string;
  actionName: string;
  status: "success" | "failed" | "running";
  timestamp: string;
  executionTime: number; // in milliseconds
  errorMessage?: string;
}

export const historyItems: HistoryItem[] = [
  {
    id: "hist-004",
    workflowId: "f68a8406-863e-4104-ad19-6e203f1b1f7b",
    workflowName: "Webhook to Solana & Email",
    triggerName: "Webhook",
    actionName: "Send SOL + Email",
    status: "running",
    timestamp: new Date().toISOString(), // Just now
    executionTime: 0,
  },
  {
    id: "hist-001",
    workflowId: "f68a8406-863e-4104-ad19-6e203f1b1f7b",
    workflowName: "Webhook to Solana & Email",
    triggerName: "Webhook",
    actionName: "Send SOL + Email",
    status: "success",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    executionTime: 1250,
  },
  {
    id: "hist-002",
    workflowId: "f68a8406-863e-4104-ad19-6e203f1b1f7b",
    workflowName: "Webhook to Solana & Email",
    triggerName: "Webhook",
    actionName: "Send SOL + Email",
    status: "failed",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    executionTime: 800,
    errorMessage: "Insufficient SOL balance in wallet",
  },
  {
    id: "hist-003",
    workflowId: "f68a8406-863e-4104-ad19-6e203f1b1f7b",
    workflowName: "Webhook to Solana & Email",
    triggerName: "Webhook",
    actionName: "Send SOL + Email",
    status: "success",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    executionTime: 950,
  },
  {
    id: "hist-005",
    workflowId: "f68a8406-863e-4104-ad19-6e203f1b1f7b",
    workflowName: "Webhook to Solana & Email",
    triggerName: "Webhook",
    actionName: "Send SOL + Email",
    status: "success",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    executionTime: 1100,
  },
  {
    id: "hist-006",
    workflowId: "f68a8406-863e-4104-ad19-6e203f1b1f7b",
    workflowName: "Webhook to Solana & Email",
    triggerName: "Webhook",
    actionName: "Send SOL + Email",
    status: "success",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    executionTime: 890,
  },
];

export const getHistory = (userId?: number): Promise<HistoryItem[]> =>
  new Promise((resolve) => {
    // Just resolve with the dummy data immediately
    setTimeout(() => {
      resolve(historyItems);
    }, 100);
  });

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
      actions: workflowData.actions.map((action) => ({
        availableActionId: action.type.id,
        actionMetadata: action.metadata,
      })),
    };

    if (existingWorkflowId) {
      // Update existing workflow
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