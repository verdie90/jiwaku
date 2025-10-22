'use client';

import { useState, useEffect } from 'react';
import { Conversation, Message } from '@/types';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/helpers';
import {
  ChevronLeft,
  Phone,
  Video,
  Info,
  MoreVertical,
  Search,
} from 'lucide-react';

interface ChatWindowProps {
  conversations: Conversation[];
  messages: Message[];
  currentUserId: string;
  selectedConversation?: Conversation;
  onSelectConversation: (conversation: Conversation) => void;
  onSendMessage: (conversationId: string, message: string, attachments?: File[]) => Promise<void>;
  isLoadingConversations?: boolean;
  isLoadingMessages?: boolean;
  hasMoreMessages?: boolean;
  onLoadMoreMessages?: () => void;
  onBack?: () => void;
}

export function ChatWindow({
  conversations,
  messages,
  currentUserId,
  selectedConversation,
  onSelectConversation,
  onSendMessage,
  isLoadingConversations = false,
  isLoadingMessages = false,
  hasMoreMessages = false,
  onLoadMoreMessages,
  onBack,
}: ChatWindowProps) {
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationDetails, setShowConversationDetails] = useState(false);

  // Handle responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendMessage = async (message: string, attachments?: File[]) => {
    if (!selectedConversation) return;
    await onSendMessage(selectedConversation.id, message, attachments);
  };

  return (
    <div className="flex h-full w-full gap-0 md:gap-4">
      {/* Conversations Sidebar */}
      <div
        className={cn(
          'w-full md:w-80 lg:w-96',
          'border-r md:border-r md:rounded-lg md:border',
          isMobileView && selectedConversation && 'hidden'
        )}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id}
          onSelect={onSelectConversation}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          'flex-1',
          'border md:border-0 md:rounded-lg md:overflow-hidden',
          'flex flex-col h-full',
          isMobileView && !selectedConversation && 'hidden'
        )}
      >
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="border-b bg-background p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Back button for mobile */}
                {isMobileView && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="md:hidden"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                )}

                <div className="flex-1">
                  <h2 className="font-semibold">
                    Contact {selectedConversation.contactId}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.participants.length} participants
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" title="Voice call">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Video call">
                  <Video className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setShowConversationDetails(!showConversationDetails)
                  }
                  title="Conversation info"
                >
                  <Info className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" title="More options">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              isLoading={isLoadingMessages}
              hasMore={hasMoreMessages}
              onLoadMore={onLoadMoreMessages}
            />

            {/* Message Composer */}
            <MessageComposer
              onSendMessage={handleSendMessage}
              isLoading={isLoadingMessages}
              placeholder="Type your message..."
            />
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center bg-muted/30">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  No conversation selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a conversation to start messaging
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Details Sidebar */}
      {showConversationDetails && selectedConversation && (
        <div className="hidden lg:block w-80 border-l bg-muted/30 p-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Conversation Info</h3>
            <p className="text-xs text-muted-foreground">
              Contact ID: {selectedConversation.contactId}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Channel</h3>
            <Badge variant="outline" className="capitalize">
              {selectedConversation.channel}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Status</h3>
            <Badge
              className={
                selectedConversation.status === 'active'
                  ? 'bg-green-600'
                  : 'bg-gray-600'
              }
            >
              {selectedConversation.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Messages</h3>
            <p className="text-sm text-muted-foreground">
              {selectedConversation.messageCount} messages
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Assigned Agent</h3>
            <p className="text-sm text-muted-foreground">
              {selectedConversation.assignedAgentId || 'Unassigned'}
            </p>
          </div>

          {selectedConversation.tags && selectedConversation.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {selectedConversation.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
