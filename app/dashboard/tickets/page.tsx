'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTickets } from '@/hooks/useTickets';
import {
  TicketList,
  TicketDetail,
  TicketForm,
} from '@/components/features/tickets';
import { Ticket } from '@/types';
import { TicketStatus, TicketPriority, SLAStatus } from '@/config/constants';

type ViewMode = 'list' | 'detail' | 'form';

/**
 * Mock tickets for demo/testing
 * These are used when Firestore data is unavailable
 */
const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TKT-001',
    teamId: 'team-1',
    contactId: 'contact-1',
    title: 'Login page not loading',
    description:
      'Users are unable to load the login page on the website. Seeing blank screen.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    tags: ['website', 'critical'],
    categories: ['Technical'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    comments: [
      {
        id: 'comment-1',
        ticketId: 'TKT-001',
        authorId: 'user-1',
        content: 'Investigating the DNS issues',
        isInternal: false,
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-15T10:30:00'),
      },
    ],
    sla: {
      responseTime: 60,
      resolutionTime: 240,
      respondedAt: new Date('2024-01-15T09:15:00'),
      status: SLAStatus.WITHIN,
    },
  },
  {
    id: 'TKT-002',
    teamId: 'team-1',
    contactId: 'contact-2',
    title: 'Payment processing delays',
    description:
      'Customers experiencing delayed payment confirmations. Typically takes 5 minutes instead of 30 seconds.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.URGENT,
    assignedAgentId: 'agent-1',
    tags: ['payments', 'urgent'],
    categories: ['Performance'],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15T08:00:00'),
    resolvedAt: undefined,
    comments: [
      {
        id: 'comment-2',
        ticketId: 'TKT-002',
        authorId: 'user-2',
        content:
          'Identified database query bottleneck in payment service. Working on optimization.',
        isInternal: true,
        createdAt: new Date('2024-01-15T08:00:00'),
        updatedAt: new Date('2024-01-15T08:00:00'),
      },
    ],
    sla: {
      responseTime: 15,
      resolutionTime: 120,
      respondedAt: new Date('2024-01-14T16:45:00'),
      status: SLAStatus.WITHIN,
    },
  },
];

export default function TicketsPage() {
  const { user } = useAuth();
  const teamId = 'team-1'; // In production: Get from auth context or URL params
  const { 
    tickets, 
    isLoading, 
    error,
    createTicket, 
    updateTicket, 
    deleteTicket 
  } = useTickets(teamId);
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  /**
   * Use real Firestore data if available, fallback to mock data
   * In production, always use Firestore data
   */
  const displayTickets = tickets.length > 0 ? tickets : MOCK_TICKETS;

  const selectedTicket = selectedTicketId
    ? displayTickets.find((t) => t.id === selectedTicketId)
    : undefined;

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
    setViewMode('detail');
  };

  const handleCreateNew = () => {
    setSelectedTicketId(undefined);
    setViewMode('form');
  };

  const handleFormSubmit = async (data: Partial<Ticket>) => {
    try {
      if (selectedTicketId) {
        // Update existing ticket
        await updateTicket(selectedTicketId, data);
      } else {
        // Create new ticket
        if (!user) {
          console.error('User not authenticated');
          return;
        }
        
        // For contact ID, in production this would come from selected contact
        const contactId = 'contact-1';
        
        await createTicket(contactId, {
          title: data.title || '',
          description: data.description || '',
          priority: data.priority || TicketPriority.MEDIUM,
          status: data.status || TicketStatus.OPEN,
          tags: data.tags,
          categories: data.categories,
        });
      }
      setViewMode('list');
    } catch (error) {
      console.error('Error saving ticket:', error);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicketId) return;
    try {
      await deleteTicket(selectedTicketId);
      setViewMode('list');
      setSelectedTicketId(undefined);
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const handleAddComment = async (content: string, isInternal: boolean) => {
    // This would use useTicket hook in a real component
    console.log('Adding comment:', { content, isInternal });
  };

  // Show loading state while fetching from Firestore
  if (isLoading && tickets.length === 0) {
    return (
      <div className="grid grid-cols-4 gap-4 h-screen bg-background">
        <div className="col-span-1 border-r p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </div>
        <div className="col-span-3 flex items-center justify-center text-muted-foreground">
          <p>Loading tickets from Firestore...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error and no data
  if (error && tickets.length === 0) {
    return (
      <div className="grid grid-cols-4 gap-4 h-screen bg-background">
        <div className="col-span-1 border-r"></div>
        <div className="col-span-3 flex items-center justify-center text-destructive">
          <div className="text-center">
            <p className="font-semibold">Error Loading Tickets</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            <p className="text-xs text-muted-foreground mt-4">Using mock data for demo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 h-screen bg-background">
      {/* List View */}
      <div className="col-span-1 border-r">
        <TicketList
          tickets={displayTickets}
          selectedId={selectedTicketId}
          onSelect={handleSelectTicket}
          onCreateNew={handleCreateNew}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      {/* Detail or Form View */}
      <div className="col-span-3">
        {viewMode === 'list' ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Select a ticket to view details</p>
          </div>
        ) : viewMode === 'detail' && selectedTicket ? (
          <TicketDetail
            ticket={selectedTicket}
            onEdit={() => setViewMode('form')}
            onDelete={handleDeleteTicket}
            onBack={() => {
              setViewMode('list');
              setSelectedTicketId(undefined);
            }}
            onAddComment={handleAddComment}
          />
        ) : viewMode === 'form' ? (
          <TicketForm
            ticket={selectedTicket}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setViewMode(selectedTicket ? 'detail' : 'list');
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
