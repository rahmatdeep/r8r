import { useState } from "react";
import { X } from "lucide-react";
import { createCredential, updateCredential } from "../../utils/api";
import {
  credentialCreateType,
  credentialUpdateType,
  Platform,
  PLATFORMS,
} from "@repo/types/types";

interface AddCredentialModalProps {
  platform?: Platform;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    title: string;
    platform: string;
    keys: any;
  };
  isEdit?: boolean;
}

export const AddCredentialModal = ({
  platform: initialPlatform,
  onClose,
  onSuccess,
  initialData,
  isEdit,
}: AddCredentialModalProps) => {
  const [platform, setPlatform] = useState<Platform | "">(
    (initialData?.platform as Platform) || (initialPlatform as Platform) || ""
  );
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    apiKey: initialData?.keys?.apiKey || "",
    user: initialData?.keys?.user || "",
    pass: initialData?.keys?.pass || "",
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
      if (isEdit && initialData?.id) {
        // Update credential
        const credentialData: credentialUpdateType = {
          credentialsId: initialData.id,
          title: formData.title,
          platform,
          keys:
            platform === "gmail"
              ? { user: formData.user, pass: formData.pass }
              : { apiKey: formData.apiKey },
        };
        await updateCredential(credentialData);
      } else {
        // Add credential
        const credentialData: credentialCreateType = {
          title: formData.title,
          platform,
          keys:
            platform === "gmail"
              ? { user: formData.user, pass: formData.pass }
              : { apiKey: formData.apiKey },
        };
        await createCredential(credentialData);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save credential:", error);
      alert("Failed to save credential. Please try again.");
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
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] focus:outline-none focus:border-[#c6613f]"
                required
              >
                <option value="" disabled>
                  Select platform
                </option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
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

          {platform === "gmail" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-[#faf9f5] mb-2">
                  Gmail Address
                </label>
                <input
                  type="email"
                  value={formData.user || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, user: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] placeholder-[#a6a29e] focus:outline-none focus:border-[#c6613f]"
                  placeholder="your@gmail.com"
                  required
                  disabled={!platform}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#faf9f5] mb-2">
                  Gmail App Password
                </label>
                <input
                  type="password"
                  value={formData.pass || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, pass: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] placeholder-[#a6a29e] focus:outline-none focus:border-[#c6613f]"
                  placeholder="App password"
                  required
                  disabled={!platform}
                />
              </div>
            </>
          ) : (
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
          )}

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