'use client';

import { Contact, Conversation } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/helpers';
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  MessageCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  MoreVertical,
} from 'lucide-react';

interface ContactDetailProps {
  contact: Contact;
  conversations?: Conversation[];
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  onSelectConversation?: (conversation: Conversation) => void;
}

export function ContactDetail({
  contact,
  conversations = [],
  onEdit,
  onDelete,
  onBack,
  onSelectConversation,
}: ContactDetailProps) {
  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <h2 className="text-lg font-semibold">Contact Details</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            // Toggle menu if needed
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {/* Profile Card */}
        <div className="bg-card rounded-lg border p-4 space-y-4">
          {/* Name and Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-semibold">
              {contact.firstName.charAt(0)}
              {contact.lastName.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {contact.firstName} {contact.lastName}
              </h3>
              {contact.jobTitle && (
                <p className="text-sm text-muted-foreground">
                  {contact.jobTitle}
                </p>
              )}
            </div>
          </div>

          {/* Company Info */}
          {contact.company && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{contact.company}</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex gap-2 flex-wrap">
            <Badge>Active Contact</Badge>
            {contact.conversationCount > 0 && (
              <Badge variant="secondary">
                {contact.conversationCount} Conversations
              </Badge>
            )}
          </div>

          <div className="border-t my-4" />

          {/* Contact Information */}
          <div className="space-y-3">
            {/* Email */}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 p-2 rounded hover:bg-accent/50 transition-colors group"
              >
                <Mail className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm truncate group-hover:text-primary">
                    {contact.email}
                  </p>
                </div>
              </a>
            )}

            {/* Phone */}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-3 p-2 rounded hover:bg-accent/50 transition-colors group"
              >
                <Phone className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm truncate group-hover:text-primary">
                    {contact.phone}
                  </p>
                </div>
              </a>
            )}

            {/* Channels */}
            {contact.channels.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Channels
                </p>
                {contact.channels.map((channel, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded bg-accent/30"
                  >
                    <Badge variant="outline" className="text-xs capitalize">
                      {channel.type}
                    </Badge>
                    <span className="text-sm truncate">{channel.handle}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t my-4" />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {formatDate(new Date(contact.createdAt))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Last Contact</p>
                <p className="font-medium">
                  {contact.lastContactedAt
                    ? formatDate(new Date(contact.lastContactedAt))
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={onEdit}
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 gap-2"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>

          {/* Message Button */}
          <Button className="w-full gap-2" variant="default">
            <MessageCircle className="w-4 h-4" />
            Send Message
          </Button>
        </div>

        {/* Recent Conversations */}
        {conversations.length > 0 && (
          <div className="bg-card rounded-lg border p-4 space-y-3">
            <h4 className="font-semibold text-sm">Recent Conversations</h4>
            <div className="space-y-2">
              {conversations.slice(0, 5).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation?.(conv)}
                  className={cn(
                    'w-full text-left p-2 rounded text-sm',
                    'hover:bg-accent transition-colors',
                    'flex items-center justify-between'
                  )}
                >
                  <div>
                    <p className="font-medium capitalize">{conv.channel}</p>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(conv.lastMessageAt))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
