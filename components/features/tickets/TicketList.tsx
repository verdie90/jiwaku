'use client';

import { useState, useMemo } from 'react';
import { Ticket } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/helpers';
import {
  Search,
  Loader2,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  selectedId?: string;
  onSelect: (ticket: Ticket) => void;
  onCreateNew?: () => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  open: <Circle className="w-3 h-3 text-blue-500" />,
  assigned: <Clock className="w-3 h-3 text-purple-500" />,
  in_progress: <Clock className="w-3 h-3 text-yellow-500" />,
  waiting: <AlertCircle className="w-3 h-3 text-orange-500" />,
  resolved: <CheckCircle2 className="w-3 h-3 text-green-500" />,
  closed: <CheckCircle2 className="w-3 h-3 text-gray-500" />,
};

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

export function TicketList({
  tickets,
  selectedId,
  onSelect,
  onCreateNew,
  isLoading = false,
  searchQuery = '',
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: TicketListProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [localStatus, setLocalStatus] = useState(statusFilter || 'all');

  const filteredTickets = useMemo(() => {
    let result = tickets;

    // Filter by status
    if (localStatus !== 'all') {
      result = result.filter((ticket) => ticket.status === localStatus);
    }

    // Filter by search query
    if (localQuery.trim()) {
      const query = localQuery.toLowerCase();
      result = result.filter((ticket) => {
        const title = ticket.title.toLowerCase();
        const description = ticket.description.toLowerCase();
        const id = ticket.id.toLowerCase();

        return (
          title.includes(query) ||
          description.includes(query) ||
          id.includes(query)
        );
      });
    }

    return result;
  }, [tickets, localQuery, localStatus]);

  const handleSearchChange = (value: string) => {
    setLocalQuery(value);
    onSearchChange?.(value);
  };

  const handleStatusChange = (status: string) => {
    setLocalStatus(status);
    onStatusFilterChange?.(status);
  };

  // Count tickets by status
  const statusCounts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    assigned: tickets.filter((t) => t.status === 'assigned').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    waiting: tickets.filter((t) => t.status === 'waiting').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tickets</h2>
          {onCreateNew && (
            <Button
              size="sm"
              onClick={onCreateNew}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={localQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 flex-wrap text-xs">
          {(
            [
              'all',
              'open',
              'assigned',
              'in_progress',
              'waiting',
              'resolved',
              'closed',
            ] as const
          ).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={localStatus === status ? 'default' : 'outline'}
              onClick={() => handleStatusChange(status)}
              className="text-xs py-0 h-7"
            >
              {status === 'in_progress'
                ? 'In Progress'
                : status.charAt(0).toUpperCase() + status.slice(1)}{' '}
              (
              {statusCounts[status as keyof typeof statusCounts]})
            </Button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground space-y-2">
            <p className="text-sm">No tickets found</p>
            {localQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchChange('')}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => onSelect(ticket)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary',
                  selectedId === ticket.id &&
                    'bg-primary/10 border-l-4 border-primary'
                )}
              >
                <div className="space-y-2">
                  {/* Ticket ID and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        #{ticket.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {STATUS_ICONS[ticket.status]}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs capitalize',
                        STATUS_COLORS[ticket.status]
                      )}
                    >
                      {ticket.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs capitalize',
                        PRIORITY_COLORS[ticket.priority]
                      )}
                    >
                      {ticket.priority}
                    </Badge>
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {ticket.description}
                  </p>

                  {/* Footer info */}
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      Created {formatDate(ticket.createdAt)}
                    </span>
                    {ticket.sla?.respondedAt && (
                      <span className="text-green-600">
                        Responded
                      </span>
                    )}
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
