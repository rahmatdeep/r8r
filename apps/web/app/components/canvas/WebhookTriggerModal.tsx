import { useState, useEffect } from "react";
import { X, Copy, Check, Loader2, Workflow } from "lucide-react";
import axios from "axios";

interface WebhookTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { apiUrl: string }) => void;
  userId: string;
  workflowId: string;
}

export const WebhookTriggerModal = ({
  isOpen,
  onClose,
  onSave,
  userId,
  workflowId,
}: WebhookTriggerModalProps) => {
  const [response, setResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasSuccessfulResponse, setHasSuccessfulResponse] = useState(false);

  // Generate webhook URL
  const webhookUrl = `${process.env.NEXT_PUBLIC_HOOKS_URL}/hooks/catch/${userId}/${workflowId}`;

  // Reset only certain states when modal opens/closes - keep response if successful
  useEffect(() => {
    if (isOpen) {
      setIsListening(false);
      setCopied(false);
      // Only reset response if it was an error, keep successful responses
      if (response.startsWith("Error")) {
        setResponse("");
        setHasSuccessfulResponse(false);
      }
    }
  }, [isOpen, response]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  const handleListenForWebhook = async () => {
    setIsListening(true);
    setResponse(""); // Clear any previous response when starting new test

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOOKS_URL}/testing`,
        {
          params: {
            workflowId,
          },
          timeout: 35000,
        }
      );

      setResponse(JSON.stringify(response.data, null, 2));
      setHasSuccessfulResponse(true); // Mark as successful
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          setResponse("Error: Request timed out");
        } else {
          setResponse(
            `Error: ${error.response?.data?.message || error.message}`
          );
        }
      } else {
        setResponse("Error: Failed to listen for webhook");
      }
      setHasSuccessfulResponse(false);
    } finally {
      setIsListening(false);
    }
  };

  const handleSaveAndClose = () => {
    onSave({ apiUrl: webhookUrl });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#30302e] rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-[#4a4945]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#c6613f] rounded-lg flex items-center justify-center">
              <Workflow className="w-4 h-4 text-[#faf9f5]" />
            </div>
            <h2 className="text-xl font-semibold text-[#faf9f5]">
              Webhook Trigger
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#3a3938] rounded-lg transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 text-[#a6a29e]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Webhook URL Section */}
          <div>
            <label className="block text-sm font-medium text-[#faf9f5] mb-3">
              Your Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] text-sm font-mono"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-4 py-2 bg-[#4a4945] hover:bg-[#5a5955] text-[#faf9f5] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-[#a6a29e] mt-2">
              Use this URL to trigger your workflow from external services
            </p>
          </div>

          {/* Test Section */}
          <div>
            <label className="block text-sm font-medium text-[#faf9f5] mb-3">
              Test Your Webhook
            </label>

            <button
              type="button"
              onClick={handleListenForWebhook}
              disabled={isListening}
              className="w-full px-4 py-3 bg-[#c6613f] hover:bg-[#b5572e] disabled:bg-[#4a4945] text-[#faf9f5] rounded-lg transition-all flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md disabled:cursor-not-allowed"
            >
              {isListening ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Listening for webhook...
                </>
              ) : hasSuccessfulResponse ? (
                <>
                  <Workflow className="w-4 h-4" />
                  Test Again
                </>
              ) : (
                <>
                  <Workflow className="w-4 h-4" />
                  Listen for Webhook
                </>
              )}
            </button>

            {isListening && (
              <div className="mt-3 p-4 bg-[#3a3938] border border-[#4a4945] rounded-lg">
                <div className="text-sm text-[#faf9f5] mb-2">
                  <span className="font-medium">
                    Waiting for webhook call...
                  </span>
                </div>
                <p className="text-xs text-[#a6a29e]">
                  Send a request to the webhook URL above to test it
                </p>
              </div>
            )}
          </div>

          {/* Response Display */}
          {response && (
            <div>
              <label className="block text-sm font-medium text-[#faf9f5] mb-2">
                {response.startsWith("Error") ? "Error" : "Webhook Response"}
              </label>
              <pre
                className={`p-3 border rounded-lg text-sm overflow-auto max-h-40 ${
                  response.startsWith("Error")
                    ? "bg-red-900/20 border-red-500/30 text-red-400"
                    : "bg-[#3a3938] border-[#4a4945] text-[#faf9f5]"
                }`}
              >
                {response}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
