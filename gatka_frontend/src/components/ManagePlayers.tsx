import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users, UserPlus, Menu, X, Loader2 } from 'lucide-react';
import { listPlayers, Player } from '../api/api';

interface ManagePlayersProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

export function ManagePlayers({ userEmail, onLogout, onNavigate }: ManagePlayersProps) {
  const [entriesCount, setEntriesCount] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [manageRegDropdownOpen, setManageRegDropdownOpen] = useState(true);
  const [stateReportsDropdownOpen, setStateReportsDropdownOpen] = useState(false);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await listPlayers();
        setPlayers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch players');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.aadhar_no && p.aadhar_no.includes(searchTerm)) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, entriesCount);

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
          <h2 className="text-gray-400 text-sm">Gatka Federation of Maharashtra</h2>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm">{userEmail}</span>
          </div>
        </div>

        <nav className="mt-4">
          <a
            href="#"
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </a>
          <div
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white cursor-pointer"
            onClick={() => setManageRegDropdownOpen(!manageRegDropdownOpen)}
          >
            <UserPlus className="w-5 h-5" />
            Manage Registrations
            {manageRegDropdownOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </div>
          {manageRegDropdownOpen && (
            <div className="bg-gray-800">
              <a
                href="#"
                className="block px-6 py-3 pl-14 bg-blue-700 text-white"
                onClick={() => onNavigate && onNavigate('players')}
              >
                Players
              </a>
              <a
                href="#"
                className="block px-6 py-3 pl-14 text-gray-300 hover:bg-gray-800 transition-colors"
                onClick={() => onNavigate && onNavigate('registrations')}
              >
                Players Registration
              </a>
            </div>
          )}
          <div
            className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => setStateReportsDropdownOpen(!stateReportsDropdownOpen)}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            State Reports
            {stateReportsDropdownOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </div>
          {stateReportsDropdownOpen && (
            <div className="bg-gray-800">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate('summary-sheet');
                }}
                className="block px-6 py-3 pl-14 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Summary Sheet Print
              </a>
            </div>
          )}
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
            <h1 className="text-gray-800">Manage Players</h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline" onClick={() => onNavigate && onNavigate('dashboard')}>Dashboard</a>
              <span className="mx-2">/</span>
              <span>Manage Players</span>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add Player Button and Stats */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <button
              onClick={() => onNavigate && onNavigate('add-player')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
            >
              Add Player
            </button>
            <div className="bg-green-600 text-white px-6 py-2 rounded">
              <span className="mr-4">Total Players: {players.length}</span>
              <span className="mr-4">Boys: {players.filter(p => p.gender.toLowerCase() === 'male').length}</span>
              <span>Girls: {players.filter(p => p.gender.toLowerCase() === 'female').length}</span>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm">Show</span>
                <select
                  value={entriesCount}
                  onChange={(e) => setEntriesCount(Number(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-gray-700 text-sm">entries</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm">Search:</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Sr No</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Profile Pic</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Registration No</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Father Name</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Mother Name</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Date of Birth</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Gender</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Aadhar No</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Marital Status</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Phone No</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">Whatsapp No</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase">T-Shirt Size</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-8 text-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-8 text-center text-gray-500">
                        No players added yet
                      </td>
                    </tr>
                  ) : (
                    filteredPlayers.map((player, index) => (
                      <tr key={player.id} className="hover:bg-gray-50 border-b">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 text-center">
                           {player.passport_photo_path ? (
                             <img src={player.passport_photo_path} alt="profile" className="w-8 h-8 rounded-full object-cover inline-block" />
                           ) : 'No Pic'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">REG-{player.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{player.full_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.father_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.mother_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.date_of_birth}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.gender}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.aadhar_no || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.marital_status || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.email || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.phone_no || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.whatsapp_no || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.t_shirt_size || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                Showing {filteredPlayers.length > 0 ? 1 : 0} to {filteredPlayers.length} of {players.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  disabled
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-400 cursor-not-allowed"
                >
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  1
                </button>
                <button
                  disabled
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-400 cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}