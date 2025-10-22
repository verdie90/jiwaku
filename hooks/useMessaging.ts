'use client';

import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message, Conversation, MessageAttachment } from '@/types';
import { messageService } from '@/services/message.service';
import { useAppStore } from '@/store/app.store';

/**
 * Hook for managing messages in a conversation
 */
export function useMessages(conversationId?: string) {
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();
  const [pageSize] = useState(20);

  // Fetch messages
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const result = await messageService.getMessages(conversationId, pageSize);
      return result.data;
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      content,
      senderId,
      senderType,
      attachments,
    }: {
      content: string;
      senderId: string;
      senderType: 'user' | 'contact';
      attachments?: MessageAttachment[];
    }) => {
      if (!conversationId) throw new Error('No conversation selected');
      return await messageService.sendMessage(
        conversationId,
        senderId,
        senderType,
        content,
        'text',
        attachments
      );
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: Message[] | undefined) => [...(old || []), newMessage]
      );

      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Message sent',
        message: 'Your message has been sent',
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Failed to send',
        message: 'Could not send your message. Please try again.',
        duration: 5000,
      });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await messageService.deleteMessage(messageId);
    },
    onSuccess: (_, messageId) => {
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: Message[] | undefined) =>
          (old || []).filter((msg) => msg.id !== messageId)
      );
    },
  });

  // Update message status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      messageId,
      status,
    }: {
      messageId: string;
      status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
    }) => {
      return await messageService.updateMessageStatus(messageId, status);
    },
  });

  const sendMessage = useCallback(
    async (
      content: string,
      senderId: string,
      senderType: 'user' | 'contact',
      attachments?: MessageAttachment[]
    ) => {
      return sendMessageMutation.mutateAsync({
        content,
        senderId,
        senderType,
        attachments,
      });
    },
    [sendMessageMutation]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      return deleteMessageMutation.mutateAsync(messageId);
    },
    [deleteMessageMutation]
  );

  const updateStatus = useCallback(
    async (
      messageId: string,
      status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
    ) => {
      return updateStatusMutation.mutateAsync({ messageId, status });
    },
    [updateStatusMutation]
  );

  return {
    messages: messagesData || [],
    isLoading,
    isSending: sendMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
    sendMessage,
    deleteMessage,
    updateStatus,
  };
}

/**
 * Hook for managing conversations
 */
export function useConversations(teamId?: string) {
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      return [];
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    conversations,
    isLoading,
    refetch: () =>
      queryClient.invalidateQueries({
        queryKey: ['conversations', teamId],
      }),
  };
}

/**
 * Hook for conversation search
 */
export function useConversationSearch(
  query: string,
  conversations: Conversation[]
) {
  if (!query.trim()) {
    return conversations;
  }

  const lowerQuery = query.toLowerCase();
  return conversations.filter((conv) => {
    return conv.id?.toLowerCase().includes(lowerQuery);
  });
}
