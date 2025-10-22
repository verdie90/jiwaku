'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTemplates } from '@/hooks/useTemplates';
import { TemplateList } from '@/components/features/tickets/templates/TemplateList';
import { TemplateForm } from '@/components/features/tickets/templates/TemplateForm';
import { TicketTemplate } from '@/types';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TemplatesPage() {
  const { user } = useAuth();
  const teamId = 'team-1'; // Get from context or session
  const { data: templates, isLoading } = useTemplates(teamId);
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Please log in to access templates</p>
      </div>
    );
  }

  const handleSelectTemplate = (template: TicketTemplate) => {
    setSelectedTemplate(template);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedTemplate(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/tickets" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ticket Templates</h1>
          <p className="text-gray-600">Create and manage reusable ticket templates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <TemplateStats templates={templates} />

        {/* Main Content */}
        <div className="lg:col-span-2">
          {showForm ? (
            <TemplateForm
              teamId={teamId}
              userId={user.id}
              template={selectedTemplate || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          ) : (
            <TemplateList
              templates={templates || []}
              isLoading={isLoading}
              onSelectTemplate={handleSelectTemplate}
              onEditTemplate={handleSelectTemplate}
              onCreateNew={handleCreateNew}
              teamId={teamId}
              userId={user.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface TemplateStatsProps {
  templates?: TicketTemplate[];
}

function TemplateStats({ templates }: TemplateStatsProps) {
  if (!templates) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const favorites = templates.filter((t) => t.isFavorite).length;
  const totalUsage = templates.reduce((sum, t) => sum + (t.usageCount || 0), 0);
  const byCategory = templates.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-3">
      {/* Total Templates */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600 text-sm mb-1">Total Templates</p>
        <p className="text-3xl font-bold">{templates.length}</p>
      </div>

      {/* Favorites */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600 text-sm mb-1">Favorite Templates</p>
        <p className="text-3xl font-bold text-yellow-500">{favorites}</p>
      </div>

      {/* Total Usage */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600 text-sm mb-1">Total Usage</p>
        <p className="text-3xl font-bold text-blue-500">{totalUsage}</p>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600 text-sm mb-4 font-medium">By Category</p>
        <div className="space-y-2">
          {Object.entries(byCategory).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{category}</span>
              <span className="font-medium bg-gray-100 px-2 py-1 rounded">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
