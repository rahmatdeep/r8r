"use client";
import { useState, useEffect } from "react";
import { getWorkflowById, triggerWebhookManually } from "../utils/api";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toCamelCase } from "../utils/toCamelCase";

interface Field {
  label: string;
  type: string;
}

export default function FormClient({
  userId,
  workflowId,
}: {
  userId: string;
  workflowId: string;
}) {
  const [fields, setFields] = useState<Field[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [formTitle, setFormTitle] = useState<string>("");

  useEffect(() => {
    async function fetchFields() {
      setLoading(true);
      try {
        const workflow = await getWorkflowById(workflowId);
        setFields(workflow?.trigger?.metadata?.fields || []);
        setFormTitle(workflow?.trigger?.metadata?.title || "Fill the Form");
        setLoading(false);
      } catch {
        setError("Workflow not found or access denied.");
        setLoading(false);
      }
    }
    fetchFields();
  }, [workflowId]);

  const handleChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const camelCasedFormData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          toCamelCase(key),
          value,
        ])
      );
      await triggerWebhookManually(userId, workflowId, camelCasedFormData);
      setStatus("success");
    } catch {
      setStatus("Webhook trigger failed. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#262624] px-4">
        <div className="bg-[#30302e] border border-[#4a4945] rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-[#c6613f] mb-4" />
          <h1 className="text-2xl font-bold text-[#faf9f5] mb-2">
            Error Loading Form
          </h1>
          <p className="text-[#a6a29e] mb-6 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#262624] px-4">
        <div className="bg-[#30302e] border border-[#4a4945] rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-md w-full">
          <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
          <h1 className="text-2xl font-bold text-[#faf9f5] mb-2">
            Form Submitted!
          </h1>
          <p className="text-[#a6a29e] mb-6 text-center">
            Your response has been recorded and the workflow has been triggered.
          </p>
        </div>
      </div>
    );
  }

  if (status === "submitting" || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#262624] px-4">
        <div className="bg-[#30302e] border border-[#4a4945] rounded-2xl shadow-lg p-10 flex flex-col items-center max-w-md w-full">
          <Loader2 className="w-14 h-14 text-[#c6613f] animate-spin mb-6" />
          <h1 className="text-2xl font-bold text-[#faf9f5] mb-2">
            {status === "submitting" ? "Submitting..." : "Loading Form"}
          </h1>
          <p className="text-[#a6a29e] text-center">
            {status === "submitting"
              ? "Please wait while we submit your response."
              : "Fetching form details. This will only take a moment..."}
          </p>
        </div>
      </div>
    );
  }

  if (!fields || fields.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#262624] px-4">
        <div className="bg-[#30302e] border border-[#4a4945] rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-[#c6613f] mb-4" />
          <h2 className="text-xl font-bold mb-2 text-[#faf9f5]">
            No Form Fields
          </h2>
          <p className="text-[#a6a29e] text-center">
            This form has not been configured with any fields yet.
            <br />
            Please contact the workflow owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#262624] px-4">
      <div className="bg-[#30302e] border border-[#4a4945] rounded-2xl shadow-2xl p-10 max-w-md w-full">
        <h1 className="text-2xl font-extrabold mb-8 text-[#faf9f5] text-center tracking-tight">
          {formTitle}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-7">
          {fields.map((field) => (
            <div key={field.label} className="flex flex-col gap-2">
              <label className="text-[#faf9f5] font-semibold text-base">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-[#232321] border border-[#4a4945] text-[#faf9f5] focus:outline-none focus:ring-2 focus:ring-[#c6613f] resize-none transition-shadow"
                  value={formData[field.label] || ""}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                  required
                  rows={4}
                />
              ) : (
                <input
                  type={field.type}
                  className="w-full px-4 py-3 rounded-lg bg-[#232321] border border-[#4a4945] text-[#faf9f5] focus:outline-none focus:ring-2 focus:ring-[#c6613f] transition-shadow"
                  value={formData[field.label] || ""}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                  required
                  autoComplete="off"
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-[#c6613f] hover:bg-[#b5572e] text-[#faf9f5] py-3 rounded-lg font-bold text-lg tracking-wide shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#c6613f]"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
