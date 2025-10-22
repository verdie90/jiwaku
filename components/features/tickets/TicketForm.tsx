'use client';

import { useState } from 'react';
import { Ticket } from '@/types';
import { TicketPriority, TicketStatus } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/helpers';
import { X } from 'lucide-react';

interface TicketFormProps {
  ticket?: Ticket;
  onSubmit: (data: Partial<Ticket>) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const PRIORITIES: Array<keyof typeof TicketPriority> = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
];
const STATUSES: Array<keyof typeof TicketStatus> = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING',
  'RESOLVED',
  'CLOSED',
];

export function TicketForm({
  ticket,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TicketFormProps) {
  const [formData, setFormData] = useState<Partial<Ticket>>(
    ticket || {
      title: '',
      description: '',
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      tags: [],
      categories: [],
    }
  );

  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && formData.tags) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index),
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && formData.categories) {
      setFormData((prev) => ({
        ...prev,
        categories: [...(prev.categories || []), newCategory.trim()],
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories?.filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValid = formData.title?.trim() && formData.description?.trim();

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">
          {ticket ? 'Edit Ticket' : 'Create New Ticket'}
        </h2>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6 max-w-2xl">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              BASIC INFORMATION
            </h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                name="title"
                value={formData.title || ''}
                onChange={handleFieldChange}
                placeholder="Enter ticket title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleFieldChange}
                placeholder="Enter ticket description"
                className="w-full p-2 rounded-lg border bg-background text-sm min-h-24"
                required
              />
            </div>
          </div>

          {/* Status & Priority Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              STATUS & PRIORITY
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status || TicketStatus.OPEN}
                  onChange={handleFieldChange}
                  className="w-full p-2 rounded-lg border bg-background text-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={TicketStatus[status]}>
                      {status
                        .split('_')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority || TicketPriority.MEDIUM}
                  onChange={handleFieldChange}
                  className="w-full p-2 rounded-lg border bg-background text-sm"
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={TicketPriority[priority]}>
                      {priority.charAt(0).toUpperCase() +
                        priority.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">TAGS</h3>

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </div>

            {/* Tags Display */}
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Categories Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              CATEGORIES
            </h3>

            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add a category"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
              >
                Add
              </Button>
            </div>

            {/* Categories Display */}
            {formData.categories && formData.categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {formData.categories.map((category, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(index)}
                      className="hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t p-4 bg-card flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={cn(!isValid && 'opacity-50 cursor-not-allowed')}
        >
          {isSubmitting
            ? 'Saving...'
            : ticket
              ? 'Update Ticket'
              : 'Create Ticket'}
        </Button>
      </div>
    </form>
  );
}
