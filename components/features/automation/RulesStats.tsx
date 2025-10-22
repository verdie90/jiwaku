import { AutomationRule } from '@/types';
import { Activity, AlertCircle, Check, Zap } from 'lucide-react';

interface RulesStatsProps {
  rules: AutomationRule[];
  activeRules: AutomationRule[];
}

export function RulesStats({ rules, activeRules }: RulesStatsProps) {
  const totalExecutions = rules.reduce((sum, rule) => sum + (rule.executeCount || 0), 0);
  const totalErrors = rules.reduce((sum, rule) => sum + (rule.errorCount || 0), 0);
  const successRate = totalExecutions > 0 
    ? (((totalExecutions - totalErrors) / totalExecutions) * 100).toFixed(1)
    : 'N/A';

  const stats = [
    {
      icon: Zap,
      label: 'Active Rules',
      value: activeRules.length,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Activity,
      label: 'Total Executions',
      value: totalExecutions,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      icon: Check,
      label: 'Success Rate',
      value: typeof successRate === 'string' ? successRate + '%' : successRate,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      icon: AlertCircle,
      label: 'Total Errors',
      value: totalErrors,
      color: 'bg-red-50',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`${stat.color} rounded-lg p-4`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <Icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
