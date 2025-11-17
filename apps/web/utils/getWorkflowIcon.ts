import {
  Workflow,
  Mail,
  FileText,
  Webhook,
  Sparkle,
  Send,
  Inbox,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function getWorkflowIcon(
  labelOrName: string,
  type: "trigger" | "action"
): LucideIcon {
  const lower = labelOrName.toLowerCase();

  if (type === "action") {
    if (lower.includes("email")) {
      return Inbox;
    }
    if (lower.includes("telegram") || lower.includes("tg")) {
      return Send;
    }
    if (lower.includes("gemini") || lower.includes("gemi")) {
      return Sparkle;
    }
    if (lower.includes("gmail")) {
      return Mail;
    }
    if (lower.includes("solana")) {
      return Wallet; // Or use a custom Solana icon
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