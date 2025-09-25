import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  EmailActionMetadataSchema,
  TelegramActionMetadataSchema,
  emailMetadataType,
  telegramMetadataType,
  emailCredentialsType,
  telegramCredentialsType,
} from "@repo/types/types";
import { CredentialResponse, getCredentials } from "../../utils/api";
import { AddCredentialModal } from "./AddCredentialModal";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metadata: any) => void;
  actionType: string;
  userId?: string;
  existingMetadata?: Record<string, any>;
  currentNodeId?: string;
}

export const ActionModal = ({
  isOpen,
  onClose,
  onSave,
  actionType,
  existingMetadata = {},
}: ActionModalProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [credentials, setCredentials] = useState<CredentialResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCredential, setShowAddCredential] = useState(false);

  useEffect(() => {
    if (isOpen && actionType) {
      loadCredentials();

      // Initialize form data with existing metadata
      setFormData({
        credentialId: existingMetadata.credentialId || "",
        from: existingMetadata.from || "",
        to: existingMetadata.to || "",
        subject: existingMetadata.subject || "",
        body: existingMetadata.body || "",
        chatId: existingMetadata.chatId || "",
        message: existingMetadata.message || "",
      });
    }
  }, [isOpen, actionType, existingMetadata]);

  const loadCredentials = async () => {
    setIsLoading(true);
    try {
      const creds = await getCredentials();
      const filteredCredentials = creds.filter(
        (c) => c.platform === actionType
      );
      setCredentials(filteredCredentials);
    } catch (error) {
      console.error("Failed to load credentials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (fieldKey: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleCredentialSelect = (value: string) => {
    if (value === "add_new") {
      setShowAddCredential(true);
    } else {
      handleInputChange("credentialId", value);
    }
  };

  const handleCredentialAdded = () => {
    setShowAddCredential(false);
    loadCredentials(); // Reload credentials
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.credentialId) {
      alert("Please select a credential");
      return;
    }

    try {
      let validatedData;

      if (actionType === "email") {
        validatedData = EmailActionMetadataSchema.parse({
          from: formData.from,
          to: formData.to,
          subject: formData.subject,
          body: formData.body,
        });
      } else if (actionType === "telegram") {
        validatedData = TelegramActionMetadataSchema.parse({
          chatId: formData.chatId,
          message: formData.message,
        });
      }

      const metadata = {
        type: actionType,
        data: {
          ...validatedData,
          credentialId: formData.credentialId, // Include credential ID
        },
      };

      onSave(metadata);
      onClose();
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const getTitle = () => {
    switch (actionType) {
      case "email":
        return "Send Email";
      case "telegram":
        return "Send Telegram Message";
      default:
        return "Configure Action";
    }
  };

  const renderCredentialSelect = () => (
    <div>
      <label className="block text-sm font-medium text-[#faf9f5] mb-2">
        {actionType === "email" ? "Email Credential" : "Telegram Credential"}
      </label>
      <select
        value={formData.credentialId}
        onChange={(e) => handleCredentialSelect(e.target.value)}
        className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] focus:outline-none focus:border-[#c6613f]"
        required
      >
        <option value="">Select a credential</option>
        {credentials.map((cred) => (
          <option key={cred.id} value={cred.id}>
            {cred.title}
          </option>
        ))}
        <option value="add_new" className="text-[#c6613f] font-medium">
          + Add New Credential
        </option>
      </select>
    </div>
  );
  const renderEmailFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-[#faf9f5] mb-2">
          From Email
        </label>
        <input
          value={formData.from}
          onChange={(e) => handleInputChange("from", e.target.value)}
          className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] placeholder-[#a6a29e] focus:outline-none focus:border-[#c6613f]"
          placeholder="sender@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#faf9f5] mb-2">
          To Email
        </label>
        <input
          value={formData.to}
          onChange={(e) => handleInputChange("to", e.target.value)}
          className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] placeholder-[#a6a29e] focus:outline-none focus:border-[#c6613f]"
          placeholder="recipient@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#faf9f5] mb-2">
          Subject
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => handleInputChange("subject", e.target.value)}
          className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] placeholder-[#a6a29e] focus:outline-none focus:border-[#c6613f]"
          placeholder="Email subject"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#faf9f5] mb-2">
          Message Body
        </label>
        <textarea
          value={formData.body}
          onChange={(e) => handleInputChange("body", e.target.value)}
          className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] placeholder-[#a6a29e] focus:outline-none focus:border-[#c6613f] resize-none"
          placeholder="Enter your message..."
          required
          rows={4}
        />
      </div>
    </>
  );

  const renderTelegramFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-[#faf9f5] mb-2">
          Chat ID
        </label>
        <input
          type="text"
          value={formData.chatId}
          onChange={(e) => handleInputChange("chatId", e.target.value)}
          className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] placeholder-[#a6a29e] focus:outline-none focus:border-[#c6613f]"
          placeholder="Telegram chat ID"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#faf9f5] mb-2">
          Message
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => handleInputChange("message", e.target.value)}
          className="w-full px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] placeholder-[#a6a29e] focus:outline-none focus:border-[#c6613f] resize-none"
          placeholder="Enter your message..."
          required
          rows={4}
        />
      </div>
    </>
  );

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-[#30302e] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#c6613f] mr-2"></div>
            <span className="text-[#faf9f5]">Loading credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-[#30302e] rounded-2xl shadow-2xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b border-[#4a4945]">
            <h2 className="text-xl font-semibold text-[#faf9f5]">
              {getTitle()}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#3a3938] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#a6a29e]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {renderCredentialSelect()}

            {actionType === "email" && renderEmailFields()}
            {actionType === "telegram" && renderTelegramFields()}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-[#3a3938] hover:bg-[#4a4945] text-[#faf9f5] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#c6613f] hover:bg-[#b5572e] text-[#faf9f5] rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Credential Modal */}
      {showAddCredential && (
        <AddCredentialModal
          platform={actionType as "email" | "telegram"}
          onClose={() => setShowAddCredential(false)}
          onSuccess={handleCredentialAdded}
        />
      )}
    </>
  );
};
