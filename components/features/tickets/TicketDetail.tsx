'use client';

import { Ticket, TicketComment } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/helpers';
import {
  ArrowLeft,
  Trash2,
  Edit2,
  MessageSquare,
  Clock,
  AlertCircle,
  User,
  Tag,
  FileText,
} from 'lucide-react';
import { useState } from 'react';

interface TicketDetailProps {
  ticket: Ticket;
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  onAddComment?: (content: string, isInternal: boolean) => void;
  isSubmitting?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  waiting: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export function TicketDetail({
  ticket,
  onEdit,
  onDelete,
  onBack,
  onAddComment,
  isSubmitting = false,
}: TicketDetailProps) {
  const [commentContent, setCommentContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const handleAddComment = () => {
    if (commentContent.trim() && onAddComment) {
      onAddComment(commentContent, isInternal);
      setCommentContent('');
      setIsInternal(false);
    }
  };

  const formatStatusLabel = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <h1 className="text-xl font-semibold">{ticket.title}</h1>
            </div>
            <p className="text-sm text-muted-foreground">#{ticket.id}</p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn('text-sm capitalize', STATUS_COLORS[ticket.status])}
          >
            {formatStatusLabel(ticket.status)}
          </Badge>
          <Badge
            variant="outline"
            className={cn('text-sm capitalize', PRIORITY_COLORS[ticket.priority])}
          >
            {ticket.priority}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 p-4">
          {/* Left Column - Main Info */}
          <div className="col-span-2 space-y-4">
            {/* Description */}
            <div className="bg-card border rounded-lg p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </h2>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Comments Section */}
            <div className="bg-card border rounded-lg p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments
                {ticket.comments && ticket.comments.length > 0 && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                    {ticket.comments.length}
                  </span>
                )}
              </h2>

              {/* Comments List */}
              <div className="space-y-3 mb-4">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comment: TicketComment) => (
                    <div
                      key={comment.id}
                      className={cn(
                        'p-3 rounded-lg border',
                        comment.isInternal ? 'bg-amber-50 border-amber-200' : 'bg-muted'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">User #{comment.authorId}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                        {comment.isInternal && (
                          <Badge variant="outline" className="text-xs">
                            Internal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet
                  </p>
                )}
              </div>

              {/* Add Comment */}
              {onAddComment && (
                <div className="space-y-2 border-t pt-4">
                  <textarea
                    placeholder="Add a comment..."
                    value={commentContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setCommentContent(e.target.value)
                    }
                    className="w-full min-h-20 p-2 rounded-lg border bg-background text-sm"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setIsInternal(e.target.checked)
                        }
                        className="rounded"
                      />
                      Internal comment
                    </label>
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!commentContent.trim() || isSubmitting}
                    >
                      {isSubmitting ? 'Adding...' : 'Add Comment'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-3">
            {/* Status Timeline */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(ticket.createdAt)}</p>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <p className="text-muted-foreground">Resolved</p>
                    <p className="font-medium">{formatDate(ticket.resolvedAt)}</p>
                  </div>
                )}
                {ticket.closedAt && (
                  <div>
                    <p className="text-muted-foreground">Closed</p>
                    <p className="font-medium">{formatDate(ticket.closedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* SLA Info */}
            {ticket.sla && (
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  SLA
                </h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Response Time</p>
                    <p className="font-medium">{ticket.sla.responseTime} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Resolution Time</p>
                    <p className="font-medium">{ticket.sla.resolutionTime} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        ticket.sla.status === 'within'
                          ? 'bg-green-100 text-green-800'
                          : ticket.sla.status === 'at_risk'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      )}
                    >
                      {ticket.sla.status === 'within'
                        ? 'Within SLA'
                        : ticket.sla.status === 'at_risk'
                          ? 'At Risk'
                          : 'Breached'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {ticket.tags && ticket.tags.length > 0 && (
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {ticket.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
