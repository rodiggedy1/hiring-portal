/**
 * AgentDashboard stubs — only the exports needed by HiringPipeline.tsx.
 */
import React from "react";
import { X, MessageSquare } from "lucide-react";

export type Session = {
  id: number;
  leadPhone: string;
  leadName: string | null;
  stage: string;
  quotedPrice: string | null;
  serviceType: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  extras: string | null;
  selectedSlot: string | null;
  address: string | null;
  messageHistory: string;
  assignedAgentId: number | null;
  assignedAgentName: string | null;
  lastCalledAt: Date | string | null;
  lastCalledByAgentName?: string | null;
  isBooked?: number;
  bookedAt?: Date | string | null;
  bookedByAgentName?: string | null;
  bookedAmount?: string | number | null;
  internalNotes?: string | null;
  aiMode?: number;
  barkQA?: string | null;
  leadSource?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export function ConversationDrawer({
  session,
  onClose,
}: {
  session: Session;
  onClose: () => void;
  currentAgentId?: number;
  currentAgentName?: string;
}) {
  let messages: { role: string; content: string; ts?: number }[] = [];
  try { messages = JSON.parse(session.messageHistory || "[]"); } catch { messages = []; }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <span className="font-semibold text-gray-900 text-sm">
            {session.leadName || session.leadPhone}
          </span>
          <span className="text-xs text-gray-400">{session.leadPhone}</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-8">No messages yet.</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${msg.role === "user" ? "bg-gray-100 text-gray-900" : "bg-blue-600 text-white"}`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  return <div className="p-8 text-gray-500">Agent Dashboard</div>;
}
