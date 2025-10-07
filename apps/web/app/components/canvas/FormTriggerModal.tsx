import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

// Utility to convert label to camelCase
function toCamelCase(label: string) {
  return label
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, "");
}

interface FormTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { fields: { label: string; type: string }[] }) => void;
  onFormKeys: (keys: string[]) => void;
}
interface Field {
  label: string;
  type: string;
}

export function FormTriggerModal({
  isOpen,
  onClose,
  onSave,
  onFormKeys,
}: FormTriggerModalProps) {
  const [fields, setFields] = useState<Field[]>([]);

  const addField = () => setFields([...fields, { label: "", type: "text" }]);
  const updateField = (idx: number, key: keyof Field, value: string) => {
    setFields(fields.map((f, i) => (i === idx ? { ...f, [key]: value } : f)));
  };
  const removeField = (idx: number) =>
    setFields(fields.filter((_, i) => i !== idx));

  const handleSave = () => {
    const keys = fields.map((f) => toCamelCase(f.label)).filter(Boolean);
    onFormKeys(keys);
    onSave({ fields });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[#30302e] rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#faf9f5]">
            Configure Form Trigger
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#3a3938] rounded-lg"
          >
            <X className="w-5 h-5 text-[#a6a29e]" />
          </button>
        </div>
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={idx} className="flex flex-wrap gap-2 items-center w-full">
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(idx, "label", e.target.value)}
                placeholder="Field label (e.g. First Name)"
                className="px-3 py-2 rounded-lg bg-[#3a3938] border border-[#4a4945] text-[#faf9f5] flex-1 min-w-0"
              />
              <select
                value={field.type}
                onChange={(e) => updateField(idx, "type", e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#3a3938] border border-[#4a4945] text-[#faf9f5] focus:outline-none focus:border-[#c6613f]"
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
                <option value="email">Email</option>
              </select>
              <button
                onClick={() => removeField(idx)}
                className="p-2 rounded-full hover:bg-red-900/20 transition-colors"
                title="Remove field"
                style={{ flexShrink: 0 }}
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addField}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-2 bg-[#c6613f] hover:bg-[#b5572e] text-[#faf9f5] rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Form Field
          </button>
        </div>
        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#3a3938] text-[#faf9f5] rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-[#c6613f] text-[#faf9f5] rounded-lg font-medium"
          >
            Save Trigger
          </button>
        </div>
      </div>
    </div>
  );
}
