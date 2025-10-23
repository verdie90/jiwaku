"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Download,
  BarChart3,
  FileText,
  Filter,
  Clock,
  Settings,
} from "lucide-react";
import {
  useReports,
  useDeleteReport,
  useExecuteReport,
  useExportToPDF,
} from "@/hooks/useReport";
import { Report } from "@/types";

interface ReportBuilderProps {
  teamId: string;
}

/**
 * Report Builder Dashboard
 * Main interface for creating and managing custom reports
 */
export default function ReportBuilder({ teamId }: ReportBuilderProps) {
  const [activeTab, setActiveTab] = useState<"reports" | "builder" | "executions" | "settings">(
    "reports"
  );

  const { data: reports, isLoading } = useReports(teamId);
  const { mutate: deleteReport } = useDeleteReport(teamId);
  const { mutate: executeReport } = useExecuteReport(teamId);
  const { mutate: exportPDF } = useExportToPDF(teamId);

  const handleDelete = (reportId: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      deleteReport(reportId);
    }
  };

  const handleExecute = (reportId: string) => {
    executeReport({ reportId });
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Custom Reports</h1>
          <p className="text-slate-600">Build, execute, and export custom reports</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6 border border-slate-200">
          <div className="flex flex-wrap">
            {[
              { id: "reports", label: "My Reports", icon: BarChart3 },
              { id: "builder", label: "Report Builder", icon: Plus },
              { id: "executions", label: "History", icon: Clock },
              { id: "settings", label: "Settings", icon: Settings },
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
          {activeTab === "reports" && (
            <ReportsTab
              reports={reports || []}
              isLoading={isLoading}
              onDelete={handleDelete}
              onExecute={handleExecute}
              onExport={(id) => exportPDF(id)}
              onCreateNew={() => {
                setActiveTab("builder");
              }}
            />
          )}

          {activeTab === "builder" && (
            <div className="text-center py-12">
              <Plus size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">Report builder interface coming soon</p>
            </div>
          )}

          {activeTab === "executions" && (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">Report execution history coming soon</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="text-center py-12">
              <Settings size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">Report settings coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// REPORTS TAB COMPONENT
// ============================================================================

interface ReportsTabProps {
  reports: Report[];
  isLoading: boolean;
  onDelete: (reportId: string) => void;
  onExecute: (reportId: string) => void;
  onExport: (reportId: string) => void;
  onCreateNew: () => void;
}

function ReportsTab({
  reports,
  isLoading,
  onDelete,
  onExecute,
  onExport,
  onCreateNew,
}: ReportsTabProps) {
  if (isLoading) {
    return <LoadingSkeletons />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Your Reports</h3>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          New Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 mb-4">No reports yet</p>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={onDelete}
              onExecute={onExecute}
              onExport={onExport}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// REPORT CARD COMPONENT
// ============================================================================

interface ReportCardProps {
  report: Report;
  onDelete: (reportId: string) => void;
  onExecute: (reportId: string) => void;
  onExport: (reportId: string) => void;
}

function ReportCard({
  report,
  onDelete,
  onExecute,
  onExport,
}: ReportCardProps) {
  const categoryColors: Record<string, string> = {
    tickets: "bg-blue-100 text-blue-800",
    agents: "bg-purple-100 text-purple-800",
    customers: "bg-green-100 text-green-800",
    sla: "bg-orange-100 text-orange-800",
    revenue: "bg-emerald-100 text-emerald-800",
    custom: "bg-slate-100 text-slate-800",
  };

  const chartColors: Record<string, string> = {
    line: "text-blue-500",
    bar: "text-purple-500",
    pie: "text-green-500",
    table: "text-slate-500",
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-slate-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 text-lg">{report.name}</h4>
          {report.description && (
            <p className="text-sm text-slate-600 mt-1">{report.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              categoryColors[report.category] || categoryColors.custom
            }`}
          >
            {report.category}
          </span>
        </div>
      </div>

      {/* Report Details */}
      <div className="space-y-2 mb-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className={chartColors[report.chartType] || "text-slate-400"} />
          <span>
            {report.chartType.charAt(0).toUpperCase() + report.chartType.slice(1)} Chart
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <span>{report.filters.length} filters</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText size={16} />
          <span>{report.metrics.length} metrics</span>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 mb-4">
        {report.enabled ? (
          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
            Active
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-semibold bg-slate-200 text-slate-700 rounded">
            Inactive
          </span>
        )}
        {report.isTemplate && (
          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
            Template
          </span>
        )}
        {report.schedule && (
          <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded">
            Scheduled
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onExecute(report.id)}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Run Report
        </button>
        <button
          onClick={() => onExport(report.id)}
          className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          title="Export"
        >
          <Download size={18} />
        </button>
        <button
          onClick={() => onDelete(report.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-3"></div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-8 bg-slate-200 rounded"></div>
            <div className="w-10 h-8 bg-slate-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
