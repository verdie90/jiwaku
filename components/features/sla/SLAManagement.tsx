"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import {
  useSLAPolicies,
  useDeleteSLAPolicy,
  useSLADashboardStats,
} from "@/hooks/useSLA";
import { SLAPolicy } from "@/types";

interface SLAManagementProps {
  teamId: string;
}

/**
 * SLA Management Dashboard
 * Main interface for managing SLA policies, rules, and templates
 */
export default function SLAManagement({ teamId }: SLAManagementProps) {
  const [activeTab, setActiveTab] = useState<"policies" | "templates" | "metrics" | "settings">(
    "policies"
  );

  const { data: policies, isLoading: policiesLoading } = useSLAPolicies(teamId);
  const { data: stats } = useSLADashboardStats(teamId);
  const { mutate: deletePolicy } = useDeleteSLAPolicy(teamId);

  const handleDeletePolicy = (policyId: string) => {
    if (confirm("Are you sure you want to delete this SLA policy?")) {
      deletePolicy({ policyId, deletedBy: "current-user-id" });
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SLA Configuration</h1>
          <p className="text-slate-600">Manage Service Level Agreements and response times</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={CheckCircle}
              label="SLA Met"
              value={stats.slaMetTickets}
              total={stats.totalTicketsWithSLA}
              color="green"
            />
            <StatCard
              icon={AlertCircle}
              label="At Risk"
              value={stats.atRiskTickets}
              color="yellow"
            />
            <StatCard
              icon={Zap}
              label="Breached"
              value={stats.slaBreachedTickets}
              color="red"
            />
            <StatCard
              icon={TrendingUp}
              label="Compliance Rate"
              value={`${Math.round(stats.overallSLAComplianceRate)}%`}
              color="blue"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6 border border-slate-200">
          <div className="flex flex-wrap">
            {[
              { id: "policies", label: "Policies", icon: Settings },
              { id: "templates", label: "Email Templates", icon: Edit2 },
              { id: "metrics", label: "Metrics", icon: TrendingUp },
              { id: "settings", label: "Settings", icon: Clock },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                  activeTab === id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          {activeTab === "policies" && (
            <SLAPoliciesTab
              teamId={teamId}
              policies={policies || []}
              isLoading={policiesLoading}
              onDelete={handleDeletePolicy}
              onEdit={() => {}}
              onCreateNew={() => {}}
            />
          )}

          {activeTab === "templates" && (
            <div className="text-center py-12">
              <Edit2 size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">Email templates configuration coming soon</p>
            </div>
          )}

          {activeTab === "metrics" && (
            <div className="text-center py-12">
              <TrendingUp size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">SLA metrics dashboard coming soon</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">Global SLA settings coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SLA POLICIES TAB COMPONENT
// ============================================================================

interface SLAPoliciesTabProps {
  teamId: string;
  policies: SLAPolicy[];
  isLoading: boolean;
  onDelete: (policyId: string) => void;
  onEdit: (policy: SLAPolicy) => void;
  onCreateNew: () => void;
}

function SLAPoliciesTab({
  policies,
  isLoading,
  onDelete,
  onEdit,
  onCreateNew,
}: SLAPoliciesTabProps) {
  if (isLoading) {
    return <LoadingSkeletons />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900">SLA Policies</h3>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          New Policy
        </button>
      </div>

      {policies.length === 0 ? (
        <div className="text-center py-12">
          <Settings size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 mb-4">No SLA policies yet</p>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Policy
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// POLICY CARD COMPONENT
// ============================================================================

interface PolicyCardProps {
  policy: SLAPolicy;
  onEdit: (policy: SLAPolicy) => void;
  onDelete: (policyId: string) => void;
}

function PolicyCard({ policy, onEdit, onDelete }: PolicyCardProps) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-md transition-all bg-slate-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-semibold text-slate-900">{policy.name}</h4>
            {policy.isDefault && (
              <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                Default
              </span>
            )}
            {policy.enabled ? (
              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-semibold bg-slate-200 text-slate-700 rounded">
                Inactive
              </span>
            )}
          </div>

          {policy.description && <p className="text-sm text-slate-600 mb-3">{policy.description}</p>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white p-2 rounded border border-slate-100">
              <p className="text-slate-600 text-xs font-medium">Response Time</p>
              <p className="text-slate-900 font-semibold">{policy.responseTime.value}m</p>
            </div>
            <div className="bg-white p-2 rounded border border-slate-100">
              <p className="text-slate-600 text-xs font-medium">Resolution Time</p>
              <p className="text-slate-900 font-semibold">{policy.resolutionTime.value}m</p>
            </div>
            <div className="bg-white p-2 rounded border border-slate-100">
              <p className="text-slate-600 text-xs font-medium">Escalations</p>
              <p className="text-slate-900 font-semibold">{policy.escalationRules.length}</p>
            </div>
            <div className="bg-white p-2 rounded border border-slate-100">
              <p className="text-slate-600 text-xs font-medium">Priorities</p>
              <p className="text-slate-900 font-semibold">{policy.applicable.priorityLevels.length}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(policy)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => {}}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={() => onDelete(policy.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  value: string | number;
  total?: number;
  color: "green" | "yellow" | "red" | "blue";
}

function StatCard({ icon: Icon, label, value, total, color }: StatCardProps) {
  const colors = {
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-700">{label}</h3>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {total && <p className="text-xs text-slate-600 mt-1">of {total} total</p>}
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeletons() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-48 mb-2"></div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
