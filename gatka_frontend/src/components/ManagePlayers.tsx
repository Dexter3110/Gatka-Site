import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users, UserPlus, Menu, X } from 'lucide-react';
import { listPlayers, type Player } from '../api/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ManagePlayersProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

export function ManagePlayers({ userEmail, onLogout, onNavigate }: ManagePlayersProps) {
  const [entriesCount, setEntriesCount]           = useState(10);
  const [searchTerm, setSearchTerm]               = useState('');
  const [sidebarOpen, setSidebarOpen]             = useState(false);
  const [manageRegDropdownOpen, setManageRegDropdownOpen] = useState(true);
  const [stateReportsDropdownOpen, setStateReportsDropdownOpen] = useState(false);

  // ── Data state ──────────────────────────────────────────────
  const [players, setPlayers]     = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg]   = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch players on mount ───────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    listPlayers()
      .then(data => {
        setPlayers(data);
        setErrorMsg('');
      })
      .catch(err => setErrorMsg(err.message || 'Failed to load players.'))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Client-side search filter ────────────────────────────────
  const filtered = players.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.father_name?.toLowerCase().includes(q) ||
      p.aadhar_no?.toLowerCase().includes(q) ||
      p.phone_no?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  // ── Pagination ───────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesCount));
  const start      = (currentPage - 1) * entriesCount;
  const pageRows   = filtered.slice(start, start + entriesCount);
  const showFrom   = filtered.length === 0 ? 0 : start + 1;
  const showTo     = Math.min(start + entriesCount, filtered.length);

  // ── Stats ────────────────────────────────────────────────────
  const totalBoys  = players.filter(p => p.gender === 'male').length;
  const totalGirls = players.filter(p => p.gender === 'female').length;

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded">
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* ── Sidebar ── */}
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
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('dashboard'); }}
            className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </a>

          <div className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white cursor-pointer"
            onClick={() => setManageRegDropdownOpen(!manageRegDropdownOpen)}>
            <UserPlus className="w-5 h-5" />
            Manage Registrations
            {manageRegDropdownOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </div>
          {manageRegDropdownOpen && (
            <div className="bg-gray-800">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('players'); }}
                className="block px-6 py-3 pl-14 bg-blue-700 text-white">Players</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('registrations'); }}
                className="block px-6 py-3 pl-14 text-gray-300 hover:bg-gray-700 transition-colors">
                Players Registration
              </a>
            </div>
          )}

          <div className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 cursor-pointer"
            onClick={() => setStateReportsDropdownOpen(!stateReportsDropdownOpen)}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            State Reports
            {stateReportsDropdownOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </div>
          {stateReportsDropdownOpen && (
            <div className="bg-gray-800">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('summary-sheet'); }}
                className="block px-6 py-3 pl-14 text-gray-300 hover:bg-gray-700 transition-colors">
                Summary Sheet Print
              </a>
            </div>
          )}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-6">
          <button onClick={onLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-gray-800">Manage Players</h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline"
                onClick={(e) => { e.preventDefault(); onNavigate?.('dashboard'); }}>Dashboard</a>
              <span className="mx-2">/</span>
              <span>Manage Players</span>
            </nav>
          </div>
        </div>

        <div className="p-6">
          {/* Add Player + Live Stats */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <button onClick={() => onNavigate?.('add-player')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors">
              Add Player
            </button>
            <div className="bg-green-600 text-white px-6 py-2 rounded text-sm">
              <span className="mr-4">Total Players: {players.length}</span>
              <span className="mr-4">Boys: {totalBoys}</span>
              <span>Girls: {totalGirls}</span>
            </div>
          </div>

          {/* Error banner */}
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-400 text-red-700 rounded p-3 text-sm">
              <span>❌</span> {errorMsg}
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm">Show</span>
                <select value={entriesCount}
                  onChange={(e) => { setEntriesCount(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500">
                  {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-gray-700 text-sm">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm">Search:</span>
                <input type="text" value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Sr No','Profile Pic','Reg No','Name','Father Name','Mother Name',
                      'Date of Birth','Gender','Aadhar No','Marital Status','Email',
                      'Phone No','WhatsApp No','T-Shirt Size'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-700 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-10 text-center text-gray-500">
                        <div className="flex justify-center items-center gap-2">
                          <svg className="animate-spin w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                          </svg>
                          Loading players…
                        </div>
                      </td>
                    </tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? 'No players match your search.' : 'No players added yet.'}
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{start + i + 1}</td>
                        <td className="px-4 py-3 border-b border-gray-100">
                          {p.passport_photo_path ? (
                            <img
                              src={`${BASE_URL}/uploads/${p.passport_photo_path}`}
                              alt={p.full_name}
                              className="w-10 h-10 object-cover rounded-full border border-gray-300"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{p.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap">{p.full_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap">{p.father_name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap">{p.mother_name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap">{p.date_of_birth}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 capitalize">{p.gender}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{p.aadhar_no ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 capitalize">{p.marital_status ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{p.email ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{p.phone_no ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{p.whatsapp_no ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 uppercase">{p.t_shirt_size ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                {filtered.length === 0
                  ? 'Showing 0 to 0 of 0 entries'
                  : `Showing ${showFrom} to ${showTo} of ${filtered.length} entries`}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded text-sm ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border rounded text-sm ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
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