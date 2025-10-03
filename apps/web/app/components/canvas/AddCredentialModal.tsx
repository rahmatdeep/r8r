import { useState } from "react";
import { X } from "lucide-react";
import { createCredential } from "../../utils/api";
import { credentialCreateType } from "@repo/types/types";

interface AddCredentialModalProps {
  platform?: "email" | "telegram";
  onClose: () => void;
  onSuccess: () => void;
}

export const AddCredentialModal = ({
  platform: initialPlatform,
  onClose,
  onSuccess,
}: AddCredentialModalProps) => {
  const [platform, setPlatform] = useState<"email" | "telegram" | "">(
    initialPlatform || ""
  );
  const [formData, setFormData] = useState({
    title: "",
    apiKey: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) {
      alert("Please select a platform");
      return;
    }
    setIsLoading(true);

    try {
      const credentialData: credentialCreateType = {
        title: formData.title,
        platform,
        keys: {
          apiKey: formData.apiKey,
        },
      };

      await createCredential(credentialData);
      onSuccess();
    } catch (error) {
      console.error("Failed to create credential:", error);
      alert("Failed to create credential. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#30302e] rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-[#4a4945]">
          <h2 className="text-xl font-semibold text-[#faf9f5]">
            Add Credential
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#3a3938] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#a6a29e]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Platform Selector */}
          {!initialPlatform && (
            <div>
              <label className="block text-sm font-medium text-[#faf9f5] mb-2">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) =>
                  setPlatform(e.target.value as "email" | "telegram")
                }
                className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] focus:outline-none focus:border-[#c6613f]"
                required
              >
                <option value="" disabled>
                  Select platform
                </option>
                <option value="email">Email</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#faf9f5] mb-2">
              Credential Name
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] placeholder-[#a6a29e] focus:outline-none focus:border-[#c6613f]"
              placeholder={`My ${platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : ""} Account`}
              required
              disabled={!platform}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#faf9f5] mb-2">
              API Key
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) =>
                setFormData({ ...formData, apiKey: e.target.value })
              }
              className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] placeholder-[#a6a29e] focus:outline-none focus:border-[#c6613f]"
              placeholder={`Enter your ${platform || "platform"} API key`}
              required
              disabled={!platform}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#3a3938] hover:bg-[#4a4945] text-[#faf9f5] rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#c6613f] hover:bg-[#b5572e] text-[#faf9f5] rounded-lg transition-colors disabled:opacity-50"
              disabled={isLoading || !platform}
            >
              {isLoading ? "Adding..." : "Add Credential"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};