'use client';

import { useState } from 'react';
import { Contact } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/helpers';
import { X, Plus, Mail, Phone, Building2 } from 'lucide-react';

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: Partial<Contact>) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  channels: { type: string; handle: string }[];
}

export function ContactForm({
  contact,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    jobTitle: contact?.jobTitle || '',
    channels: contact?.channels || [],
  });

  const [newChannel, setNewChannel] = useState({
    type: 'whatsapp',
    handle: '',
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddChannel = () => {
    if (newChannel.handle.trim()) {
      setFormData((prev) => ({
        ...prev,
        channels: [...prev.channels, { ...newChannel }],
      }));
      setNewChannel({ type: 'whatsapp', handle: '' });
    }
  };

  const handleRemoveChannel = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('First name and last name are required');
      return;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      alert('Email or phone is required');
      return;
    }

    const submissionData: Partial<Contact> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      jobTitle: formData.jobTitle,
      channels: formData.channels.map(c => ({
        ...c,
        verified: c.type === 'email' ? true : false,
      } as any)),
    };

    await onSubmit(submissionData);
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">
          {contact ? 'Edit Contact' : 'New Contact'}
        </h2>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto space-y-4 p-4"
      >
        {/* Basic Information */}
        <div className="space-y-3 bg-card rounded-lg border p-4">
          <h3 className="font-semibold text-sm">Basic Information</h3>

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">First Name *</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="First name"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Last Name *</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Last name"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              disabled={isSubmitting}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Phone
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-3 bg-card rounded-lg border p-4">
          <h3 className="font-semibold text-sm">Professional Information</h3>

          {/* Company */}
          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Company
            </label>
            <Input
              value={formData.company || ''}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="Company name"
              disabled={isSubmitting}
            />
          </div>

          {/* Job Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Job Title</label>
            <Input
              value={formData.jobTitle || ''}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder="e.g., Manager, Developer"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Communication Channels */}
        <div className="space-y-3 bg-card rounded-lg border p-4">
          <h3 className="font-semibold text-sm">Communication Channels</h3>

          {/* Channel List */}
          {formData.channels.length > 0 && (
            <div className="space-y-2">
              {formData.channels.map((channel, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded bg-accent/30 text-sm"
                >
                  <div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {channel.type}
                    </Badge>
                    <p className="text-xs text-muted-foreground truncate">
                      {channel.handle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveChannel(idx)}
                    className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Channel */}
          <div className="space-y-2 p-3 rounded bg-accent/20 border border-dashed">
            <label className="text-xs font-medium">Add Channel</label>
            <div className="flex gap-2">
              <select
                value={newChannel.type}
                onChange={(e) =>
                  setNewChannel((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className={cn(
                  'flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm transition-colors',
                  'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                disabled={isSubmitting}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="web_chat">Web Chat</option>
                <option value="sms">SMS</option>
              </select>
              <Input
                value={newChannel.handle}
                onChange={(e) =>
                  setNewChannel((prev) => ({
                    ...prev,
                    handle: e.target.value,
                  }))
                }
                placeholder="Contact handle"
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddChannel}
                disabled={isSubmitting || !newChannel.handle.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="opacity-50">Saving...</span>
            ) : (
              <span>{contact ? 'Update' : 'Create'} Contact</span>
            )}
          </Button>
        </div>

        {/* Spacer for fixed buttons */}
        <div className="h-20" />
      </form>
    </div>
  );
}
