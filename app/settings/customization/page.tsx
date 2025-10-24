'use client';

import React, { useState } from 'react';
import { Settings, Database, FileUp, Zap } from 'lucide-react';
import { CustomFieldsBuilder } from '@/components/features/customFields/CustomFieldsBuilder';
import { DataImportExport } from '@/components/features/customFields/DataImportExport';
import { useAuth } from '@/hooks/useAuth';

export default function CustomizationPage(): React.ReactElement {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'fields' | 'import-export' | 'sync'
  >('fields');

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  const teamId = user.teamId;

  const tabs = [
    {
      id: 'fields' as const,
      label: 'Custom Fields',
      icon: Settings,
      description: 'Create and manage custom fields for your entities',
    },
    {
      id: 'import-export' as const,
      label: 'Import/Export',
      icon: FileUp,
      description: 'Import and export your data in CSV or JSON format',
    },
    {
      id: 'sync' as const,
      label: 'Data Sync',
      icon: Database,
      description: 'Manage Firestore synchronization settings',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Customization & Data Management
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Configure custom fields, manage data synchronization, and handle imports/exports
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900 dark:shadow-lg">
          {/* Custom Fields Tab */}
          {activeTab === 'fields' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Custom Fields Management
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Create custom fields for contacts, tickets, agents, companies, and deals.
                  These fields will be available across your application for storing
                  additional information.
                </p>
              </div>
              <CustomFieldsBuilder teamId={teamId} userId={user.id} />
            </div>
          )}

          {/* Import/Export Tab */}
          {activeTab === 'import-export' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Data Import & Export
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Export your data to backup or migrate to other systems. Import data from
                  CSV or JSON files to bulk update your entities.
                </p>
              </div>
              <DataImportExport teamId={teamId} userId={user.id} />
            </div>
          )}

          {/* Data Sync Tab */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Data Synchronization
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Monitor and manage Firestore data synchronization. All your data is
                  automatically synced to Firestore for real-time updates and offline access.
                </p>
              </div>

              {/* Sync Status Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Auto Sync Card */}
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        Auto Synchronization
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Automatically sync changes to Firestore
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="peer sr-only h-6 w-11 appearance-none rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] checked:bg-blue-600 checked:after:translate-x-full peer-focus:outline-none dark:bg-slate-600 dark:checked:bg-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300" />
                    </label>
                  </div>
                </div>

                {/* Backup Card */}
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        Daily Backups
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Enable automatic daily backups of your data
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="peer sr-only h-6 w-11 appearance-none rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] checked:bg-blue-600 checked:after:translate-x-full peer-focus:outline-none dark:bg-slate-600 dark:checked:bg-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Info Message */}
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ Your data is continuously synchronized with Firestore. This ensures that
                  all your information is backed up and accessible in real-time across all
                  devices and team members.
                </p>
              </div>

              {/* Sync Statistics */}
              <div className="space-y-3">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  Sync Statistics
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      label: 'Total Records',
                      value: '2,348',
                      change: '+125 this week',
                    },
                    {
                      label: 'Contacts',
                      value: '842',
                      change: '+45 synced',
                    },
                    {
                      label: 'Tickets',
                      value: '1,156',
                      change: '+89 synced',
                    },
                    {
                      label: 'Last Sync',
                      value: 'Just now',
                      change: 'Real-time',
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collection Info */}
              <div className="space-y-3">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  Collection Structure
                </h3>
                <div className="space-y-2 rounded-lg bg-slate-50 p-4 font-mono text-sm dark:bg-slate-800">
                  <div className="text-slate-700 dark:text-slate-300">
                    <span className="text-blue-600 dark:text-blue-400">teams/</span>
                    <span className="ml-2 text-slate-700 dark:text-slate-300">
                      ← Team data containers
                    </span>
                  </div>
                  <div className="ml-4 text-slate-700 dark:text-slate-300">
                    <span className="text-blue-600 dark:text-blue-400">
                      ├─ {'{teamId}'}
                    </span>
                  </div>
                  <div className="ml-8 text-slate-700 dark:text-slate-300">
                    <span className="text-green-600 dark:text-green-400">
                      ├─ contacts/
                    </span>
                    <span className="ml-2 text-slate-600 dark:text-slate-400">
                      (your contacts)
                    </span>
                  </div>
                  <div className="ml-8 text-slate-700 dark:text-slate-300">
                    <span className="text-green-600 dark:text-green-400">
                      ├─ tickets/
                    </span>
                    <span className="ml-2 text-slate-600 dark:text-slate-400">
                      (your tickets)
                    </span>
                  </div>
                  <div className="ml-8 text-slate-700 dark:text-slate-300">
                    <span className="text-green-600 dark:text-green-400">
                      ├─ agents/
                    </span>
                    <span className="ml-2 text-slate-600 dark:text-slate-400">
                      (your agents)
                    </span>
                  </div>
                  <div className="ml-8 text-slate-700 dark:text-slate-300">
                    <span className="text-green-600 dark:text-green-400">
                      └─ companies/
                    </span>
                    <span className="ml-2 text-slate-600 dark:text-slate-400">
                      (your companies)
                    </span>
                  </div>
                  <div className="mt-2 text-slate-700 dark:text-slate-300">
                    <span className="text-blue-600 dark:text-blue-400">global/</span>
                    <span className="ml-2 text-slate-600 dark:text-slate-400">
                      ← Global cross-team access
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            💡 Pro Tips
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>
              • Use custom fields to add team-specific information to your entities
            </li>
            <li>
              • Export data regularly as backups and for integration with other tools
            </li>
            <li>
              • Import data in bulk to quickly set up your CRM with existing customer
              information
            </li>
            <li>
              • All data is automatically synced to Firestore for secure backup and
              real-time access
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
