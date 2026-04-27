import React, { useState, useEffect } from 'react';
import { Menu, X, Users, Trophy, FileText, UserPlus, PlusCircle, Settings, BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { listUsers, listCompetitions, listPlayers, listRegistrations } from '../api/api';
import type { User, Competition, Player, Registration } from '../api/api';

interface AdminDashboardProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ userEmail, onLogout, onNavigate }: AdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Live data state
  const [users, setUsers] = useState<User[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [usersData, compsData, playersData, regsData] = await Promise.all([
          listUsers(),
          listCompetitions(),
          listPlayers(),
          listRegistrations(),
        ]);
        setUsers(usersData);
        setCompetitions(compsData);
        setPlayers(playersData);
        setRegistrations(regsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute live stats
  const activeCompetitions = competitions.filter(c => c.status === 'active' || c.status === 'upcoming');
  const totalRegistrations = registrations.length;

  const stats = [
    { title: 'Total Users', value: users.length.toString(), icon: Users, color: 'bg-blue-500' },
    { title: 'Active Competitions', value: activeCompetitions.length.toString(), icon: Trophy, color: 'bg-green-500' },
    { title: 'Total Players', value: players.length.toString(), icon: Users, color: 'bg-purple-500' },
    { title: 'Total Registrations', value: totalRegistrations.toString(), icon: FileText, color: 'bg-orange-500' },
  ];

  // Recent competitions (last 5, sorted by start date descending)
  const recentCompetitions = [...competitions]
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .slice(0, 5);

  // Recent users (last 5, sorted by created_at descending)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

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
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-red-800 text-sm font-medium">Failed to load data</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.title}</p>
                    {loading ? (
                      <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                    ) : (
                      <p className="text-gray-800 mt-1 text-2xl">{stat.value}</p>
                    )}
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
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-200 rounded animate-pulse" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : recentCompetitions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No competitions found
                        </td>
                      </tr>
                    ) : (
                      recentCompetitions.map((comp) => {
                        const compRegs = registrations.filter(r => r.competition_id === comp.id);
                        return (
                          <tr key={comp.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-800">{comp.name}</div>
                              <div className="text-xs text-gray-500">Starts: {formatDate(comp.start_date)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${comp.status === 'active' ? 'bg-green-100 text-green-800' :
                                  comp.status === 'upcoming' ? 'bg-orange-100 text-orange-800' :
                                    comp.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                      'bg-red-100 text-red-800'
                                }`}>
                                {comp.status.charAt(0).toUpperCase() + comp.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {compRegs.length}
                            </td>
                          </tr>
                        );
                      })
                    )}
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
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : recentUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      recentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-800">{user.full_name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                              }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
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
