"use client";
import { useState, useCallback, useEffect, useTransition } from "react";
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  Background,
  Controls,
  BackgroundVariant,
} from "@xyflow/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  getAvailableTriggers,
  getAvailableActions,
  AvailableTrigger,
  AvailableAction,
  WorkflowItemSelectHandler,
  saveWorkflow,
  Workflow,
  getWorkflowById,
  WorkflowAction,
} from "../../utils/api";
import { AddNode } from "./AddNode";
import { WorkflowNode } from "../../components/canvas/WorkflowNode";
import { WorkflowModal } from "../../components/canvas/WorkflowModal";
import "@xyflow/react/dist/style.css";
import { WebhookTriggerModal } from "../../components/canvas/WebhookTriggerModal";
import { Session } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { ActionModal } from "../../components/canvas/ActionModal";
import { ActionFormData, ActionMetadata } from "../../types/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FormTriggerModal } from "./FormTriggerModal";
interface CanvasProps {
  workflowId?: string;
  session: Session;
}

const nodeTypes = {
  addNode: AddNode,
  workflowNode: WorkflowNode,
};

const initialNodes: Node[] = [
  {
    id: "add-1",
    type: "addNode",
    position: { x: 400, y: 300 },
    data: { onAddClick: () => {} },
  },
];

const initialEdges: Edge[] = [];

