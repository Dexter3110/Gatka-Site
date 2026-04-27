import React, { useState, useEffect } from 'react';
import { Menu, X, Users, Trophy, Edit2, Trash2, Search, Plus, Loader2 } from 'lucide-react';
import { listCompetitions, deleteCompetition, Competition } from '../api/api';

interface ManageCompetitionsProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export function ManageCompetitions({ userEmail, onLogout, onNavigate }: ManageCompetitionsProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const data = await listCompetitions();
        setCompetitions(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch competitions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this competition?')) {
      try {
        await deleteCompetition(id);
        setCompetitions(competitions.filter(comp => comp.id !== id));
        alert('Competition deleted successfully!');
      } catch (err: any) {
        alert(err.message || 'Failed to delete competition');
      }
    }
  };

  const handleEdit = (id: number) => {
    alert(`Edit competition ${id} (Mock - no backend yet)`);
    // Would navigate to edit page
  };

  const filteredCompetitions = competitions.filter(comp =>
    comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (comp.venue && comp.venue.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              <Users className="w-4 h-4" />
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
            className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Trophy className="w-5 h-5" />
            Dashboard
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('manage-competitions');
            }}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white transition-colors"
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
            <h1 className="text-gray-800">Manage Competitions</h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); onNavigate('admin-dashboard'); }}>Dashboard</a>
              <span className="mx-2">/</span>
              <span>Manage Competitions</span>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search and Add Button */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search competitions by name or venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => onNavigate('add-competition')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Competition
              </button>
            </div>
          </div>

          {/* Competitions Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Competition Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : filteredCompetitions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No competitions found
                      </td>
                    </tr>
                  ) : (
                    filteredCompetitions.map((comp) => (
                      <tr key={comp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">{comp.name}</div>
                          <div className="text-xs text-gray-500 mt-1">Registration Deadline: {comp.registration_deadline || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {comp.venue || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {comp.start_date} {comp.end_date ? `to ${comp.end_date}` : ''}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                            comp.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 
                            comp.status.toLowerCase() === 'upcoming' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {comp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          -
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(comp.id)}
                              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(comp.id)}
                              className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
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

          {/* Stats Summary */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-800 mb-4">Competitions Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active Competitions</p>
                <p className="text-2xl text-gray-800 mt-1">
                  {competitions.filter(c => c.status.toLowerCase() === 'active').length}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Upcoming Competitions</p>
                <p className="text-2xl text-gray-800 mt-1">
                  {competitions.filter(c => c.status.toLowerCase() === 'upcoming').length}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-2xl text-gray-800 mt-1">
                  -
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
