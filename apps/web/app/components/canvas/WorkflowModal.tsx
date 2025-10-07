import { X } from "lucide-react";
import {
  AvailableTrigger,
  AvailableAction,
  WorkflowItemSelectHandler,
} from "../../utils/api";
import { getWorkflowIcon } from "../../utils/getWorkflowIcon";

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: WorkflowItemSelectHandler;
  triggers: AvailableTrigger[];
  actions: AvailableAction[];
  selectedNodeId?: string;
  isInitialSelection?: boolean;
}

export const WorkflowModal = ({
  isOpen,
  onClose,
  onSelectItem,
  triggers,
  actions,
  selectedNodeId,
  isInitialSelection = false,
}: WorkflowModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#30302e] rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-[#4a4945]">
          <h2 className="text-xl font-semibold text-[#faf9f5]">
            {isInitialSelection ? "Choose Trigger" : "Choose Action"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#3a3938] rounded-lg"
          >
            <X className="w-5 h-5 text-[#a6a29e]" />
          </button>
        </div>
        <div className="p-6">
          {/* Show triggers only for initial selection */}
          {isInitialSelection && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#faf9f5] mb-3">
                Triggers
              </h3>
              <div className="space-y-2">
                {triggers.map((trigger) => {
                  const Icon = getWorkflowIcon(trigger.name, "trigger");
                  return (
                    <button
                      key={trigger.id}
                      onClick={() => onSelectItem(trigger, "trigger")}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                        selectedNodeId === `trigger-${trigger.id}`
                          ? "bg-[#c6613f] hover:bg-[#b5572e]"
                          : "bg-[#3a3938] hover:bg-[#4a4945]"
                      }`}
                    >
                      <div className="w-8 h-8 bg-[#c6613f] rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#faf9f5]" />
                      </div>
                      <span className="font-medium text-[#faf9f5]">
                        {trigger.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Show actions only for non-initial selection */}
          {!isInitialSelection && (
            <div>
              <h3 className="text-lg font-medium text-[#faf9f5] mb-3">
                Actions
              </h3>
              <div className="space-y-2">
                {actions.map((action) => {
                  const Icon = getWorkflowIcon(action.name, "action");
                  return (
                    <button
                      key={action.id}
                      onClick={() => onSelectItem(action, "action")}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                        selectedNodeId === `action-${action.id}`
                          ? "bg-[#c6613f] hover:bg-[#b5572e]"
                          : "bg-[#3a3938] hover:bg-[#4a4945]"
                      }`}
                    >
                      <div className="w-8 h-8 bg-[#c6613f] rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#faf9f5]" />
                      </div>
                      <span className="font-medium text-[#faf9f5]">
                        {action.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};