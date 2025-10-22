'use client';

import { useState, useMemo } from 'react';
import { Conversation } from '@/types';
import { ChannelType } from '@/config/constants';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/helpers';
import {
  MessageSquare,
  Mail,
  Phone,
  MessageCircle,
  Search,
  Loader2,
} from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const CHANNEL_ICONS: Record<ChannelType, React.ReactNode> = {
  whatsapp: <MessageCircle className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  web_chat: <MessageSquare className="w-4 h-4" />,
  sms: <MessageCircle className="w-4 h-4" />,
};

const CHANNEL_COLORS: Record<ChannelType, string> = {
  whatsapp: 'bg-green-100 text-green-800',
  email: 'bg-blue-100 text-blue-800',
  phone: 'bg-purple-100 text-purple-800',
  web_chat: 'bg-indigo-100 text-indigo-800',
  sms: 'bg-yellow-100 text-yellow-800',
};

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading = false,
  searchQuery = '',
  onSearchChange,
}: ConversationListProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const filteredConversations = useMemo(() => {
    if (!localQuery.trim()) return conversations;

    const query = localQuery.toLowerCase();
    return conversations.filter((conv) => {
      // Search by conversation ID (as fallback)
      return conv.id?.toLowerCase().includes(query);
    });
  }, [conversations, localQuery]);

  const handleSearchChange = (value: string) => {
    setLocalQuery(value);
    onSearchChange?.(value);
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Conversations</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={localQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary',
                  selectedId === conversation.id &&
                    'bg-primary/10 border-l-4 border-primary'
                )}
              >
                <div className="space-y-2">
                  {/* Header with name and badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        Contact {conversation.contactId}
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs flex items-center gap-1',
                        CHANNEL_COLORS[conversation.channel]
                      )}
                    >
                      {CHANNEL_ICONS[conversation.channel]}
                      <span className="capitalize">{conversation.channel}</span>
                    </Badge>
                  </div>

                  {/* Last message preview */}
                  {conversation.lastMessage && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {conversation.lastMessage.content}
                    </p>
                  )}

                  {/* Timestamp and unread count */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(conversation.updatedAt)}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-1">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        conversation.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      )}
                    />
                    <span className="text-xs text-muted-foreground">
                      {conversation.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
