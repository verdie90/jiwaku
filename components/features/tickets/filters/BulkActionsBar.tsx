'use client';

import { useState } from 'react';
import { TicketStatus, TicketPriority } from '@/config/constants';
import {
  X,
  ChevronDown,
  Trash2,
  Check,
  AlertCircle,
  Tag,
  User,
  Flag,
} from 'lucide-react';

interface BulkActionsBarProps {
  isVisible: boolean;
  selectionCount: number;
  isLoading?: boolean;
  error?: string | null;
  successMessage?: string | null;
  onClose: () => void;
  onStatusChange: (status: TicketStatus) => Promise<void>;
  onPriorityChange: (priority: TicketPriority) => Promise<void>;
  onAssign: (agentId: string) => Promise<void>;
  onUnassign: () => Promise<void>;
  onAddTags: (tags: string[]) => Promise<void>; // Future: Tag management
  onRemoveTags: (tags: string[]) => Promise<void>; // Future: Tag management
  onDelete: () => Promise<void>;
  availableAgents?: Array<{ id: string; name: string }>;
  availableTags?: string[];
  clearMessages?: () => void;
}

export function BulkActionsBar({
  isVisible,
  selectionCount,
  isLoading,
  error,
  successMessage,
  onClose,
  onStatusChange,
  onPriorityChange,
  onAssign,
  onUnassign,
  onDelete,
  availableAgents = [],
  availableTags = [],
  clearMessages,
}: BulkActionsBarProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  if (!isVisible) return null;

  const handleStatusChange = async (status: TicketStatus) => {
    await onStatusChange(status);
    setShowStatusMenu(false);
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    await onPriorityChange(priority);
    setShowPriorityMenu(false);
  };

  const handleAssign = async (agentId: string) => {
    await onAssign(agentId);
    setShowAssignMenu(false);
  };

  const handleDelete = async () => {
    if (deleteConfirmed) {
      await onDelete();
      setDeleteConfirmed(false);
    } else {
      setDeleteConfirmed(true);
      setTimeout(() => setDeleteConfirmed(false), 3000);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      {/* Error Alert */}
      {error && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={() => clearMessages?.()}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="px-6 py-2 bg-green-50 border-b border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-4 h-4" />
            <span className="text-sm">{successMessage}</span>
          </div>
          <button
            onClick={() => clearMessages?.()}
            className="text-green-500 hover:text-green-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {/* Left: Selection Info */}
        <div className="flex items-center gap-3 flex-1">
          <div className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg font-medium text-sm">
            {selectionCount} selected
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Clear
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status */}
          <div className="relative group">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              Status
              <ChevronDown className="w-3 h-3" />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {Object.values(TicketStatus).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 disabled:opacity-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="relative group">
            <button
              onClick={() => setShowPriorityMenu(!showPriorityMenu)}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm font-medium"
            >
              <Flag className="w-4 h-4" />
              Priority
              <ChevronDown className="w-3 h-3" />
            </button>
            {showPriorityMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {Object.values(TicketPriority).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityChange(priority)}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 disabled:opacity-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {priority}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assign */}
          {availableAgents.length > 0 && (
            <div className="relative group">
              <button
                onClick={() => setShowAssignMenu(!showAssignMenu)}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm font-medium"
              >
                <User className="w-4 h-4" />
                Assign
                <ChevronDown className="w-3 h-3" />
              </button>
              {showAssignMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  <button
                    onClick={onUnassign}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 disabled:opacity-50 border-b border-gray-100 text-red-600"
                  >
                    Unassign
                  </button>
                  {availableAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleAssign(agent.id)}
                      disabled={isLoading}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 disabled:opacity-50"
                    >
                      {agent.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="relative group">
              <button
                onClick={() => setShowTagsMenu(!showTagsMenu)}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm font-medium"
              >
                <Tag className="w-4 h-4" />
                Tags
                <ChevronDown className="w-3 h-3" />
              </button>
              {showTagsMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 space-y-2 max-h-64 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        disabled={isLoading}
                        className="w-4 h-4 rounded"
                      />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition disabled:opacity-50 text-sm font-medium ${
              deleteConfirmed
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {deleteConfirmed ? 'Confirm' : 'Delete'}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
