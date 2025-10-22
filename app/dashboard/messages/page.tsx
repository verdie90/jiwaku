'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatWindow } from '@/components/features/messaging';
import { useMessages } from '@/hooks/useMessaging';
import { Conversation } from '@/types';
import { ChannelType } from '@/config/constants';
import { Loader2 } from 'lucide-react';

/**
 * Messaging Dashboard Page
 */
export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation>();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Mock conversations data - replace with actual data fetching
  useEffect(() => {
    // Mock conversations for demo
    const mockConversations: Conversation[] = [
      {
        id: 'conv-1',
        teamId: user?.teamId || '',
        contactId: 'contact-1',
        channel: ChannelType.WHATSAPP,
        participants: [user?.id || ''],
        status: 'active',
        messageCount: 5,
        unreadCount: 2,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'conv-2',
        teamId: user?.teamId || '',
        contactId: 'contact-2',
        channel: ChannelType.EMAIL,
        participants: [user?.id || ''],
        status: 'active',
        messageCount: 12,
        unreadCount: 0,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    setConversations(mockConversations);
  }, [user]);

  // Use messaging hooks
  const { messages, isLoading: isLoadingMessages, sendMessage } = useMessages(
    selectedConversation?.id
  );

  const handleSendMessage = async (
    _conversationId: string,
    message: string,
    attachments?: File[]
  ) => {
    try {
      await sendMessage(message, user?.id || '', 'user', attachments?.map(f => ({
        id: `attach-${Date.now()}`,
        url: URL.createObjectURL(f),
        type: f.type,
        name: f.name,
        size: f.size,
        uploadedAt: new Date(),
      })));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ChatWindow
        conversations={conversations}
        messages={messages}
        currentUserId={user.id}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        onSendMessage={handleSendMessage}
        isLoadingMessages={isLoadingMessages}
      />
    </div>
  );
}
