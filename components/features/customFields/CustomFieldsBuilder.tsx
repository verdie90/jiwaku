'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Settings,
} from 'lucide-react';
import { CustomField, FIELD_TYPES } from '@/types/customFields';
import {
  useCustomFields,
  useCreateCustomField,
  useUpdateCustomField,
  useDeleteCustomField,
} from '@/hooks/useCustomFields';

interface CustomFieldsBuilderProps {
  teamId: string;
  userId: string;
}

export function CustomFieldsBuilder({ teamId, userId }: CustomFieldsBuilderProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CustomField>>({
    type: 'text',
    required: false,
    enabled: true,
    options: [],
  });

  const { data: fields = [], isLoading } = useCustomFields(teamId);
  const createField = useCreateCustomField(teamId);
  const updateField = useUpdateCustomField(teamId, editingId || '');
  const deleteField = useDeleteCustomField(teamId);

  const handleSave = async () => {
    if (!formData.name || !formData.label) {
      alert('Name and label are required');
      return;
    }

    try {
      if (editingId) {
        await updateField.mutateAsync(formData);
      } else {
        await createField.mutateAsync({
          field: formData as any,
          userId,
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving field:', error);
    }
  };

  const handleEdit = (field: CustomField) => {
    setEditingId(field.id);
    setFormData(field);
    setShowForm(true);
  };

  const handleDelete = async (fieldId: string) => {
    if (!confirm('Delete this field?')) return;
    try {
      await deleteField.mutateAsync(fieldId);
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      type: 'text',
      required: false,
      enabled: true,
      options: [],
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading fields...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Fields</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage custom fields for your entities</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Add Field
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingId ? 'Edit Field' : 'Create Field'}
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., customer_id, priority_level"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  value={formData.label || ''}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Customer ID, Priority Level"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field Type
                </label>
                <select
                  value={formData.type || 'text'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {Object.entries(FIELD_TYPES).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Options (for select/multiselect) */}
              {(formData.type === 'select' || formData.type === 'multiselect') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Options
                  </label>
                  <div className="space-y-2">
                    {formData.options?.map((option, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => {
                            const opts = [...(formData.options || [])];
                            opts[idx].label = e.target.value;
                            setFormData({ ...formData, options: opts });
                          }}
                          placeholder="Label"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => {
                            const opts = formData.options?.filter((_, i) => i !== idx) || [];
                            setFormData({ ...formData, options: opts });
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newOption = {
                          id: Date.now().toString(),
                          label: '',
                          value: '',
                        };
                        setFormData({
                          ...formData,
                          options: [...(formData.options || []), newOption],
                        });
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* Required & Enabled */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.required || false}
                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Required</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enabled !== false}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={createField.isPending || updateField.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fields List */}
      {fields.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No custom fields yet</p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first field
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {fields.map((field) => (
            <div
              key={field.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{field.label}</h3>
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded">
                        Required
                      </span>
                    )}
                    {!field.enabled && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{field.name}</p>
                  {field.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{field.description}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleEdit(field)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(field.id)}
                    disabled={deleteField.isPending}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
