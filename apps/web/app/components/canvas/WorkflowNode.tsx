import { Handle, Position } from "@xyflow/react";
import { Plus, X } from "lucide-react";

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
  const bgColor = data.type === "trigger" ? "bg-[#c6613f]" : "bg-[#c6613f]";

  return (
    <div className="relative group flex items-center">
      <div
        className={`flex items-center gap-2 px-3 py-2 ${bgColor} rounded-lg text-[#faf9f5] shadow-md min-w-[140px] cursor-pointer hover:opacity-90 transition-opacity relative`}
        onClick={data.onNodeClick}
      >
        <img src={data.image} alt={data.label} className="w-4 h-4 rounded"/>
        <span className="font-medium text-sm">{data.label}</span>

        {/* Delete button*/}
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDeleteClick?.();
          }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-[#4a4945] hover:bg-[#5a5955] border border-[#6a6965] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-2 h-2 text-[#faf9f5]" />
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
        <div className="absolute -right-7 top-1/2 -translate-y-1/2 flex items-center">
          <div className="w-3 h-0.5 bg-[#a6a29e]"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onAddClick!();
            }}
            className="w-4 h-4 bg-[#30302e] hover:bg-[#3a3938] hover:scale-110 border border-[#4a4945] hover:border-[#5a5955] rounded-full flex items-center justify-center transition-all duration-200"
          >
            <Plus className="w-2 h-2 text-[#faf9f5]" />
          </button>
        </div>
      )}
    </div>
  );
};
