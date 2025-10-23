'use client';

import { useState } from 'react';
import { usePortalTickets, useCustomerDashboardStats, usePortalNotifications } from '@/hooks/usePortal';
import { Menu, X, Home, Ticket, MessageSquare, Settings, LogOut, Bell } from 'lucide-react';

export default function PortalDashboard({
  teamId,
  portalUserId,
  portalUserName,
  onLogout,
}: {
  teamId: string;
  portalUserId: string;
  portalUserName?: string;
  onLogout?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'messages' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: tickets } = usePortalTickets(teamId, portalUserId);
  const { data: stats, isLoading: statsLoading } = useCustomerDashboardStats(teamId, portalUserId);
  const { data: notifications } = usePortalNotifications(teamId, portalUserId, false, true);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-600">Customer Portal</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <NavLink
            icon={<Home size={20} />}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavLink
            icon={<Ticket size={20} />}
            label="My Tickets"
            active={activeTab === 'tickets'}
            onClick={() => setActiveTab('tickets')}
            badge={tickets?.length}
          />
          <NavLink
            icon={<MessageSquare size={20} />}
            label="Messages"
            active={activeTab === 'messages'}
            onClick={() => setActiveTab('messages')}
          />
          <NavLink
            icon={<Settings size={20} />}
            label="Settings"
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'tickets' && 'My Tickets'}
              {activeTab === 'messages' && 'Messages'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications?.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">No notifications</div>
                    ) : (
                      notifications?.map(notif => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                            !notif.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {portalUserName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{portalUserName || 'User'}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView teamId={teamId} portalUserId={portalUserId} stats={stats} statsLoading={statsLoading} />
          )}

          {activeTab === 'tickets' && (
            <div className="p-6">
              <div className="space-y-4">
                {tickets?.map(ticket => (
                  <div key={ticket.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">#{ticket.ticketId}</p>
                        <div className="flex gap-2 mt-3">
                          <span className={`text-xs px-2 py-1 rounded ${
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{ticket.progress}%</p>
                        <div className="w-24 h-2 bg-gray-200 rounded mt-2">
                          <div 
                            className="h-full bg-blue-500 rounded" 
                            style={{ width: `${ticket.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!tickets || tickets.length === 0 && (
                  <div className="text-center py-12">
                    <Ticket className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-600">No tickets yet. Create one to get started!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="p-6">
              <div className="bg-white rounded-lg p-8 text-center">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Messages Coming Soon</h3>
                <p className="text-gray-600">Direct messaging with support team will be available soon</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 max-w-2xl">
              <div className="bg-white rounded-lg p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Theme</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Language</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm text-gray-900">Email notifications for ticket updates</span>
                  </label>
                </div>

                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ======================== COMPONENTS ========================

function NavLink({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition ${
        active
          ? 'bg-blue-50 text-blue-600 font-medium'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

interface DashboardViewProps {
  teamId: string;
  portalUserId: string;
  stats?: any;
  statsLoading: boolean;
}

function DashboardView({ stats, statsLoading }: DashboardViewProps) {
  if (statsLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Tickets"
          value={stats?.totalTickets || 0}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          label="Open Tickets"
          value={stats?.openTickets || 0}
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
        />
        <StatCard
          label="Resolved"
          value={stats?.resolvedTickets || 0}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          label="Avg Resolution"
          value={`${stats?.averageResolutionTime || 0}h`}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">💡 Quick Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Track all your support tickets in one place</li>
          <li>• Add comments and attach files to any ticket</li>
          <li>• Check ticket status and SLA information</li>
          <li>• Provide feedback after ticket resolution</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  bgColor,
  textColor,
}: {
  label: string;
  value: string | number;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-6`}>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}
