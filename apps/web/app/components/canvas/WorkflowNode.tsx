import { Handle, Position } from "@xyflow/react";
import { Plus, X } from "lucide-react";
import { getWorkflowIcon } from "../../utils/getWorkflowIcon";

interface WorkflowNodeProps {
  data: {
    label: string;
    image: string;
    type: "trigger" | "action";
    onAddClick?: () => void;
    onNodeClick?: () => void;
    onDeleteClick?: () => void;
    hasConnectedActions?: boolean;
    isFirstNode?: boolean;
  };
}

export const WorkflowNode = ({ data }: WorkflowNodeProps) => {
  const Icon = getWorkflowIcon(data.label, data.type);

  return (
    <div className="relative group flex items-center">
      <div
        className={
          data.type === "trigger"
            ? "w-12 h-12 flex items-center justify-center bg-[#c6613f] rounded-full shadow-lg cursor-pointer hover:opacity-90 transition-opacity relative"
            : "w-12 h-12 flex items-center justify-center bg-[#30302e] rounded-xl shadow-lg cursor-pointer hover:opacity-90 transition-opacity relative border border-[#4a4945]"
        }
        onClick={data.onNodeClick}
        title={data.label}
      >
        <Icon className="w-6 h-6 text-[#faf9f5]" />

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDeleteClick?.();
          }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#4a4945] hover:bg-[#5a5955] border border-[#6a6965] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-2.5 h-2.5 text-[#faf9f5]" />
        </button>
      </div>

      {/* SOURCE HANDLE */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-[#faf9f5] !border-2 !border-[#a6a29e] !w-2 !h-2"
        style={{ opacity: data.onAddClick ? 0 : 1 }}
      />

      {/* TARGET HANDLE */}
      {!data.isFirstNode && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-[#faf9f5] !border-2 !border-[#a6a29e] !w-2 !h-2"
        />
      )}

      {/* Add button */}
      {data.onAddClick && (
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex items-center">
          <div className="w-5 h-0.5 bg-[#a6a29e]"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onAddClick!();
            }}
            className="w-5 h-5 bg-[#30302e] hover:bg-[#3a3938] hover:scale-110 border border-[#4a4945] hover:border-[#5a5955] rounded-full flex items-center justify-center transition-all duration-200"
          >
            <Plus className="w-2 h-2 text-[#faf9f5]" />
          </button>
        </div>
      )}
    </div>
  );
};