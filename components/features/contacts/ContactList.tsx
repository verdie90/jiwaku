'use client';

import { useState, useMemo } from 'react';
import { Contact } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/helpers';
import {
  Search,
  Loader2,
  Plus,
  Building2,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  selectedId?: string;
  onSelect: (contact: Contact) => void;
  onCreateNew?: () => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function ContactList({
  contacts,
  selectedId,
  onSelect,
  onCreateNew,
  isLoading = false,
  searchQuery = '',
  onSearchChange,
}: ContactListProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const filteredContacts = useMemo(() => {
    if (!localQuery.trim()) return contacts;

    const query = localQuery.toLowerCase();
    return contacts.filter((contact) => {
      const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
      const email = contact.email.toLowerCase();
      const phone = contact.phone.toLowerCase();
      const company = (contact.company || '').toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        company.includes(query)
      );
    });
  }, [contacts, localQuery]);

  const handleSearchChange = (value: string) => {
    setLocalQuery(value);
    onSearchChange?.(value);
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Contacts</h2>
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={localQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground space-y-2">
            <p className="text-sm">No contacts found</p>
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
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onSelect(contact)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary',
                  selectedId === contact.id &&
                    'bg-primary/10 border-l-4 border-primary'
                )}
              >
                <div className="space-y-2">
                  {/* Header with name and company */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      {contact.company && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          <span className="line-clamp-1">
                            {contact.company}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-1">
                    {/* Email */}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}

                    {/* Phone */}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{contact.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {formatDate(new Date(contact.lastContactedAt || contact.createdAt))}
                      </span>
                    </div>
                    {contact.conversationCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {contact.conversationCount} chat
                        {contact.conversationCount !== 1 ? 's' : ''}
                      </Badge>
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
