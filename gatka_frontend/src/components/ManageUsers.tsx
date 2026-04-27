import React, { useState, useEffect } from 'react';
import { Menu, X, Users, Trophy, Edit2, Trash2, Search, Plus } from 'lucide-react';
import { listUsers, deleteUser, updateUser, type User } from '../api/api';

interface ManageUsersProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export function ManageUsers({ userEmail, onLogout, onNavigate }: ManageUsersProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Live data ────────────────────────────────────────────────
  const [users, setUsers]           = useState<User[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [errorMsg, setErrorMsg]     = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ── Fetch on mount ───────────────────────────────────────────
  useEffect(() => {
    fetchUsers();
  }, []);

  function fetchUsers() {
    setIsLoading(true);
    setErrorMsg('');
    listUsers()
      .then(data => setUsers(data))
      .catch(err => setErrorMsg(err.message || 'Failed to load users.'))
      .finally(() => setIsLoading(false));
  }

  // ── Delete user ──────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setSuccessMsg('User deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete user.');
    }
  };

  // ── Toggle active/inactive ────────────────────────────────────
  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    try {
      const updated = await updateUser(id, { is_active: !currentStatus });
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update user status.');
    }
  };

  // ── Edit — navigate to edit page ─────────────────────────────
  const handleEdit = (id: number) => {
    onNavigate(`edit-user?id=${id}`);
  };

  // ── Search filter ────────────────────────────────────────────
  const filtered = users.filter(u =>
    !searchQuery.trim() ||
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.area?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded">
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
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Admin</p>
              <span className="text-sm">{userEmail}</span>
            </div>
          </div>
        </div>

        <nav className="mt-4">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('admin-dashboard'); }}
            className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors">
            <Trophy className="w-5 h-5" /> Dashboard
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('manage-competitions'); }}
            className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors">
            <Trophy className="w-5 h-5" /> Manage Competitions
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('manage-users'); }}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white">
            <Users className="w-5 h-5" /> Manage Users
          </a>
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-6">
          <button onClick={onLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-gray-800">Manage Users</h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline"
                onClick={(e) => { e.preventDefault(); onNavigate('admin-dashboard'); }}>Dashboard</a>
              <span className="mx-2">/</span>
              <span>Manage Users</span>
            </nav>
          </div>
        </div>

        <div className="p-6">
          {/* Banners */}
          {successMsg && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-400 text-green-700 rounded p-3 text-sm">
              ✅ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-400 text-red-700 rounded p-3 text-sm">
              ❌ {errorMsg}
            </div>
          )}

          {/* Search + Add */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search users by name, email, or district..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <button onClick={() => onNavigate('add-user')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-5 h-5" /> Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['User Details','District / Area','Role','Status','Joined','Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        <div className="flex justify-center items-center gap-2">
                          <svg className="animate-spin w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                          </svg>
                          Loading users…
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        {searchQuery ? 'No users match your search.' : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-800">{u.full_name}</div>
                              <div className="text-xs text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {u.area?.name ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                          {u.role}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleStatusToggle(u.id, u.is_active)}
                            title="Click to toggle active/inactive"
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs cursor-pointer transition-colors ${
                              u.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {u.created_at?.split('T')[0] ?? '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(u.id)}
                              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(u.id)}
                              className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live summary stats */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-800 mb-4">Users Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl text-gray-800 mt-1">{users.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl text-gray-800 mt-1">{users.filter(u => u.is_active).length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Inactive Users</p>
                <p className="text-2xl text-gray-800 mt-1">{users.filter(u => !u.is_active).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}