'use client';

import React, { useState } from 'react';
import { Download, Upload, FileJson, FileText } from 'lucide-react';
import {
  useExportToCSV,
  useExportToJSON,
  useImportFromCSV,
  useImportFromJSON,
  useDownloadCSV,
  useDownloadJSON,
} from '@/hooks/useImportExport';
import { ENTITY_TYPES } from '@/types/customFields';

interface DataImportExportProps {
  teamId: string;
  userId: string;
}

export function DataImportExport({
  teamId,
  userId,
}: DataImportExportProps): React.ReactElement {
  const [selectedEntityType, setSelectedEntityType] = useState<string>('contacts');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const exportToCSVMutation = useExportToCSV(teamId);
  const exportToJSONMutation = useExportToJSON(teamId);
  const importFromCSVMutation = useImportFromCSV(teamId);
  const importFromJSONMutation = useImportFromJSON(teamId);
  const downloadCSVMutation = useDownloadCSV();
  const downloadJSONMutation = useDownloadJSON();

  const handleExport = async (): Promise<void> => {
    try {
      if (exportFormat === 'csv') {
        const csvContent = await exportToCSVMutation.mutateAsync({
          entityType: selectedEntityType,
        });

        await downloadCSVMutation.mutateAsync({
          content: csvContent,
          filename: `${selectedEntityType}-${new Date().toISOString().split('T')[0]}.csv`,
        });
      } else {
        const jsonContent = await exportToJSONMutation.mutateAsync({
          entityType: selectedEntityType,
        });

        await downloadJSONMutation.mutateAsync({
          content: jsonContent,
          filename: `${selectedEntityType}-${new Date().toISOString().split('T')[0]}.json`,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleImport = async (): Promise<void> => {
    if (!importFile) {
      alert('Please select a file');
      return;
    }

    try {
      const fileContent = await importFile.text();

      if (importFormat === 'csv') {
        const result = await importFromCSVMutation.mutateAsync({
          entityType: selectedEntityType,
          csvContent: fileContent,
          userId,
        });
        setImportStatus(result);
      } else {
        const result = await importFromJSONMutation.mutateAsync({
          entityType: selectedEntityType,
          jsonContent: fileContent,
          userId,
        });
        setImportStatus(result);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Export Section */}
      <div className="rounded-lg border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Export Data
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Export your data to CSV or JSON format
          </p>
        </div>

        <div className="space-y-4">
          {/* Entity Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Entity Type
            </label>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </option>
              ))}
            </select>
          </div>

          {/* Export Format Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Format
            </label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv')}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <FileText className="mr-1 h-4 w-4" />
                  CSV
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as 'json')}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <FileJson className="mr-1 h-4 w-4" />
                  JSON
                </span>
              </label>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={
              exportToCSVMutation.isPending || exportToJSONMutation.isPending
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <Download className="h-4 w-4" />
            {exportToCSVMutation.isPending || exportToJSONMutation.isPending
              ? 'Exporting...'
              : 'Export'}
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="rounded-lg border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Import Data
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Import data from CSV or JSON files
          </p>
        </div>

        <div className="space-y-4">
          {/* Entity Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Entity Type
            </label>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </option>
              ))}
            </select>
          </div>

          {/* Import Format Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Format
            </label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={importFormat === 'csv'}
                  onChange={(e) => setImportFormat(e.target.value as 'csv')}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <FileText className="mr-1 h-4 w-4" />
                  CSV
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="json"
                  checked={importFormat === 'json'}
                  onChange={(e) => setImportFormat(e.target.value as 'json')}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <FileJson className="mr-1 h-4 w-4" />
                  JSON
                </span>
              </label>
            </div>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Select File
            </label>
            <input
              type="file"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              accept={importFormat === 'csv' ? '.csv' : '.json'}
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={
              !importFile ||
              importFromCSVMutation.isPending ||
              importFromJSONMutation.isPending
            }
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
          >
            <Upload className="h-4 w-4" />
            {importFromCSVMutation.isPending || importFromJSONMutation.isPending
              ? 'Importing...'
              : 'Import'}
          </button>
        </div>

        {/* Import Status */}
        {importStatus && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  Import Results
                </h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-green-600 dark:text-green-400">
                    ✓ Successful: {importStatus.success}
                  </p>
                  {importStatus.failed > 0 && (
                    <p className="text-red-600 dark:text-red-400">
                      ✗ Failed: {importStatus.failed}
                    </p>
                  )}
                </div>

                {importStatus.errors.length > 0 && (
                  <div className="mt-3 max-h-48 overflow-y-auto rounded bg-white p-2 dark:bg-slate-900">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Errors:
                    </p>
                    <ul className="mt-1 space-y-1">
                      {importStatus.errors.slice(0, 10).map((error, index) => (
                        <li
                          key={index}
                          className="text-xs text-red-600 dark:text-red-400"
                        >
                          • {error}
                        </li>
                      ))}
                    </ul>
                    {importStatus.errors.length > 10 && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        ... and {importStatus.errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
