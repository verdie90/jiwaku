'use client';

import { useRef, useEffect } from 'react';
import { Message } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/helpers';
import {
  Check,
  CheckCheck,
  AlertCircle,
  Loader2,
  Download,
} from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  sending: <Loader2 className="w-3 h-3 animate-spin" />,
  sent: <Check className="w-3 h-3" />,
  delivered: <CheckCheck className="w-3 h-3" />,
  read: <CheckCheck className="w-3 h-3 text-blue-500" />,
  failed: <AlertCircle className="w-3 h-3 text-red-500" />,
};

export function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle load more when scrolling to top
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollTop === 0 && hasMore && !isLoading) {
      onLoadMore?.();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-background p-4 space-y-4"
    >
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className={cn(
              'px-3 py-1 text-xs rounded-full transition-colors',
              'bg-secondary text-secondary-foreground hover:bg-secondary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p className="text-sm">No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const isCurrentUser = message.senderType === 'user' && message.senderId === currentUserId;
          const showTimestamp =
            index === 0 ||
            new Date(messages[index - 1].createdAt).getTime() -
              new Date(message.createdAt).getTime() >
              5 * 60 * 1000; // 5 minutes

          return (
            <div key={message.id}>
              {/* Timestamp */}
              {showTimestamp && (
                <div className="flex justify-center py-2">
                  <span className="text-xs text-muted-foreground px-2 py-1 bg-accent rounded-full">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={cn(
                  'flex gap-3',
                  isCurrentUser && 'flex-row-reverse'
                )}
              >
                {/* Message Content */}
                <div
                  className={cn(
                    'flex-1 max-w-xs lg:max-w-md',
                    'rounded-lg p-3',
                    'transition-colors',
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-accent-foreground'
                  )}
                >
                  {/* Replied Message */}
                  {message.replyTo && (
                    <div className={cn(
                      'text-xs mb-2 pl-2 border-l-2',
                      isCurrentUser
                        ? 'border-primary-foreground opacity-75'
                        : 'border-accent-foreground opacity-75'
                    )}>
                      <p className="font-semibold">Replied to message</p>
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'flex items-center gap-2 p-2 rounded',
                            'text-xs hover:opacity-80 transition-opacity',
                            isCurrentUser
                              ? 'bg-primary-foreground/20'
                              : 'bg-accent-foreground/20'
                          )}
                        >
                          <Download className="w-3 h-3" />
                          <span className="truncate">{attachment.name}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Status and Time */}
                  <div
                    className={cn(
                      'flex items-center justify-end gap-1 mt-1',
                      'text-xs opacity-75'
                    )}
                  >
                    <span>
                      {formatDate(message.createdAt)}
                    </span>
                    {isCurrentUser && STATUS_ICONS[message.status]}
                  </div>

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {message.reactions.map((reaction) => (
                        <Badge
                          key={`${reaction.userId}-${reaction.emoji}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {reaction.emoji}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
