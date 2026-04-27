import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users, UserPlus, ArrowUpDown, Menu, X } from 'lucide-react';
import { listPlayers, listCompetitions, listRegistrations, type Competition } from '../api/api';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
  isAdmin?: boolean;
}

interface CompetitionRow {
  id: number;
  name: string;
  total: number;
  boys: number;
  girls: number;
}

export function Dashboard({ userEmail, onLogout, onNavigate, isAdmin }: DashboardProps) {
  const [entriesCount, setEntriesCount]   = useState(10);
  const [searchTerm, setSearchTerm]       = useState('');
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [manageRegDropdownOpen, setManageRegDropdownOpen]     = useState(false);
  const [stateReportsDropdownOpen, setStateReportsDropdownOpen] = useState(false);

  // ── Live stats ──────────────────────────────────────────────
  const [totalPlayers, setTotalPlayers]           = useState(0);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [competitionRows, setCompetitionRows]     = useState<CompetitionRow[]>([]);
  const [isLoading, setIsLoading]                 = useState(true);
  const [errorMsg, setErrorMsg]                   = useState('');

  useEffect(() => {
    setIsLoading(true);
    setErrorMsg('');

    Promise.all([
      listPlayers(),
      listCompetitions(),
      listRegistrations(),
    ])
      .then(([players, competitions, registrations]) => {
        setTotalPlayers(players.length);
        setTotalRegistrations(registrations.length);

        // Build per-competition registration summary
        const rows: CompetitionRow[] = competitions.map(comp => {
          const compRegs = registrations.filter(r => r.competition_id === comp.id);
          return {
            id:    comp.id,
            name:  comp.name,
            total: compRegs.length,
            boys:  compRegs.filter(r => r.player.gender === 'male').length,
            girls: compRegs.filter(r => r.player.gender === 'female').length,
          };
        });
        setCompetitionRows(rows);
      })
      .catch(err => setErrorMsg(err.message || 'Failed to load dashboard data.'))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Client-side search ──────────────────────────────────────
  const filtered = competitionRows.filter(r =>
    !searchTerm.trim() || r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesCount));
  const pageRows   = filtered.slice(0, entriesCount);

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded">
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
          <a href="#" className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </a>

          <div className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 cursor-pointer"
            onClick={() => setManageRegDropdownOpen(!manageRegDropdownOpen)}>
            <UserPlus className="w-5 h-5" />
            Manage Registrations
            {manageRegDropdownOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </div>
          {manageRegDropdownOpen && (
            <div className="bg-gray-800">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('players'); }}
                className="block px-6 py-3 pl-14 text-gray-300 hover:bg-gray-700 transition-colors">Players</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('registrations'); }}
                className="block px-6 py-3 pl-14 text-gray-300 hover:bg-gray-700 transition-colors">Players Registration</a>
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

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-gray-800">Dashboard</h1>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button onClick={() => onNavigate?.('admin-dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Admin Panel
                </button>
              )}
              <nav className="text-sm text-gray-500">
                <a href="#" className="text-blue-600 hover:underline">Home</a>
                <span className="mx-2">/</span>
                <span>Dashboard</span>
              </nav>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Error banner */}
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-400 text-red-700 rounded p-3 text-sm">
              ❌ {errorMsg}
            </div>
          )}

          {/* Stats Cards — live data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-cyan-600 text-white rounded-lg p-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-5xl mb-2">
                  {isLoading ? (
                    <svg className="animate-spin w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : totalPlayers}
                </div>
                <div className="text-sm mb-4">Players</div>
                <button onClick={() => onNavigate?.('players')}
                  className="bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2">
                  View all
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="absolute right-4 top-4 opacity-20">
                <Users className="w-24 h-24" />
              </div>
            </div>

            <div className="bg-yellow-500 text-white rounded-lg p-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-5xl mb-2">
                  {isLoading ? (
                    <svg className="animate-spin w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : totalRegistrations}
                </div>
                <div className="text-sm mb-4">Players Registrations</div>
                <button onClick={() => onNavigate?.('registrations')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2">
                  View all
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="absolute right-4 top-4 opacity-20">
                <UserPlus className="w-24 h-24" />
              </div>
            </div>
          </div>

          {/* Competition registrations table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm">Show</span>
                <select value={entriesCount}
                  onChange={(e) => setEntriesCount(Number(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500">
                  {[10,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-gray-700 text-sm">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm">Search:</span>
                <input type="text" value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase">Sr No</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase">Competition</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase">
                      <div className="flex items-center gap-1">Total Players Registration <ArrowUpDown className="w-4 h-4" /></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase">
                      <div className="flex items-center gap-1">Boys <ArrowUpDown className="w-4 h-4" /></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase">
                      <div className="flex items-center gap-1">Girls <ArrowUpDown className="w-4 h-4" /></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        <div className="flex justify-center items-center gap-2">
                          <svg className="animate-spin w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                          </svg>
                          Loading dashboard data…
                        </div>
                      </td>
                    </tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? 'No competitions match your search.' : 'No competitions scheduled yet.'}
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row, i) => (
                      <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm text-gray-700">{i + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{row.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{row.total}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{row.boys}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{row.girls}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                {filtered.length === 0 ? 'Showing 0 to 0 of 0 entries'
                  : `Showing 1 to ${Math.min(entriesCount, filtered.length)} of ${filtered.length} entries`}
              </div>
              <div className="flex gap-2">
                <button disabled className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-400 cursor-not-allowed">Previous</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
                <button disabled className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-400 cursor-not-allowed">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}