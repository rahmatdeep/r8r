"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  LogOut,
  MoveRight,
  Plus,
  SquarePen,
  Trash2,
  Key,
  Mail,
  MessageCircle,
  Check,
  Copy,
  Link2,
} from "lucide-react";
import {
  getWorkflows,
  Workflow,
  getCredentials,
  CredentialResponse,
  deleteCredential,
  getWorkflowExecutionHistory,
  HistoryItem,
  deleteWorkflow,
} from "../utils/api";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { AddCredentialModal } from "../components/canvas/AddCredentialModal";
import { Loader2 } from "lucide-react";
import { getWorkflowIcon } from "../utils/getWorkflowIcon";

type TabType = "workflows" | "credentials" | "history";

interface DashboardProps {
  session: Session;
}

export default function Dashboard({ session }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("workflows");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [credentials, setCredentials] = useState<CredentialResponse[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(true);
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showAddCredential, setShowAddCredential] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<
    "email" | "telegram" | "gemini"
  >("email");
  const [copiedWorkflowId, setCopiedWorkflowId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [deletingWorkflowId, setDeletingWorkflowId] = useState<string | null>(
    null
  );
  const [deletingCredentialId, setDeletingCredentialId] = useState<
    string | null
  >(null);

  useEffect(() => {
    loadData();
  }, [session.userId]);

  const loadData = async () => {
    setLoadingWorkflows(true);
    setLoadingCredentials(true);
    setLoadingHistory(true);
    try {
      const [workflowsData, credentialsData, historyData] = await Promise.all([
        getWorkflows(),
        getCredentials(),
        getWorkflowExecutionHistory(),
      ]);
      setWorkflows(workflowsData || []);
      setCredentials(credentialsData || []);
      setHistory(historyData || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoadingWorkflows(false);
      setLoadingCredentials(false);
      setLoadingHistory(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    setDeletingWorkflowId(workflowId);
    try {
      await deleteWorkflow(workflowId);
      setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    } catch {
      alert("Failed to delete workflow.");
    } finally {
      setDeletingWorkflowId(null);
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    setDeletingCredentialId(credentialId);
    try {
      await deleteCredential(credentialId);
      // Remove from UI after successful delete
      setCredentials((prev) => prev.filter((c) => c.id !== credentialId));
    } catch (error) {
      alert("Failed to delete credential.");
    } finally {
      setDeletingCredentialId(null);
    }
  };

  const handleAddCredential = (platform: "email" | "telegram") => {
    setSelectedPlatform(platform);
    setShowAddCredential(true);
  };

  const handleCredentialAdded = () => {
    setShowAddCredential(false);
    loadData(); // Reload data
  };

  const handleCopyWebhookUrl = async (url: string, workflowId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedWorkflowId(workflowId);
      setTimeout(() => setCopiedWorkflowId(null), 2000);
    } catch {
      alert("Failed to copy webhook URL");
    }
  };

  const renderWorkflowsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold">My Workflows</h2>
      </div>
      {loadingWorkflows ? (
        <div className="text-center py-12 text-[#a6a29e]">
          <Spinner text="Loading workflows..." />
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-12 text-[#a6a29e]">
          <div className="mb-4">
            <Plus className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-medium mb-2">No workflows created yet</h3>
          <p className="mb-6">Create your first workflow automation</p>
          <Link
            href="/canvas"
            className="inline-flex items-center gap-2 bg-[#c6613f] hover:bg-[#b5572e] px-4 py-2 rounded-lg font-medium transition-colors text-[#faf9f5]"
          >
            <Plus className="w-4 h-4" />
            Create Your First Workflow
          </Link>
        </div>
      ) : (
        workflows.map((workflow) => {
          const webhookUrl = `${process.env.NEXT_PUBLIC_HOOKS_URL}/hooks/catch/${workflow.userId}/${workflow.id}`;
          return (
            <div key={workflow.id} className="relative">
              <Link
                href={`/canvas/${workflow.id}`}
                className="block bg-[#30302e] rounded-2xl shadow p-6 border border-[#4a4945] hover:bg-[#3a3938] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <h3 className="font-medium text-lg mb-1">
                        {workflow.trigger.type.name} Automation
                      </h3>
                      {/* Webhook URL */}
                      {workflow.trigger?.type?.id === "webhook" && (
                        <div className="mb-3 flex items-center gap-2">
                          <span className="inline-flex items-center bg-[#232321] border border-[#3a3938] rounded-lg px-2 py-1 text-xs font-mono text-[#faf9f5] shadow-sm">
                            <Link2 className="w-3 h-3 mr-1 text-[#c6613f]" />
                            {webhookUrl}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCopyWebhookUrl(webhookUrl, workflow.id);
                            }}
                            className="px-2 py-1 rounded-full bg-[#3a3938] hover:bg-[#4a4945] text-xs text-[#faf9f5] flex items-center gap-1 transition-colors border border-[#4a4945]"
                          >
                            {copiedWorkflowId === workflow.id ? (
                              <>
                                <Check className="w-3 h-3 text-green-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      {/* Form URL */}
                      {workflow.trigger?.type?.id === "form" && (
                        <div className="mb-3 flex items-center gap-2">
                          <span className="inline-flex items-center bg-[#232321] border border-[#3a3938] rounded-lg px-2 py-1 text-xs font-mono text-[#faf9f5] shadow-sm">
                            <Link2 className="w-3 h-3 mr-1 text-[#c6613f]" />
                            {`${window.location.origin}/forms/${workflow.userId}/${workflow.id}`}
                          </span>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await navigator.clipboard.writeText(
                                `${window.location.origin}/forms/${workflow.userId}/${workflow.id}`
                              );
                              setCopiedWorkflowId(workflow.id + "-form");
                              setTimeout(() => setCopiedWorkflowId(null), 2000);
                            }}
                            className="px-2 py-1 rounded-full bg-[#3a3938] hover:bg-[#4a4945] text-xs text-[#faf9f5] flex items-center gap-1 transition-colors border border-[#4a4945]"
                          >
                            {copiedWorkflowId === workflow.id + "-form" ? (
                              <>
                                <Check className="w-3 h-3 text-green-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-[#a6a29e]">
                        <span>{workflow.trigger.type.name}</span>
                        <MoveRight className="w-4 h-4" />
                        {workflow.action.map((action, index) => (
                          <span
                            key={action.id}
                            className="flex items-center gap-3"
                          >
                            {action.type.name}
                            {index < workflow.action.length - 1 && (
                              <MoveRight className="w-4 h-4" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteWorkflow(workflow.id)}
                className="absolute top-4 right-4 p-2 text-[#a6a29e] hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-all duration-200 z-10"
                title="Delete workflow"
                disabled={deletingWorkflowId === workflow.id}
              >
                {deletingWorkflowId === workflow.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })
      )}
    </div>
  );

  const renderCredentialsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[#faf9f5]">
          Stored Credentials
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddCredential(true)}
            className="bg-[#c6613f] hover:bg-[#b5572e] px-4 py-2 rounded-lg transition-colors text-[#faf9f5] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Credential
          </button>
        </div>
      </div>
      {loadingCredentials ? (
        <div className="text-center py-12 text-[#a6a29e]">
          <Spinner text="Loading credentials..." />
        </div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-12 text-[#a6a29e]">
          <div className="mb-4">
            <Key className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            No credentials stored yet
          </h3>
          <p className="mb-6">Add credentials to connect your accounts</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {credentials.map((credential) => {
            const Icon = getWorkflowIcon(credential.platform, "action");
            return (
              <div
                key={credential.id}
                className="bg-[#30302e] rounded-xl p-4 border border-[#4a4945] hover:bg-[#3a3938] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#c6613f]">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#faf9f5]">
                        {credential.title}
                      </h3>
                      <p className="text-sm text-[#a6a29e] capitalize">
                        {credential.platform}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteCredential(credential.id)}
                      className="p-2 text-[#a6a29e] hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-all duration-200"
                      title="Delete credential"
                      disabled={deletingCredentialId === credential.id}
                    >
                      {deletingCredentialId === credential.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Add Credential Modal */}
      {showAddCredential && (
        <AddCredentialModal
          onClose={() => setShowAddCredential(false)}
          onSuccess={handleCredentialAdded}
        />
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#faf9f5]">
        Execution History
      </h2>
      {loadingHistory ? (
        <div className="text-center py-12 text-[#a6a29e]">
          <Spinner text="Loading history..." />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 text-[#a6a29e]">
          <Clock className="w-12 h-12 mx-auto opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No history yet</h3>
          <p>Workflow runs will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((item) => {
              const executionTime =
                item.finishedAt && item.createdAt
                  ? Math.max(
                      0,
                      new Date(item.finishedAt).getTime() -
                        new Date(item.createdAt).getTime()
                    )
                  : null;
              return (
                <div
                  key={item.id}
                  className="bg-[#30302e] rounded-xl p-4 border border-[#4a4945] hover:bg-[#3a3938] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-[#faf9f5]">
                        Workflow ID: {item.workflowId}
                      </h3>
                      {/* <p className="text-sm text-[#a6a29e]">
                        To: {item.metaData?.to || "-"}
                      </p>
                      <p className="text-sm text-[#a6a29e]">
                        Body: {item.metaData?.body || "-"}
                      </p> */}
                    </div>
                    <div className="flex items-center gap-4">
                      {executionTime !== null && (
                        <div className="flex items-center gap-1 text-xs text-[#a6a29e]">
                          <Clock className="w-3 h-3" />
                          {executionTime}ms
                        </div>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "Complete"
                            ? "bg-green-900 text-green-300"
                            : item.status === "Error"
                              ? "bg-red-900 text-red-300"
                              : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-sm text-[#a6a29e]">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  {/* Metadata */}
                  <div className="mt-2">
                    <div className="text-xs text-[#a6a29e] mb-1 font-semibold">
                      Metadata
                    </div>
                    <div className="bg-[#232321] rounded px-3 py-2 text-sm font-mono">
                      {Object.entries(item.metaData || {}).map(
                        ([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="text-[#c6613f]">{key}:</span>
                            <span className="text-[#faf9f5]">
                              {String(value)}
                            </span>
                          </div>
                        )
                      )}
                      {Object.keys(item.metaData || {}).length === 0 && (
                        <span className="text-[#a6a29e]">No metadata</span>
                      )}
                    </div>
                  </div>
                  {item.errorMetadata && (
                    <p className="text-xs text-red-400 mt-1">
                      {item.errorMetadata.errorMessage}
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );

  const formatRelativeTime = (isoString: string): string => {
    const now = new Date();
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return `${year}-${month}-${day}`;
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <div className="min-h-screen bg-[#262624] text-[#faf9f5]">
      {/* Header */}
      <nav className="bg-[#30302e] border-b border-[#4a4945]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-[#faf9f5]">
              r8r
            </h1>
            <div className="flex items-center gap-6">
              {/* Primary Action */}
              <Link
                href="/canvas"
                className="flex items-center gap-2 bg-[#c6613f] hover:bg-[#b5572e] px-4 py-2 rounded-lg font-medium transition-colors text-[#faf9f5] shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create Workflow
              </Link>

              {/* User Profile Section */}
              <div className="flex items-center gap-4 pl-4 border-l border-[#4a4945]">
                {/* User Avatar & Info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#c6613f] to-[#b5572e] rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-sm font-semibold text-[#faf9f5]">
                        {session.user.name?.[0]?.toUpperCase() ||
                          session.user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#faf9f5]">
                      {session.user.name || "User"}
                    </span>
                    <span className="text-xs text-[#a6a29e] truncate max-w-[120px]">
                      {session.user.email}
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="p-2 text-[#a6a29e] hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-all duration-200"
                  title="Sign Out"
                  disabled={signingOut}
                >
                  {signingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-5xl mx-auto py-12 px-6">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-[#3a3938] relative overflow-hidden">
            <nav className="-mb-px flex relative">
              {/* Simple sliding background */}
              <div
                className="absolute bottom-0 left-0 h-0.5 bg-[#c6613f] transition-transform duration-300 ease-out"
                style={{
                  width: "33.333%",
                  transform: `translateX(${
                    ["workflows", "credentials", "history"].indexOf(activeTab) *
                    100
                  }%)`,
                }}
              />

              {[
                {
                  id: "workflows",
                  label: "My Workflows",
                  count: workflows?.length,
                },
                {
                  id: "credentials",
                  label: "Credentials",
                  count: credentials?.length,
                },
                { id: "history", label: "History", count: history.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-3 px-4 font-medium text-sm transition-all duration-200 flex-1 ${
                    activeTab === tab.id
                      ? "text-[#c6613f]"
                      : "text-[#a6a29e] hover:text-[#faf9f5]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {tab.label}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-[#c6613f]/20 text-[#c6613f] scale-105"
                          : "bg-[#3a3938] text-[#a6a29e]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "workflows" && renderWorkflowsTab()}
        {activeTab === "credentials" && renderCredentialsTab()}
        {activeTab === "history" && renderHistoryTab()}
      </div>
    </div>
  );
}

function Spinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-[#a6a29e]">
      <Loader2 className="animate-spin w-8 h-8 mb-4" />
      <span>{text}</span>
    </div>
  );
}