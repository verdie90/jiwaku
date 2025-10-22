import { AutomationRule } from '@/types';
import { Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RulesListProps {
  rules: AutomationRule[];
  onEdit: (ruleId: string) => void;
  onDelete: (ruleId: string) => void;
  onToggleActive: (ruleId: string) => void;
}

export function RulesList({ rules, onEdit, onDelete, onToggleActive }: RulesListProps) {
  const sortedRules = [...rules].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return (
    <div className="space-y-2">
      {sortedRules.map(rule => (
        <div
          key={rule.id}
          className={`p-4 rounded-lg border transition-all ${
            rule.isActive
              ? 'bg-white border-gray-200 hover:border-gray-300'
              : 'bg-gray-50 border-gray-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  Priority {rule.priority}
                </span>
                {!rule.isActive && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    Disabled
                  </span>
                )}
              </div>
              {rule.description && (
                <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
              )}
              
              <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Triggers:</span>
                  <p className="font-medium text-gray-900">{rule.triggers.length}</p>
                </div>
                <div>
                  <span className="text-gray-500">Conditions:</span>
                  <p className="font-medium text-gray-900">{rule.conditions.length}</p>
                </div>
                <div>
                  <span className="text-gray-500">Actions:</span>
                  <p className="font-medium text-gray-900">{rule.actions.length}</p>
                </div>
              </div>

              {rule.lastExecutedAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Last executed: {new Date(rule.lastExecutedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleActive(rule.id)}
                title={rule.isActive ? 'Disable rule' : 'Enable rule'}
              >
                {rule.isActive ? (
                  <ToggleRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(rule.id)}
                title="Edit rule"
              >
                <Edit2 className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(rule.id)}
                title="Delete rule"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