export default function Canvas({ workflowId, session }: CanvasProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [currentActionType, setCurrentActionType] = useState<string | null>(
    null
  );
  const [actionMetadata, setActionMetadata] = useState<
    Record<number, ActionFormData>
  >({});
  const [currentAddContext, setCurrentAddContext] = useState<{
    nodeId?: string;
    isInitial?: boolean;
  }>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [actionCounter, setActionCounter] = useState(0);
  const [hasInitialNode, setHasInitialNode] = useState(false);
  const [triggers, setTriggers] = useState<AvailableTrigger[]>([]);
  const [actions, setActions] = useState<AvailableAction[]>([]);
  const [currentTrigger, setCurrentTrigger] = useState<AvailableTrigger | null>(
    null
  );
  const [currentActions, setCurrentActions] = useState<AvailableAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [currentWorkflowId] = useState(() => workflowId || uuidv4());
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [webhookKeys, setWebhookKeys] = useState<string[]>([]);
  const [formKeys, setFormKeys] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    getAvailableTriggers().then(setTriggers);
    getAvailableActions().then(setActions);

    // Load existing workflow if workflowId is provided
    if (workflowId) {
      loadExistingWorkflow(workflowId);
    }
  }, [workflowId]);

  const loadExistingWorkflow = async (workflowId: string) => {
    setIsLoading(true);
    try {
      const workflow = await getWorkflowById(workflowId);

      if (workflow) {
        // Set the trigger
        setCurrentTrigger(workflow.trigger.type);

        // Set the actions (sorted by sortingOrder)
        const sortedActions = (workflow.action as WorkflowAction[]).sort(
          (a, b) => a.sortingOrder - b.sortingOrder
        );

        const actionTypes = sortedActions.map((action) => action.type);
        setCurrentActions(actionTypes);

        // Load action metadata
        const metadata: Record<number, ActionFormData> = {};
        sortedActions.forEach((action, index) => {
          metadata[index] = action.metadata || {};
        });
        setActionMetadata(metadata);

        setActionCounter(sortedActions.length);
        setHasInitialNode(true);

        // Create canvas nodes and edges
        createCanvasFromWorkflow(workflow);
      }
    } catch (error) {
      console.error("Failed to load workflow:", error);
      alert("Failed to load workflow");
    } finally {
      setIsLoading(false);
    }
  };

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleAddClick = useCallback((nodeId?: string) => {
    if (!nodeId) {
      setCurrentAddContext({ isInitial: true });
    } else {
      setCurrentAddContext({ nodeId });
    }
    setSelectedNodeId("");
    setIsModalOpen(true);
  }, []);

  const handleNodeClick = useCallback((nodeId: string, itemId: string) => {
    setEditingNodeId(nodeId);
    switch (itemId) {
      case "email":
        setCurrentActionType("email");
        setIsActionModalOpen(true);
        break;
      case "webhook":
        setIsWebhookModalOpen(true);
        break;
      case "form":
        setIsFormModalOpen(true);
        break;
      case "telegram":
        setCurrentActionType("telegram");
        setIsActionModalOpen(true);
        break;
      case "gemini":
        setCurrentActionType("gemini");
        setIsActionModalOpen(true);
        break;
      default:
        setCurrentActionType("default");
        setIsActionModalOpen(true);
        break;
    }
  }, []);
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      // Clean up our workflow building state FIRST
      if (nodeId === "trigger-1") {
        // Reset everything if trigger is deleted
        setCurrentTrigger(null);
        setCurrentActions([]);
        setActionCounter(0);
        setHasInitialNode(false);
        setNodes([initialNodes[0]]);
        setEdges([]);
        return;
      } else if (!isNaN(Number(nodeId))) {
        // Remove action by the specific index
        const actionIndex = Number(nodeId);
        setCurrentActions((prev) => {
          const newActions = prev.slice(0, actionIndex);

          // If no actions left, reset canvas
          if (newActions.length === 0) {
            setActionCounter(0);
            if (currentTrigger) {
              // Keep only trigger node
              const triggerNode = nodes.find((n) => n.id === "trigger-1");
              if (triggerNode) {
                setNodes([triggerNode]);
                setEdges([]);
              }
            } else {
              // Reset completely
              setHasInitialNode(false);
              setNodes([initialNodes[0]]);
              setEdges([]);
            }
          } else {
            // Rebuild the entire canvas with correct sequence
            setTimeout(() => rebuildCanvas(), 0);
          }

          return newActions;
        });
      }
    },
    [nodes, currentTrigger]
  );

  const rebuildCanvas = useCallback(() => {
    if (!currentTrigger) return;

    const triggerNode = nodes.find((n) => n.id === "trigger-1");
    if (!triggerNode) return;

    const newNodes = [triggerNode];
    const newEdges: Edge[] = [];
    let lastNodeId = "trigger-1";

    currentActions.forEach((action, index) => {
      const actionNodeId = index.toString();
      const position = {
        x: triggerNode.position.x + (index + 1) * 100,
        y: triggerNode.position.y,
      };

      const newNode: Node = {
        id: actionNodeId,
        type: "workflowNode",
        position: position,
        data: {
          label: action.name,
          image: action.image,
          type: "action",
          onAddClick: () => handleAddClick(actionNodeId),
          onNodeClick: () => handleNodeClick(actionNodeId, action.id),
          onDeleteClick: () => handleDeleteNode(actionNodeId),
          hasConnectedActions: index < currentActions.length - 1,
          isFirstNode: false,
        },
      };

      newNodes.push(newNode);

      const newEdge: Edge = {
        id: `${lastNodeId}-${actionNodeId}`,
        source: lastNodeId,
        target: actionNodeId,
        type: "smoothstep",
        style: { stroke: "#a6a29e", strokeWidth: 2 },
      };

      newEdges.push(newEdge);
      lastNodeId = actionNodeId;
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setActionCounter(currentActions.length);
  }, [
    nodes,
    currentActions,
    currentTrigger,
    handleAddClick,
    handleNodeClick,
    handleDeleteNode,
  ]);

  const handleActionFormSave = useCallback(
    (metadata: ActionMetadata) => {
      if (editingNodeId !== null) {
        // For action nodes, the ID is the index (0, 1, 2, etc.)
        const actionIndex = parseInt(editingNodeId);

        // Store the metadata for this specific action
        setActionMetadata((prev) => ({
          ...prev,
          [actionIndex]: metadata.data,
        }));
      }

      setIsActionModalOpen(false);
      setCurrentActionType(null);
      setEditingNodeId(null);
    },
    [editingNodeId]
  );
  const handleWebhookFormSave = useCallback((data: { apiUrl: string }) => {
    setIsWebhookModalOpen(false);
  }, []);

  const handleFormTriggerSave = useCallback(
    (config: { fields: { label: string; type: string }[] }) => {
      setIsFormModalOpen(false);
    },
    []
  );
  const calculateNewPosition = (sourceNode: Node) => {
    const offset = 100;
    return { x: sourceNode.position.x + offset, y: sourceNode.position.y };
  };

  // Check if a node has connected actions
  const hasConnectedActions = (nodeId: string) => {
    return edges.some((edge) => edge.source === nodeId);
  };

  // Check if this is the first node (trigger)
  const isFirstNode = (nodeId: string) => {
    return !edges.some((edge) => edge.target === nodeId);
  };

  const handleSelectItem: WorkflowItemSelectHandler = useCallback(
    (item, type) => {
      // Only allow triggers for initial node
      if (currentAddContext.isInitial && type !== "trigger") {
        return;
      }

      // Generate ID based on type and sorting
      let newNodeId: string;
      if (type === "trigger") {
        newNodeId = "trigger-1"; // Always same ID for trigger (only one per workflow)
        setCurrentTrigger(item);
      } else {
        newNodeId = actionCounter.toString(); // "0", "1", "2"
        setCurrentActions((prev) => [...prev, item]); // Add to actions array
      }

      setSelectedNodeId(newNodeId);

      if (currentAddContext.isInitial) {
        const currentNode = nodes.find((n) => n.type === "addNode");
        if (!currentNode) return;

        const newNode: Node = {
          id: newNodeId,
          type: "workflowNode",
          position: currentNode.position,
          data: {
            label: item.name,
            image: item.image,
            type: type,
            onAddClick: () => handleAddClick(newNodeId),
            onNodeClick: () => handleNodeClick(newNodeId, item.id),
            onDeleteClick: () => handleDeleteNode(newNodeId),
            hasConnectedActions: false,
            isFirstNode: true,
          },
        };

        setNodes([newNode]);
        setEdges([]);
        setHasInitialNode(true);
      } else {
        const sourceNode = nodes.find((n) => n.id === currentAddContext.nodeId);
        if (!sourceNode) return;

        const newPosition = calculateNewPosition(sourceNode);

        const newNode: Node = {
          id: newNodeId,
          type: "workflowNode",
          position: newPosition,
          data: {
            label: item.name,
            image: item.image,
            type: type,
            onAddClick: () => handleAddClick(newNodeId),
            onNodeClick: () => handleNodeClick(newNodeId, item.id),
            onDeleteClick: () => handleDeleteNode(newNodeId),
            hasConnectedActions: false,
            isFirstNode: false,
          },
        };

        const newEdge: Edge = {
          id: `${currentAddContext.nodeId}-${newNodeId}`,
          source: currentAddContext.nodeId!,
          target: newNodeId,
          type: "smoothstep",
          style: { stroke: "#a6a29e", strokeWidth: 2 },
        };

        setNodes((prev) => [...prev, newNode]);
        setEdges((prev) => [...prev, newEdge]);

        // Increment action counter only after adding action
        if (type === "action") {
          setActionCounter((prev) => prev + 1);
        }
      }
      setIsModalOpen(false);
      setCurrentAddContext({});
      switch (item.id) {
        case "webhook":
          if (type === "trigger") setIsWebhookModalOpen(true);
          break;
        case "form":
          if (type === "trigger") setIsFormModalOpen(true);
          break;
        case "email":
        case "telegram":
        case "gemini":
          setCurrentActionType(item.id);
          setEditingNodeId(newNodeId);
          setIsActionModalOpen(true);
          break;
        default:
          setCurrentActionType("default");
          setEditingNodeId(newNodeId);
          setIsActionModalOpen(true);
          break;
      }
    },
    [
      currentAddContext,
      nodes,
      handleAddClick,
      handleNodeClick,
      handleDeleteNode,
      actionCounter,
    ]
  );

  const updatedNodes = nodes.map((node) => {
    if (node.type === "addNode") {
      return {
        ...node,
        data: {
          ...node.data,
          onAddClick: () => handleAddClick(),
        },
      };
    } else if (node.type === "workflowNode") {
      const nodeHasConnectedActions = hasConnectedActions(node.id);
      const nodeIsFirst = isFirstNode(node.id);

      return {
        ...node,
        data: {
          ...node.data,
          onAddClick:
            hasInitialNode && !nodeHasConnectedActions
              ? () => handleAddClick(node.id)
              : undefined,
          hasConnectedActions: nodeHasConnectedActions,
          isFirstNode: nodeIsFirst,
        },
      };
    }
    return node;
  });
  const handleSaveWorkflow = () => {
    if (!currentTrigger || currentActions.length === 0) {
      alert("Please add at least a trigger and one action");
      return;
    }

    startTransition(async () => {
      try {
        const actionsWithMetadata = currentActions.map((action, index) => ({
          type: action,
          metadata: actionMetadata[index] || {},
        }));

        await saveWorkflow(
          {
            id: currentWorkflowId,
            trigger: currentTrigger,
            actions: actionsWithMetadata,
            userId: parseInt(session.userId),
          },
          workflowId
        );

        router.push("/");
      } catch (error) {
        console.error("Failed to save workflow:", error);
      }
    });
  };

  const createCanvasFromWorkflow = useCallback(
    (workflow: Workflow) => {
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      // Create trigger node
      const triggerNode: Node = {
        id: "trigger-1",
        type: "workflowNode",
        position: { x: 400, y: 300 },
        data: {
          label: workflow.trigger.type.name,
          image: workflow.trigger.type.image,
          type: "trigger",
          onAddClick: () => handleAddClick("trigger-1"),
          onNodeClick: () =>
            handleNodeClick("trigger-1", workflow.trigger.type.id),
          onDeleteClick: () => handleDeleteNode("trigger-1"),
          hasConnectedActions: workflow.action.length > 0,
          isFirstNode: true,
        },
      };

      newNodes.push(triggerNode);
      let lastNodeId = "trigger-1";

      // Create action nodes (sorted by sortingOrder)
      const sortedActions = workflow.action.sort(
        (a, b) => a.sortingOrder - b.sortingOrder
      );

      sortedActions.forEach((action, index) => {
        const actionNodeId = index.toString();
        const position = {
          x: 400 + (index + 1) * 100,
          y: 300,
        };

        const actionNode: Node = {
          id: actionNodeId,
          type: "workflowNode",
          position: position,
          data: {
            label: action.type.name,
            image: action.type.image,
            type: "action",
            onAddClick: () => handleAddClick(actionNodeId),
            onNodeClick: () => handleNodeClick(actionNodeId, action.type.id),
            onDeleteClick: () => handleDeleteNode(actionNodeId),
            hasConnectedActions: index < sortedActions.length - 1,
            isFirstNode: false,
          },
        };

        newNodes.push(actionNode);

        // Create edge
        const edge: Edge = {
          id: `${lastNodeId}-${actionNodeId}`,
          source: lastNodeId,
          target: actionNodeId,
          type: "smoothstep",
          style: { stroke: "#a6a29e", strokeWidth: 2 },
        };

        newEdges.push(edge);
        lastNodeId = actionNodeId;
      });

      setNodes(newNodes);
      setEdges(newEdges);
    },
    [handleAddClick, handleNodeClick, handleDeleteNode]
  );

  // Check if any previous action is gemini
  function hasPreviousGeminiAction(
    currentIndex: number,
    actions: AvailableAction[]
  ) {
    return actions.slice(0, currentIndex).some((a) => a.id === "gemini");
  }

  return (
    <div className="w-screen h-screen bg-[#262624]">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative flex flex-col items-center gap-6 bg-[#30302e] px-10 py-8 rounded-3xl border border-[#4a4945] shadow-2xl">
            {/* Subtle glow effect matching your theme */}
            <div className="absolute inset-0 rounded-3xl bg-[#c6613f]/5 opacity-60" />

            {/* Enhanced spinner with pulse ring */}
            <div className="relative">
              <Loader2 className="w-10 h-10 text-[#c6613f] animate-spin drop-shadow-sm" />
              <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-[#c6613f]/20 animate-ping" />
            </div>

            {/* Loading text with animated dots */}
            <div className="relative">
              <div className="text-xl font-semibold text-[#faf9f5] tracking-wide">
                Loading workflow
              </div>
              <div className="flex justify-center mt-3">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-[#c6613f] rounded-full animate-bounce" />
                  <div
                    className="w-1.5 h-1.5 bg-[#c6613f] rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-[#c6613f] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 bg-[#30302e] hover:bg-[#3a3938] px-2 py-2 rounded-lg text-[#faf9f5] transition-colors border border-[#4a4945]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Save Workflow */}
      <div className="absolute top-4 right-4 z-10">
        {currentTrigger && currentActions.length > 0 && (
          <button
            onClick={handleSaveWorkflow}
            className="bg-[#c6613f] hover:bg-[#b5572e] px-4 py-2 rounded-lg text-[#faf9f5] transition-colors flex items-center gap-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                {workflowId ? "Updating..." : "Saving..."}
              </>
            ) : workflowId ? (
              "Update Workflow"
            ) : (
              "Save Workflow"
            )}
          </button>
        )}
      </div>

      <ReactFlow
        nodes={updatedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        colorMode="dark"
        fitView
        className="bg-[#262624]"
        zoomOnScroll={false}
        zoomOnDoubleClick={true}
        zoomOnPinch={true}
        panOnScroll={true}
        panOnDrag={true}
      >
        <Background
          color="#4a4945"
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
        />
        <Controls className="!bg-[#30302e] !border-[#4a4945]" />
      </ReactFlow>

      <WorkflowModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentAddContext({});
        }}
        onSelectItem={handleSelectItem}
        triggers={triggers}
        actions={actions}
        selectedNodeId={selectedNodeId}
        isInitialSelection={currentAddContext.isInitial || false}
      />

      {currentActionType && editingNodeId !== null && (
        <ActionModal
          isOpen={isActionModalOpen}
          onClose={() => {
            setIsActionModalOpen(false);
            setCurrentActionType(null);
            setEditingNodeId(null);
          }}
          onSave={handleActionFormSave}
          actionType={currentActionType}
          userId={session.userId}
          existingMetadata={actionMetadata[parseInt(editingNodeId)] || {}} // Pass metadata for the specific node being edited
          currentNodeId={editingNodeId}
          webhookKeys={webhookKeys}
          formKeys={formKeys}
          geminiResponseKeys={
            hasPreviousGeminiAction(parseInt(editingNodeId), currentActions)
              ? ["geminiResponse"]
              : []
          }
        />
      )}

      <WebhookTriggerModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        onSave={handleWebhookFormSave}
        userId={session.userId}
        workflowId={currentWorkflowId}
        onWebhookKeys={setWebhookKeys}
      />

      <FormTriggerModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleFormTriggerSave}
        onFormKeys={setFormKeys}
      />
    </div>
  );
}