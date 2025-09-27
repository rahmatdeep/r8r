import { Workflow, Mail, MessageCircle, FileText, Webhook } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function getWorkflowIcon(
  labelOrName: string,
  type: "trigger" | "action"
): LucideIcon {
  const lower = labelOrName.toLowerCase();

  if (type === "action") {
    if (lower.includes("email") || lower.includes("mail")) {
      return Mail;
    }
    if (lower.includes("telegram") || lower.includes("tg")) {
      return MessageCircle;
    }
    return Workflow;
  }

  if (type === "trigger") {
    if (lower.includes("webhook") || lower.includes("hook")) {
      return Webhook;
    }
    if (lower.includes("form")) {
      return FileText;
    }
    return Workflow;
  }

  return Workflow;
}