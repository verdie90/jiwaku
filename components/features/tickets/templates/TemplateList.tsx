'use client';

import { useState } from 'react';
import { TicketTemplate } from '@/types';
import { useTemplateMutations, useToggleTemplateFavorite } from '@/hooks/useTemplates';
import {
  Star,
  Trash2,
  Copy,
  Edit2,
  ChevronRight,
  Search,
  Plus,
} from 'lucide-react';

interface TemplateListProps {
  templates: TicketTemplate[];
  isLoading?: boolean;
  onSelectTemplate?: (template: TicketTemplate) => void;
  onEditTemplate?: (template: TicketTemplate) => void;
  onCreateNew?: () => void;
  teamId: string;
  userId: string;
}

export function TemplateList({
  templates,
  isLoading,
  onSelectTemplate,
  onEditTemplate,
  onCreateNew,
  teamId,
  userId,
}: TemplateListProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { deleteMutation, cloneMutation } = useTemplateMutations(teamId);
  const { mutate: toggleFavorite } = useToggleTemplateFavorite(teamId);

  // Get unique categories
  const categories = [...new Set(templates.map((t) => t.category))];

  // Filter templates
  const filtered = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              selectedCategory === null
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No templates found</p>
          </div>
        ) : (
          filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelectTemplate}
              onEdit={onEditTemplate}
              onDelete={(id) => deleteMutation.mutate(id)}
              onClone={(id, name) =>
                cloneMutation.mutate({ templateId: id, newName: name, createdBy: userId })
              }
              onToggleFavorite={(id, isFav) =>
                toggleFavorite({ templateId: id, isFavorite: isFav })
              }
              isDeleting={deleteMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: TicketTemplate;
  onSelect?: (template: TicketTemplate) => void;
  onEdit?: (template: TicketTemplate) => void;
  onDelete?: (id: string) => void;
  onClone?: (id: string, name: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  isDeleting?: boolean;
}

function TemplateCard({
  template,
  onSelect,
  onEdit,
  onDelete,
  onClone,
  onToggleFavorite,
  isDeleting,
}: TemplateCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer bg-white"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onSelect?.(template)}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Template Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{template.name}</h4>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
              {template.category}
            </span>
          </div>
          {template.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
          )}
          <div className="flex items-center gap 3 mt-2 text-xs text-gray-500">
            <span>Priority: {template.priority}</span>
            {template.usageCount > 0 && <span>Used: {template.usageCount}x</span>}
            <span>{new Date(template.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-1 transition ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(template.id, !template.isFavorite);
              }}
              className="p-1.5 hover:bg-gray-100 rounded transition"
              title={template.isFavorite ? 'Remove favorite' : 'Add favorite'}
            >
              <Star
                className={`w-4 h-4 ${template.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
              />
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(template);
              }}
              className="p-1.5 hover:bg-gray-100 rounded transition"
              title="Edit template"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {onClone && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const cloneName = `${template.name} (Copy)`;
                onClone(template.id, cloneName);
              }}
              className="p-1.5 hover:bg-gray-100 rounded transition"
              title="Clone template"
            >
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this template?')) {
                  onDelete(template.id);
                }
              }}
              disabled={isDeleting}
              className="p-1.5 hover:bg-red-50 rounded transition disabled:opacity-50"
              title="Delete template"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}

          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    </div>
  );
}
