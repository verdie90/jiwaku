import { useState } from 'react';
import { useAutomation, useRuleBuilder, useRuleTemplates } from '@/hooks/useAutomation';
import { RulesList } from './RulesList';
import { RuleForm } from './RuleForm';
import { RulesStats } from './RulesStats';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, Settings } from 'lucide-react';

interface AutomationRulesProps {
  teamId: string;
}

/**
 * Main Automation Rules Management Component
 * Displays list of rules and allows creation/editing
 */
export function AutomationRules({ teamId }: AutomationRulesProps) {
  const { rules, activeRules, isLoading, error, deleteRule, toggleRuleActive } =
    useAutomation(teamId);
  const ruleBuilder = useRuleBuilder();
  const templates = useRuleTemplates();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleCreateNew = () => {
    ruleBuilder.reset();
    setEditingRuleId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (ruleId: string) => {
    // In real implementation, load rule data into builder
    setEditingRuleId(ruleId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRuleId(null);
    ruleBuilder.reset();
  };

  const handleUseTemplate = (templateKey: string) => {
    const template = templates[templateKey as keyof typeof templates];
    if (template) {
      ruleBuilder.setName(template.name);
      ruleBuilder.setDescription(template.description);
      
      // Clear existing
      template.triggers.forEach(trigger => ruleBuilder.addTrigger(trigger));
      template.conditions.forEach(condition => ruleBuilder.addCondition(condition));
      template.actions.forEach(action => ruleBuilder.addAction(action));
      
      setShowTemplates(false);
      setIsFormOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Automation Rules</h1>
          <p className="text-gray-600 text-sm">
            {activeRules.length} active · {rules.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error loading rules</p>
            <p className="text-sm text-red-700">{String(error)}</p>
          </div>
        </div>
      )}

      {/* Templates */}
      {showTemplates && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Rule Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleUseTemplate(key)}
                className="text-left p-3 rounded-lg bg-white hover:bg-blue-50 border border-blue-100 hover:border-blue-300 transition-colors"
              >
                <p className="font-medium text-sm text-blue-900">{template.name}</p>
                <p className="text-xs text-blue-700 mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <RulesStats rules={rules} activeRules={activeRules} />

      {/* Form/List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        {isFormOpen && (
          <div className="lg:col-span-1">
            <RuleForm
              teamId={teamId}
              editingRuleId={editingRuleId}
              onClose={handleCloseForm}
              ruleBuilder={ruleBuilder}
            />
          </div>
        )}

        {/* List */}
        <div className={isFormOpen ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {rules.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No automation rules yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Create your first rule to automate ticket management
              </p>
              <Button
                className="mt-4"
                onClick={handleCreateNew}
              >
                Create Rule
              </Button>
            </div>
          ) : (
            <RulesList
              rules={rules}
              onEdit={handleEdit}
              onDelete={deleteRule}
              onToggleActive={toggleRuleActive}
            />
          )}
        </div>
      </div>
    </div>
  );
}
