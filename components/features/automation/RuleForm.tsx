'use client';

import { useState } from 'react';
import { useAutomation } from '@/hooks/useAutomation';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronDown, Plus, X } from 'lucide-react';

interface RuleFormProps {
  teamId: string;
  editingRuleId: string | null;
  onClose: () => void;
  ruleBuilder: ReturnType<typeof import('@/hooks/useAutomation').useRuleBuilder>;
}

export function RuleForm({
  teamId,
  editingRuleId,
  onClose,
  ruleBuilder,
}: RuleFormProps) {
  const { createRule, updateRule, isCreating, isUpdating } = useAutomation(teamId);
  const [expandedSection, setExpandedSection] = useState<'triggers' | 'conditions' | 'actions'>('triggers');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ruleBuilder.isValid) {
      alert('Please fix validation errors');
      return;
    }

    if (editingRuleId) {
      updateRule({
        ruleId: editingRuleId,
        updates: {
          name: ruleBuilder.name,
          description: ruleBuilder.description,
          triggers: ruleBuilder.triggers,
          conditions: ruleBuilder.conditions,
          actions: ruleBuilder.actions,
          priority: ruleBuilder.priority,
        },
      });
    } else {
      createRule({
        name: ruleBuilder.name,
        description: ruleBuilder.description,
        triggers: ruleBuilder.triggers,
        conditions: ruleBuilder.conditions,
        actions: ruleBuilder.actions,
        priority: ruleBuilder.priority,
      });
    }

    onClose();
  };

  const TRIGGER_OPTIONS = [
    { value: 'ticket_created', label: 'Ticket Created' },
    { value: 'ticket_updated', label: 'Ticket Updated' },
    { value: 'ticket_assigned', label: 'Ticket Assigned' },
    { value: 'ticket_status_changed', label: 'Status Changed' },
    { value: 'sla_warning', label: 'SLA Warning' },
    { value: 'sla_breached', label: 'SLA Breached' },
    { value: 'comment_added', label: 'Comment Added' },
    { value: 'tag_added', label: 'Tag Added' },
  ];

  const CONDITION_FIELDS = [
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'assignedAgentId', label: 'Assigned Agent' },
    { value: 'tags', label: 'Tags' },
    { value: 'categories', label: 'Categories' },
  ];

  const OPERATORS = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'in', label: 'In' },
  ];

  const ACTION_OPTIONS = [
    { value: 'assign', label: 'Assign to Agent' },
    { value: 'set_priority', label: 'Set Priority' },
    { value: 'set_status', label: 'Set Status' },
    { value: 'add_tag', label: 'Add Tag' },
    { value: 'remove_tag', label: 'Remove Tag' },
    { value: 'add_category', label: 'Add Category' },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 sticky top-6">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-900">
          {editingRuleId ? 'Edit Rule' : 'New Rule'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Basic Info */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            value={ruleBuilder.name}
            onChange={e => ruleBuilder.setName(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Auto-assign High Priority"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={ruleBuilder.description}
            onChange={e => ruleBuilder.setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Describe what this rule does..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            value={ruleBuilder.priority}
            onChange={e => ruleBuilder.setPriority(parseInt(e.target.value))}
            className="mt-1 block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
              <option key={p} value={p}>Priority {p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation Errors */}
      {ruleBuilder.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          {ruleBuilder.errors.map((error, i) => (
            <div key={i} className="flex gap-2 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Triggers Section */}
      <button
        type="button"
        onClick={() => setExpandedSection(expandedSection === 'triggers' ? 'conditions' : 'triggers')}
        className="w-full flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition"
      >
        <span className="font-medium text-sm text-gray-900">
          Triggers ({ruleBuilder.triggers.length})
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            expandedSection === 'triggers' ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expandedSection === 'triggers' && (
        <div className="space-y-2 bg-gray-50 p-2 rounded">
          {ruleBuilder.triggers.map((trigger, i) => (
            <div key={i} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
              <span className="text-sm text-gray-900">
                {TRIGGER_OPTIONS.find(t => t.value === trigger.type)?.label}
              </span>
              <button
                type="button"
                onClick={() => ruleBuilder.removeTrigger(i)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <select
            onChange={e => {
              ruleBuilder.addTrigger({ type: e.target.value as any });
              e.target.value = '';
            }}
            className="w-full rounded border-gray-300 border px-2 py-1 text-sm"
            defaultValue=""
          >
            <option value="">+ Add Trigger</option>
            {TRIGGER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Conditions Section */}
      <button
        type="button"
        onClick={() => setExpandedSection(expandedSection === 'conditions' ? 'actions' : 'conditions')}
        className="w-full flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition"
      >
        <span className="font-medium text-sm text-gray-900">
          Conditions ({ruleBuilder.conditions.length})
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            expandedSection === 'conditions' ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expandedSection === 'conditions' && (
        <div className="space-y-2 bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Optional: Conditions must match for actions to execute</p>
          {ruleBuilder.conditions.map((condition, i) => (
            <div key={i} className="bg-white p-2 rounded border border-gray-200 space-y-1">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-700">
                  {CONDITION_FIELDS.find(f => f.value === condition.field)?.label}
                </span>
                <button
                  type="button"
                  onClick={() => ruleBuilder.removeCondition(i)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-gray-600">
                {OPERATORS.find(o => o.value === condition.operator)?.label} {condition.value}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => ruleBuilder.addCondition({
              id: `cond-${Date.now()}`,
              field: 'priority',
              operator: 'equals',
              value: '',
            })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Condition
          </Button>
        </div>
      )}

      {/* Actions Section */}
      <button
        type="button"
        onClick={() => setExpandedSection('actions')}
        className="w-full flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition"
      >
        <span className="font-medium text-sm text-gray-900">
          Actions ({ruleBuilder.actions.length})
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            expandedSection === 'actions' ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expandedSection === 'actions' && (
        <div className="space-y-2 bg-gray-50 p-2 rounded">
          {ruleBuilder.actions.map((action, i) => (
            <div key={i} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
              <span className="text-sm text-gray-900">
                {ACTION_OPTIONS.find(a => a.value === action.type)?.label}
              </span>
              <button
                type="button"
                onClick={() => ruleBuilder.removeAction(i)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <select
            onChange={e => {
              ruleBuilder.addAction({ type: e.target.value as any });
              e.target.value = '';
            }}
            className="w-full rounded border-gray-300 border px-2 py-1 text-sm"
            defaultValue=""
          >
            <option value="">+ Add Action</option>
            {ACTION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          type="submit"
          disabled={isCreating || isUpdating || !ruleBuilder.isValid}
          className="flex-1"
        >
          {editingRuleId ? 'Update Rule' : 'Create Rule'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
