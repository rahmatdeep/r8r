"use client";
import React, { useState, useEffect, useRef, JSX } from "react";
import {
  Zap,
  Webhook,
  Mail,
  Sparkles,
  ArrowRight,
  Github,
  Play,
  Code2,
  Boxes,
  Heart,
  Inbox,
  Send,
  Wallet,
  FileText,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function R8rLanding() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  // Workflow state
  const [workflowTrigger, setWorkflowTrigger] = useState<{
    icon: JSX.Element;
    name: string;
  } | null>(null);
  const [workflowAction1, setWorkflowAction1] = useState<{
    icon: JSX.Element;
    name: string;
  } | null>(null);
  const [workflowAction2, setWorkflowAction2] = useState<{
    icon: JSX.Element;
    name: string;
  } | null>(null);

  const [draggedItem, setDraggedItem] = useState<{
    type: "trigger" | "action";
    icon: JSX.Element;
    name: string;
  } | null>(null);

  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Ref for drag preview
  const dragPreviewRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Boxes className="w-6 h-6" />,
      title: "Visual Workflow Builder",
      description:
        "Drag-and-drop UI for creating and connecting triggers and actions with an intuitive interface.",
    },
    {
      icon: <Webhook className="w-6 h-6" />,
      title: "Powerful Triggers",
      description:
        "Start workflows with webhooks and easily integrate with external services.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Multiple Actions",
      description:
        "Email, Telegram, Gemini AI, and extensible support for custom integrations.",
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Dynamic Data Mapping",
      description:
        "Use outputs from previous steps as inputs with drag-and-drop data mapping.",
    },
  ];

  const triggers = [
    { icon: <Webhook className="w-8 h-8" />, name: "Webhooks" },
    { icon: <FileText className="w-8 h-8" />, name: "Forms" },
  ];

  const actions = [
    { icon: <Inbox className="w-8 h-8" />, name: "Email" },
    { icon: <Send className="w-8 h-8" />, name: "Telegram" },
    { icon: <Sparkles className="w-8 h-8" />, name: "Gemini AI" },
    { icon: <Mail className="w-8 h-8" />, name: "Gmail" },
    { icon: <Wallet className="w-8 h-8" />, name: "Solana API" },
  ];

  // Drag handlers
  const handleDragStart = (
    e: React.DragEvent,
    item: { icon: JSX.Element; name: string },
    type: "trigger" | "action"
  ) => {
    setDraggedItem({ ...item, type });

    // Use the preview element that's already rendered in the DOM
    if (dragPreviewRef.current) {
      // Small delay to ensure React has updated the DOM with new draggedItem
      setTimeout(() => {
        if (dragPreviewRef.current) {
          e.dataTransfer.setDragImage(dragPreviewRef.current, 60, 40);
        }
      }, 0);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDragOver = (
    e: React.DragEvent,
    target: string,
    expectedType: "trigger" | "action"
  ) => {
    e.preventDefault();
    // Only allow drop if dragged item type matches expected type
    if (draggedItem && draggedItem.type === expectedType) {
      setDropTarget(target);
    }
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (
    e: React.DragEvent,
    target: "trigger" | "action1" | "action2",
    expectedType: "trigger" | "action"
  ) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.type !== expectedType) return;

    if (target === "trigger" && draggedItem.type === "trigger") {
      setWorkflowTrigger({ icon: draggedItem.icon, name: draggedItem.name });
    } else if (
      (target === "action1" || target === "action2") &&
      draggedItem.type === "action"
    ) {
      if (target === "action1") {
        setWorkflowAction1({ icon: draggedItem.icon, name: draggedItem.name });
      } else {
        setWorkflowAction2({ icon: draggedItem.icon, name: draggedItem.name });
      }
    }

    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleReset = () => {
    setWorkflowTrigger(null);
    setWorkflowAction1(null);
    setWorkflowAction2(null);
  };

  const isWorkflowComplete =
    workflowTrigger && workflowAction1 && workflowAction2;

  return (
    <div className="min-h-screen bg-[#262624] text-[#faf9f5] overflow-x-hidden">
      {/* Visible drag preview element - positioned off-screen but rendered */}
      <div
        ref={dragPreviewRef}
        className="bg-[#2c2c29] border-2 border-[#c6613f] rounded-xl p-4 shadow-2xl"
        style={{
          position: "fixed",
          top: "0px",
          left: "-500px",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        {draggedItem && (
          <div className="flex items-center gap-3">
            <div className="text-[#c6613f]">{draggedItem.icon}</div>
            <span className="text-sm font-semibold text-[#faf9f5] whitespace-nowrap">
              {draggedItem.name}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#262624]/80 border-b border-[#4a4945]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#c6613f] rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#faf9f5]" />
            </div>
            <span className="text-2xl font-bold">r8r</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-[#a6a29e] hover:text-[#faf9f5] transition-colors"
            >
              Features
            </a>
            <a
              href="#integrations"
              className="text-[#a6a29e] hover:text-[#faf9f5] transition-colors"
            >
              Integrations
            </a>

            <button
              className="bg-[#c6613f] hover:bg-[#d97153] text-[#faf9f5] px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
              onClick={() => router.push("/dashboard")}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#c6613f]"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: "blur(80px)",
                opacity: 0.15,
                animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className=" text-[#faf9f5]">Automate Everything,</span>
              <br />
              <span className="text-[#faf9f5]">Visually</span>
            </h1>
            <p className="text-xl text-[#a6a29e] mb-10 max-w-2xl mx-auto leading-relaxed">
              r8r is an open-source workflow automation platform inspired by
              n8n. Create, connect, and automate workflows with a visual
              drag-and-drop interface.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                className="group bg-[#c6613f] hover:bg-[#d97153] text-[#faf9f5] px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-[#c6613f]/20"
                onClick={() => router.push("/dashboard")}
              >
                <Play className="w-5 h-5" />
                Start Building
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="bg-[#2c2c29] hover:bg-[#30302e] text-[#faf9f5] px-8 py-4 rounded-lg font-semibold text-lg transition-all border border-[#4a4945] flex items-center gap-2"
                onClick={() => window.open("https://github.com/rahmatdeep/r8r")}
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </button>
            </div>
          </div>

          {/* Floating Cards Animation */}
          <div className="mt-20 relative h-64 max-w-6xl mx-auto">
            {[...triggers, ...actions].map((integration, i) => {
              const positions = [
                { left: "2%", top: "20px" },
                { left: "16%", top: "80px" },
                { left: "28%", top: "10px" },
                { left: "42%", top: "70px" },
                { left: "56%", top: "30px" },
                { left: "70%", top: "90px" },
                { left: "84%", top: "40px" },
              ];
              return (
                <div
                  key={i}
                  className="absolute bg-[#2c2c29] border border-[#4a4945] rounded-xl p-6 shadow-xl"
                  style={{
                    left: positions[i].left,
                    top: positions[i].top,
                    transform: `translateY(${Math.sin(scrollY * 0.01 + i) * 20}px) rotate(${Math.sin(scrollY * 0.01 + i) * 5}deg)`,
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-[#c6613f]">{integration.icon}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#faf9f5]">
                    {integration.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-[#232321]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 text-[#faf9f5]">
              Powerful Features
            </h2>
            <p className="text-xl text-[#a6a29e] max-w-2xl mx-auto">
              Everything you need to build sophisticated automation workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`bg-[#2c2c29] border-2 rounded-2xl p-8 transition-all duration-500 cursor-pointer group hover:scale-105 ${
                  activeFeature === i
                    ? "border-[#c6613f] shadow-xl shadow-[#c6613f]/20"
                    : "border-[#4a4945]"
                }`}
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all ${
                    activeFeature === i
                      ? "bg-[#c6613f] text-[#faf9f5]"
                      : "bg-[#30302e] text-[#c6613f]"
                  }`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#faf9f5]">
                  {feature.title}
                </h3>
                <p className="text-[#a6a29e] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 px-6 bg-[#262624]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 text-[#faf9f5]">
              Try It Yourself
            </h2>
            <p className="text-xl text-[#a6a29e] max-w-2xl mx-auto mb-4">
              Drag triggers and actions to build your workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Triggers */}
            <div className="bg-[#2c2c29] border border-[#4a4945] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#c6613f]/20 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-[#c6613f]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#faf9f5]">
                    Triggers
                  </h3>
                  <p className="text-sm text-[#a6a29e]">Start your workflows</p>
                </div>
              </div>
              <div className="space-y-3">
                {triggers.map((trigger, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={(e) => handleDragStart(e, trigger, "trigger")}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-4 p-4 bg-[#30302e] rounded-xl border border-[#4a4945] hover:border-[#c6613f] transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="text-[#c6613f] group-hover:scale-110 transition-transform">
                      {trigger.icon}
                    </div>
                    <span className="text-[#faf9f5] font-semibold">
                      {trigger.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[#2c2c29] border border-[#4a4945] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#c6613f]/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#c6613f]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#faf9f5]">Actions</h3>
                  <p className="text-sm text-[#a6a29e]">
                    Execute your automations
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {actions.map((action, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={(e) => handleDragStart(e, action, "action")}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-4 p-4 bg-[#30302e] rounded-xl border border-[#4a4945] hover:border-[#c6613f] transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="text-[#c6613f] group-hover:scale-110 transition-transform">
                      {action.icon}
                    </div>
                    <span className="text-[#faf9f5] font-semibold">
                      {action.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Workflow Builder */}
          <div className="mt-6 max-w-5xl mx-auto relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#faf9f5]">
                Your Workflow
              </h3>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-[#30302e] hover:bg-[#3a3a37] border border-[#4a4945] rounded-lg transition-all text-sm text-[#a6a29e] hover:text-[#faf9f5]"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {/* Workflow Steps */}
            <div className="flex items-center justify-center gap-6">
              {/* Trigger Drop Zone */}
              <div
                onDragOver={(e) => handleDragOver(e, "trigger", "trigger")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "trigger", "trigger")}
                className={`bg-[#c6613f]/20 border-2 rounded-xl p-6 text-center transition-all duration-300 min-w-[120px] flex flex-col items-center justify-center ${
                  dropTarget === "trigger"
                    ? "border-[#c6613f] scale-110 shadow-xl shadow-[#c6613f]/30 bg-[#c6613f]/30"
                    : workflowTrigger
                      ? "border-[#c6613f]"
                      : "border-dashed border-[#4a4945]"
                }`}
              >
                {workflowTrigger ? (
                  <>
                    <div className="text-[#c6613f] flex items-center justify-center mb-2">
                      {workflowTrigger.icon}
                    </div>
                    <p className="text-xs font-semibold text-[#faf9f5]">
                      {workflowTrigger.name}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 mb-2 border-2 border-dashed border-[#4a4945] rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-[#4a4945]" />
                    </div>
                    <p className="text-xs font-semibold text-[#4a4945]">
                      Drop Trigger
                    </p>
                  </>
                )}
              </div>

              <ArrowRight
                className={`w-8 h-8 transition-all duration-300 ${
                  workflowTrigger
                    ? "text-[#c6613f] opacity-100"
                    : "text-[#4a4945] opacity-30"
                }`}
              />

              {/* Action 1 Drop Zone */}
              <div
                onDragOver={(e) => handleDragOver(e, "action1", "action")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "action1", "action")}
                className={`bg-[#c6613f]/20 border-2 rounded-xl p-6 text-center transition-all duration-300 min-w-[120px] flex flex-col items-center justify-center ${
                  dropTarget === "action1"
                    ? "border-[#c6613f] scale-110 shadow-xl shadow-[#c6613f]/30 bg-[#c6613f]/30"
                    : workflowAction1
                      ? "border-[#c6613f]"
                      : "border-dashed border-[#4a4945]"
                }`}
              >
                {workflowAction1 ? (
                  <>
                    <div className="text-[#c6613f] flex items-center justify-center mb-2">
                      {workflowAction1.icon}
                    </div>
                    <p className="text-xs font-semibold text-[#faf9f5]">
                      {workflowAction1.name}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 mb-2 border-2 border-dashed border-[#4a4945] rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#4a4945]" />
                    </div>
                    <p className="text-xs font-semibold text-[#4a4945]">
                      Drop Action
                    </p>
                  </>
                )}
              </div>

              <ArrowRight
                className={`w-8 h-8 transition-all duration-300 ${
                  workflowAction1
                    ? "text-[#c6613f] opacity-100"
                    : "text-[#4a4945] opacity-30"
                }`}
              />

              {/* Action 2 Drop Zone */}
              <div
                onDragOver={(e) => handleDragOver(e, "action2", "action")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "action2", "action")}
                className={`bg-[#c6613f]/20 border-2 rounded-xl p-6 text-center transition-all duration-300 min-w-[120px] flex flex-col items-center justify-center ${
                  dropTarget === "action2"
                    ? "border-[#c6613f] scale-110 shadow-xl shadow-[#c6613f]/30 bg-[#c6613f]/30"
                    : workflowAction2
                      ? "border-[#c6613f]"
                      : "border-dashed border-[#4a4945]"
                }`}
              >
                {workflowAction2 ? (
                  <>
                    <div className="text-[#c6613f] flex items-center justify-center mb-2">
                      {workflowAction2.icon}
                    </div>
                    <p className="text-xs font-semibold text-[#faf9f5]">
                      {workflowAction2.name}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 mb-2 border-2 border-dashed border-[#4a4945] rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#4a4945]" />
                    </div>
                    <p className="text-xs font-semibold text-[#4a4945]">
                      Drop Action
                    </p>
                  </>
                )}
              </div>

              <ArrowRight
                className={`w-8 h-8 transition-all duration-300 ${
                  workflowAction2
                    ? "text-[#c6613f] opacity-100"
                    : "text-[#4a4945] opacity-30"
                }`}
              />

              {/* Done State */}
              <div
                className={`rounded-xl p-6 text-center transition-all duration-500 min-w-[120px] flex flex-col items-center justify-center ${
                  isWorkflowComplete
                    ? "bg-[#c6613f] scale-110 shadow-xl shadow-[#c6613f]/50 border-2 border-[#c6613f]"
                    : "bg-[#c6613f]/20 border-2 border-[#4a4945]"
                }`}
              >
                <Sparkles
                  className={`w-8 h-8 mb-2 ${
                    isWorkflowComplete ? "text-[#faf9f5]" : "text-[#4a4945]"
                  }`}
                />
                <p
                  className={`text-sm font-semibold ${
                    isWorkflowComplete ? "text-[#faf9f5]" : "text-[#4a4945]"
                  }`}
                >
                  {isWorkflowComplete ? "Complete!" : "Done"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 bg-[#232321] border-t border-[#4a4945]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <p className="text-[#a6a29e] text-md flex items-center gap-2">
              Made with
              <Heart className="w-4 h-4 text-[#c6613f] fill-[#c6613f]" /> by
              <a
                href="https://github.com/rahmatdeep"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c6613f] hover:text-[#d97153] transition-colors font-semibold"
              >
                @rahmatdeep
              </a>
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}