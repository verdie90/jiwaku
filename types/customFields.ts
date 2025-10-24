'use client';

/**
 * Custom Fields System - Core configuration and management
 * Allows teams to create, manage, and use custom fields across entities
 */

export interface CustomField {
  id: string;
  teamId: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'json';
  description?: string;
  required: boolean;
  enabled: boolean;
  options?: Array<{
    id: string;
    label: string;
    value: string;
    color?: string;
  }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  defaultValue?: any;
  placeholder?: string;
  metadata?: {
    category?: string;
    icon?: string;
    position?: number;
    visible?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CustomFieldValue {
  fieldId: string;
  value: any;
  updatedAt: Date;
  updatedBy: string;
}

export interface EntityWithCustomFields {
  id: string;
  teamId: string;
  type: 'contact' | 'ticket' | 'agent' | 'deal' | 'company';
  customFieldValues: Record<string, CustomFieldValue>;
  createdAt: Date;
  updatedAt: Date;
}

// Field type configurations
export const FIELD_TYPES = {
  text: { label: 'Text', icon: 'Type' },
  number: { label: 'Number', icon: 'Hash' },
  email: { label: 'Email', icon: 'Mail' },
  phone: { label: 'Phone', icon: 'Phone' },
  date: { label: 'Date', icon: 'Calendar' },
  select: { label: 'Select', icon: 'ChevronDown' },
  multiselect: { label: 'Multi-Select', icon: 'List' },
  checkbox: { label: 'Checkbox', icon: 'Check' },
  textarea: { label: 'Textarea', icon: 'FileText' },
  json: { label: 'JSON', icon: 'Code' },
} as const;

// Entity types that support custom fields
export const ENTITY_TYPES = [
  'contact',
  'ticket',
  'agent',
  'deal',
  'company',
] as const;
