'use client';

import { useState } from 'react';
import { TicketStatus, TicketPriority } from '@/config/constants';
import { DateRange } from '@/types';
import { X, Filter, ChevronDown } from 'lucide-react';

interface TicketFiltersProps {
  selectedStatuses: TicketStatus[];
  selectedPriorities: TicketPriority[];
  selectedAssignees: string[];
  selectedTags: string[];
  searchQuery: string;
  dateRange?: DateRange;
  onStatusChange: (statuses: TicketStatus[]) => void;
  onPriorityChange: (priorities: TicketPriority[]) => void;
  onAssigneeChange: (assignees: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onSearchChange: (query: string) => void;
  onDateRangeChange?: (dateRange?: DateRange) => void;
  onReset: () => void;
  availableTags?: string[];
  availableAssignees?: Array<{ id: string; name: string }>;
}

export function TicketFilters({
  selectedStatuses,
  selectedPriorities,
  selectedAssignees,
  selectedTags,
  searchQuery,
  dateRange,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onTagsChange,
  onSearchChange,
  onDateRangeChange,
  onReset,
  availableTags = [],
  availableAssignees = [],
}: TicketFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isFiltered =
    selectedStatuses.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedAssignees.length > 0 ||
    selectedTags.length > 0 ||
    searchQuery.length > 0 ||
    dateRange?.startDate ||
    dateRange?.endDate;

  const handleStatusToggle = (status: TicketStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const handlePriorityToggle = (priority: TicketPriority) => {
    if (selectedPriorities.includes(priority)) {
      onPriorityChange(selectedPriorities.filter((p) => p !== priority));
    } else {
      onPriorityChange([...selectedPriorities, priority]);
    }
  };

  const handleAssigneeToggle = (assigneeId: string) => {
    if (selectedAssignees.includes(assigneeId)) {
      onAssigneeChange(selectedAssignees.filter((a) => a !== assigneeId));
    } else {
      onAssigneeChange([...selectedAssignees, assigneeId]);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status Filter */}
      <FilterSection title="Status" icon={<Filter className="w-4 h-4" />}>
        <div className="flex flex-wrap gap-2">
          {Object.values(TicketStatus).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusToggle(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedStatuses.includes(status)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Priority Filter */}
      <FilterSection title="Priority">
        <div className="flex flex-wrap gap-2">
          {Object.values(TicketPriority).map((priority) => (
            <button
              key={priority}
              onClick={() => handlePriorityToggle(priority)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedPriorities.includes(priority)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Assignee Filter */}
      {availableAssignees.length > 0 && (
        <FilterSection title="Assigned To">
          <div className="space-y-2">
            {availableAssignees.map((assignee) => (
              <label key={assignee.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAssignees.includes(assignee.id)}
                  onChange={() => handleAssigneeToggle(assignee.id)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{assignee.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <FilterSection title="Tags">
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                  selectedTags.includes(tag)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
      >
        <span className="font-medium">More Filters</span>
        <ChevronDown
          className={`w-4 h-4 transition ${showAdvanced ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
          {/* Date Range */}
          {onDateRangeChange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="date"
                    value={dateRange?.startDate ? dateRange.startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const newDate = e.target.value ? new Date(e.target.value) : undefined;
                      onDateRangeChange({
                        ...dateRange,
                        startDate: newDate,
                      });
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Start date"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="date"
                    value={dateRange?.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const newDate = e.target.value ? new Date(e.target.value) : undefined;
                      onDateRangeChange({
                        ...dateRange,
                        endDate: newDate,
                      });
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Date Type Selection */}
          {onDateRangeChange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Type
              </label>
              <select
                value={dateRange?.type || 'created'}
                onChange={(e) =>
                  onDateRangeChange({
                    ...dateRange,
                    type: e.target.value as 'created' | 'updated' | 'resolved' | 'closed',
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="created">Created Date</option>
                <option value="updated">Updated Date</option>
                <option value="resolved">Resolved Date</option>
                <option value="closed">Closed Date</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {isFiltered && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-medium">Filters Applied</span>
            <span className="text-blue-700 ml-2">
              ({selectedStatuses.length + selectedPriorities.length + selectedAssignees.length + selectedTags.length} active)
            </span>
          </p>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function FilterSection({ title, icon, children }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200 pb-4 last:border-b-0">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}
