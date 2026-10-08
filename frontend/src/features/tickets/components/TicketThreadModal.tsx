"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  User,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAddTicketMessageMutation } from "@/redux/services/ticketApi";
import { Ticket, TicketStatus } from "../types/ticket.types";
import { formatDate } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";

interface TicketThreadModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketThreadModal: React.FC<TicketThreadModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [addMessage, { isLoading: isSending }] = useAddTicketMessageMutation();
  const [replyText, setReplyText] = useState<string>("");

  if (!ticket) return null;

  const conversations =
    ticket.conversations || ticket.messages || [];

  const requester =
    typeof ticket.employeeId === "object" && ticket.employeeId
      ? ticket.employeeId
      : typeof ticket.raisedBy === "object" && ticket.raisedBy
      ? ticket.raisedBy
      : null;

  const requesterName = requester
    ? `${requester.firstName} ${requester.lastName}`
    : "Requester";

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error("Please enter a reply message before sending.");
      return;
    }

    try {
      await addMessage({
        id: ticket._id,
        body: { message: replyText.trim() },
      }).unwrap();

      toast.success("Reply added to ticket thread successfully!");
      setReplyText("");
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to post message.";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Helpdesk Thread: ${ticket.ticketId}`}
      description={ticket.subject}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Ticket Metadata Bar */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Raised By:</span>
            <strong className="text-slate-900 dark:text-white">
              {requesterName}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Category:</span>
            <Badge variant="info">{ticket.category.replace(/_/g, " ")}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Status:</span>
            <Badge
              variant={
                ticket.status === "RESOLVED"
                  ? "success"
                  : ticket.status === "IN_PROGRESS"
                  ? "info"
                  : ticket.status === "CLOSED"
                  ? "neutral"
                  : "warning"
              }
            >
              {ticket.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        {/* Resolution Notes Banner (if resolved) */}
        {ticket.resolutionNotes && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs">
            <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Official Resolution Remarks
            </span>
            <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
              {ticket.resolutionNotes}
            </p>
          </div>
        )}

        {/* Conversation Timeline */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50 max-h-80 overflow-y-auto space-y-3">
          {conversations.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              <MessageSquare className="w-6 h-6 mx-auto mb-1 text-slate-300 dark:text-slate-700" />
              <span>No replies on this ticket yet.</span>
            </div>
          ) : (
            conversations.map((msg, idx) => {
              const isUser =
                typeof msg.senderId === "object"
                  ? msg.senderId?._id === currentUser?.id
                  : false;

              const senderRole =
                typeof msg.senderId === "object" ? msg.senderId?.role : "";

              return (
                <div
                  key={msg._id || idx}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {isUser ? "You" : requesterName}
                    </span>
                    {senderRole && (
                      <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-slate-200 dark:bg-slate-800">
                        {senderRole}
                      </span>
                    )}
                    <span>• {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Box (disabled if CLOSED) */}
        {ticket.status !== "CLOSED" ? (
          <form onSubmit={handleSendReply} className="space-y-2">
            <div className="relative">
              <textarea
                rows={3}
                placeholder="Type your response to this support thread..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none pr-10"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Shift + Enter for new line
              </span>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={isSending}
                disabled={!replyText.trim()}
                leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              >
                Send Reply
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-center text-xs text-slate-500">
            This ticket is officially <strong>CLOSED</strong>. No further
            replies can be posted.
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
