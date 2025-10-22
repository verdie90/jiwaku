'use client';

import { useState } from 'react';
import { TicketTemplate, TicketTemplateField } from '@/types';
import { useTemplateMutations } from '@/hooks/useTemplates';
import { TicketPriority } from '@/config/constants';
import { X, Plus, Trash2 } from 'lucide-react';

interface TemplateFormProps {
  teamId: string;
  userId: string;
  template?: TicketTemplate;
  onSuccess?: (template: TicketTemplate) => void;
  onCancel?: () => void;
}

export function TemplateForm({
  teamId,
  userId,
  template,
  onSuccess,
  onCancel,
}: TemplateFormProps) {
  const { createMutation, updateMutation } = useTemplateMutations(teamId);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'General',
    priority: template?.priority || (TicketPriority.MEDIUM as string),
    responseTemplate: template?.responseTemplate || '',
    defaultAssigneeId: template?.defaultAssigneeId || '',
    tags: template?.tags || [],
    categories: template?.categories || [],
    customFields: template?.customFields || [],
    isFavorite: template?.isFavorite || false,
  });

  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newField, setNewField] = useState<Partial<TicketTemplateField>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: Omit<TicketTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> = {
      teamId,
      ...formData,
      createdBy: template?.createdBy || userId,
      priority: formData.priority as any,
      tags: formData.tags.filter((t) => t.trim()),
      categories: formData.categories.filter((c) => c.trim()),
      isActive: true,
    };

    if (template?.id) {
      updateMutation.mutate(
        { templateId: template.id, data: data as Partial<TicketTemplate> },
        {
          onSuccess: (updated) => {
            onSuccess?.(updated!);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: (created) => {
          onSuccess?.(created);
        },
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const addCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory)) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory],
      });
      setNewCategory('');
    }
  };

  const removeCategory = (cat: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c !== cat),
    });
  };

  const addCustomField = () => {
    if (
      newField.name &&
      newField.type &&
      newField.label &&
      !formData.customFields.some((f) => f.name === newField.name)
    ) {
      setFormData({
        ...formData,
        customFields: [
          ...formData.customFields,
          {
            name: newField.name,
            type: newField.type,
            label: newField.label,
            placeholder: newField.placeholder,
            required: newField.required || false,
            defaultValue: newField.defaultValue,
            options: newField.options,
          } as TicketTemplateField,
        ],
      });
      setNewField({});
    }
  };

  const removeCustomField = (name: string) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.filter((f) => f.name !== name),
    });
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {template ? 'Edit Template' : 'Create New Template'}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-200'
          }`}
          placeholder="e.g., Bug Report, Feature Request"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe what this template is used for"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.category ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="e.g., Support, Sales"
          />
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(TicketPriority).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Response Template */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Response Template
        </label>
        <textarea
          value={formData.responseTemplate}
          onChange={(e) => setFormData({ ...formData, responseTemplate: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="Initial ticket description or response text"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Add a tag..."
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ticket Categories
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Add a category..."
          />
          <button
            type="button"
            onClick={addCategory}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.categories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
            >
              {cat}
              <button
                type="button"
                onClick={() => removeCategory(cat)}
                className="hover:text-green-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Custom Fields */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Fields</label>
        
        {/* Add New Field Form */}
        <div className="bg-gray-50 p-3 rounded-lg mb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Field name"
              value={newField.name || ''}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              className="px-2 py-1 border border-gray-200 rounded text-sm"
            />
            <select
              value={newField.type || ''}
              onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
              className="px-2 py-1 border border-gray-200 rounded text-sm"
            >
              <option value="">Select type</option>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
              <option value="date">Date</option>
              <option value="checkbox">Checkbox</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Field label"
            value={newField.label || ''}
            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
          />
          <button
            type="button"
            onClick={addCustomField}
            className="w-full px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Add Field
          </button>
        </div>

        {/* Existing Fields */}
        <div className="space-y-2">
          {formData.customFields.map((field) => (
            <div
              key={field.name}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
            >
              <div className="text-sm">
                <p className="font-medium">{field.label}</p>
                <p className="text-gray-500">{field.type}</p>
              </div>
              <button
                type="button"
                onClick={() => removeCustomField(field.name)}
                className="p-1 hover:bg-red-100 rounded transition"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  );
}
