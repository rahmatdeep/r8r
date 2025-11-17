// components/canvas/AddNode.tsx
import { Handle, Position } from "@xyflow/react";
import { Plus } from "lucide-react";

interface AddNodeProps {
  data: { onAddClick: () => void };
}

export const AddNode = ({ data }: AddNodeProps) => {
  return (
    <div className="relative">
      <div
        className="flex items-center justify-center w-8 h-8 bg-[#30302e] border-1 border-dashed border-[#4a4945] rounded-lg hover:border-[#5a5955] hover:bg-[#3a3938] transition-all duration-200 cursor-pointer group"
        onClick={data.onAddClick}
      >
        <Plus className="w-4 h-4 text-[#a6a29e] group-hover:text-[#faf9f5] transition-colors" />
      </div>
      <Handle
        type="target"
        position={Position.Right}
        className="!bg-[#a6a29e] !border-2 !border-[#4a4945] !w-2 !h-2"
      />
    </div>
  );
};
