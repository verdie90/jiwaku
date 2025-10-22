'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { Contact, Conversation } from '@/types';
import { ChannelType, MessageStatus } from '@/config/constants';
import { ContactList, ContactDetail, ContactForm } from '@/components/features/contacts';
import { cn } from '@/lib/utils/helpers';

type ViewMode = 'list' | 'detail' | 'form';

// Mock conversations data (in production, fetch from API)
const MOCK_CONVERSATIONS: Record<string, Conversation[]> = {
  'contact-1': [
    {
      id: 'conv-1',
      teamId: 'team-1',
      contactId: 'contact-1',
      channel: ChannelType.WHATSAPP,
      participants: ['agent-1'],
      status: 'active',
      lastMessage: {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'contact-1',
        senderType: 'contact',
        content: 'Hi, I have a question about your product',
        contentType: 'text',
        status: MessageStatus.READ,
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000),
      },
      lastMessageAt: new Date(Date.now() - 3600000),
      messageCount: 5,
      unreadCount: 0,
      tags: [],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 3600000),
    },
  ],
};

// Mock contacts (in production, fetch from API)
const MOCK_CONTACTS: Contact[] = [
  {
    id: 'contact-1',
    teamId: 'team-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 000-0001',
    channels: [
      {
        type: ChannelType.WHATSAPP,
        handle: '+1 (555) 000-0001',
        verified: true,
      },
      {
        type: ChannelType.EMAIL,
        handle: 'john@example.com',
        verified: true,
      },
    ],
    company: 'Tech Corp',
    jobTitle: 'Product Manager',
    conversationCount: 5,
    lastContactedAt: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 604800000),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'contact-2',
    teamId: 'team-1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 000-0002',
    channels: [
      {
        type: ChannelType.EMAIL,
        handle: 'jane@example.com',
        verified: true,
      },
    ],
    company: 'Design Studio',
    jobTitle: 'Designer',
    conversationCount: 3,
    lastContactedAt: new Date(Date.now() - 172800000),
    createdAt: new Date(Date.now() - 1209600000),
    updatedAt: new Date(Date.now() - 172800000),
  },
];

export default function ContactsPage() {
  const { user } = useAuth();
  const { contacts, isLoading, createContact, updateContact, deleteContact } =
    useContacts(user?.teamId);

  // Use mock data if real data isn't available
  const displayContacts = contacts.length > 0 ? contacts : MOCK_CONTACTS;

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to access contacts</p>
      </div>
    );
  }

  // Handle create new contact
  const handleCreateNew = () => {
    setEditingContact(null);
    setViewMode('form');
  };

  // Handle select contact
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setViewMode('detail');
  };

  // Handle edit contact
  const handleEditContact = () => {
    if (selectedContact) {
      setEditingContact(selectedContact);
      setViewMode('form');
    }
  };

  // Handle delete contact
  const handleDeleteContact = async () => {
    if (selectedContact && confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(selectedContact.id);
      setSelectedContact(null);
      setViewMode('list');
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    if (editingContact) {
      await updateContact({
        id: editingContact.id,
        data,
      });
    } else {
      await createContact(data);
    }
    setViewMode('list');
  };

  // Responsive breakpoints
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="flex h-screen bg-background">
      {/* Contacts List Sidebar */}
      <div
        className={cn(
          'border-r transition-all',
          isMobile && viewMode !== 'list' ? 'hidden' : 'w-full md:w-1/3'
        )}
      >
        <ContactList
          contacts={displayContacts}
          selectedId={selectedContact?.id}
          onSelect={handleSelectContact}
          onCreateNew={handleCreateNew}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 transition-all',
          isMobile && viewMode === 'list' ? 'hidden' : 'block'
        )}
      >
        {viewMode === 'detail' && selectedContact ? (
          <ContactDetail
            contact={selectedContact}
            conversations={MOCK_CONVERSATIONS[selectedContact.id] || []}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onBack={() => setViewMode('list')}
            onSelectConversation={(conversation) => {
              // Navigate to conversation view if needed
              console.log('Selected conversation:', conversation);
            }}
          />
        ) : viewMode === 'form' ? (
          <ContactForm
            contact={editingContact || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setViewMode('list')}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a contact to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
