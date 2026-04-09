import React, { useState } from 'react';
import { Menu, X, Users, Trophy, FileText, UserPlus, PlusCircle, Settings, Lock, BarChart3 } from 'lucide-react';

interface AdminDashboardProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ userEmail, onLogout, onNavigate }: AdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data for admin stats
  const stats = [
    { title: 'Total Users', value: '45', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Competitions', value: '3', icon: Trophy, color: 'bg-green-500' },
    { title: 'Total Players', value: '128', icon: Users, color: 'bg-purple-500' },
    { title: 'Pending Approvals', value: '12', icon: FileText, color: 'bg-orange-500' },
  ];

  // Mock competitions data
  const competitions = [
    { id: 1, name: '9th SENIOR NATIONAL GATKA CHAMPIONSHIP 2025', status: 'Active', participants: 89, startDate: '28 Dec 2025' },
    { id: 2, name: '5th JUNIOR NATIONAL GATKA CHAMPIONSHIP 2025', status: 'Active', participants: 67, startDate: '15 Jan 2025' },
    { id: 3, name: '3rd STATE LEVEL GATKA CHAMPIONSHIP 2025', status: 'Upcoming', participants: 0, startDate: '10 Feb 2025' },
  ];

  // Mock recent users
  const recentUsers = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@gatka.com', role: 'User', status: 'Active', joinDate: '2 Apr 2026' },
    { id: 2, name: 'Priya Singh', email: 'priya@gatka.com', role: 'User', status: 'Active', joinDate: '1 Apr 2026' },
    { id: 3, name: 'Amit Patel', email: 'amit@gatka.com', role: 'User', status: 'Pending', joinDate: '31 Mar 2026' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-gray-900 text-white w-64 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-40`}>
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-gray-400 text-sm">Admin Panel</h2>
          <p className="text-white mt-1">Gatka Federation</p>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Admin</p>
              <span className="text-sm">{userEmail}</span>
            </div>
          </div>
        </div>

        <nav className="mt-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('admin-dashboard');
            }}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('manage-competitions');
            }}
            className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Trophy className="w-5 h-5" />
            Manage Competitions
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('manage-users');
            }}
            className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Users className="w-5 h-5" />
            Manage Users
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('admin-settings');
            }}
            className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-6">
          <button
            onClick={onLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-gray-800">Admin Dashboard</h1>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.title}</p>
                    <p className="text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => onNavigate('add-competition')}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Add New Competition
              </button>
              <button
                onClick={() => onNavigate('add-user')}
                className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Add New User
              </button>
              <button
                onClick={() => onNavigate('manage-competitions')}
                className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg transition-colors"
              >
                <Trophy className="w-5 h-5" />
                View All Competitions
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competitions Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-gray-800">Recent Competitions</h2>
                <button
                  onClick={() => onNavigate('manage-competitions')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                        Competition
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                        Participants
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {competitions.map((comp) => (
                      <tr key={comp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">{comp.name}</div>
                          <div className="text-xs text-gray-500">Starts: {comp.startDate}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                            comp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {comp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {comp.participants}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-gray-800">Recent Users</h2>
                <button
                  onClick={() => onNavigate('manage-users')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {user.role}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
