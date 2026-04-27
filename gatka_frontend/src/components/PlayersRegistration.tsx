import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users, UserPlus, Menu, X } from 'lucide-react';
import {
  listRegistrations,
  listCompetitions,
  type Registration,
  type Competition,
} from '../api/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob: string): number {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlayersRegistrationProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlayersRegistration({ userEmail, onLogout, onNavigate }: PlayersRegistrationProps) {
  const [sidebarOpen, setSidebarOpen]                     = useState(false);
  const [manageRegDropdownOpen, setManageRegDropdownOpen] = useState(true);
  const [stateReportsDropdownOpen, setStateReportsDropdownOpen] = useState(false);

  // Filter state
  const [competitions, setCompetitions]         = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [selectedEventGroup, setSelectedEventGroup] = useState('');
  const [selectedEvent, setSelectedEvent]       = useState('');

  // Table state
  const [registrations, setRegistrations]   = useState<Registration[]>([]);
  const [filtered, setFiltered]             = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm]         = useState('');
  const [entriesCount, setEntriesCount]     = useState(10);
  const [currentPage, setCurrentPage]       = useState(1);

  // Loading / error state  (Task 5 pattern)
  const [isLoading, setIsLoading]   = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');

  // ── Load competitions on mount ─────────────────────────────────────────────

  useEffect(() => {
    listCompetitions()
      .then(setCompetitions)
      .catch(() => {/* competitions are optional for filter — silent fail */});
  }, []);

  // ── Fetch registrations when competition is selected ──────────────────────

  const handleFilter = async () => {
    if (!selectedCompetition) {
      setErrorMsg('Please select a competition first.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    try {
      const data = await listRegistrations({
        competition_id: Number(selectedCompetition),
      });
      setRegistrations(data);
      setCurrentPage(1);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load registrations.');
      setRegistrations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedCompetition('');
    setSelectedAgeGroup('');
    setSelectedEventGroup('');
    setSelectedEvent('');
    setRegistrations([]);
    setFiltered([]);
    setSearchTerm('');
    setCurrentPage(1);
    setErrorMsg('');
  };

  // ── Client-side filter + search ───────────────────────────────────────────

  useEffect(() => {
    let rows = [...registrations];

    if (selectedAgeGroup) {
      rows = rows.filter(r => r.age_category === selectedAgeGroup);
    }
    if (selectedEventGroup) {
      rows = rows.filter(r => r.event_group === selectedEventGroup);
    }
    if (selectedEvent) {
      rows = rows.filter(r => r.event_name === selectedEvent);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(r =>
        r.player.full_name.toLowerCase().includes(q) ||
        r.player.father_name?.toLowerCase().includes(q) ||
        r.player.aadhar_no?.toLowerCase().includes(q) ||
        r.player.phone_no?.toLowerCase().includes(q)
      );
    }

    setFiltered(rows);
    setCurrentPage(1);
  }, [registrations, selectedAgeGroup, selectedEventGroup, selectedEvent, searchTerm]);

  // ── Pagination ────────────────────────────────────────────────────────────

  const totalPages  = Math.max(1, Math.ceil(filtered.length / entriesCount));
  const start       = (currentPage - 1) * entriesCount;
  const pageRows    = filtered.slice(start, start + entriesCount);
  const showFrom    = filtered.length === 0 ? 0 : start + 1;
  const showTo      = Math.min(start + entriesCount, filtered.length);

  // ── Render ────────────────────────────────────────────────────────────────

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
                className="block px-6 py-3 pl-14 text-gray-300 hover:bg-gray-700 transition-colors">Players</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('registrations'); }}
                className="block px-6 py-3 pl-14 bg-blue-700 text-white">Players Registration</a>
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
            <h1 className="text-gray-800">Players Registration</h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline"
                onClick={(e) => { e.preventDefault(); onNavigate?.('dashboard'); }}>Dashboard</a>
              <span className="mx-2">/</span>
              <span>Players Registration</span>
            </nav>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-800 mb-4">Players Registration</h2>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Note:</span> Select a competition and click the{' '}
                <span className="font-semibold">Filter</span> button to load registered players.
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-400 text-red-700 rounded p-3 text-sm">
                <span>❌</span> {errorMsg}
              </div>
            )}

            {/* ── Filter Section ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

              {/* Competition — populated from API */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Select Competition <span className="text-red-500">*</span>
                </label>
                <select value={selectedCompetition}
                  onChange={(e) => setSelectedCompetition(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                  <option value="">Select Competition</option>
                  {competitions.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Age Group — populated from selected competition's age_categories */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Select Age Group
                </label>
                <select value={selectedAgeGroup}
                  onChange={(e) => setSelectedAgeGroup(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                  <option value="">All Age Groups</option>
                  {competitions
                    .find(c => String(c.id) === selectedCompetition)
                    ?.age_categories.map(ac => (
                      <option key={ac.id} value={ac.category_name}>{ac.category_name}</option>
                    ))}
                </select>
              </div>

              {/* Event Group */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Select Event Group</label>
                <select value={selectedEventGroup}
                  onChange={(e) => setSelectedEventGroup(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                  <option value="">All Event Groups</option>
                  {[...new Set(registrations.map(r => r.event_group).filter(Boolean))].map(eg => (
                    <option key={eg} value={eg!}>{eg}</option>
                  ))}
                </select>
              </div>

              {/* Event */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Select Event</label>
                <select value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                  <option value="">All Events</option>
                  {[...new Set(registrations.map(r => r.event_name).filter(Boolean))].map(ev => (
                    <option key={ev} value={ev!}>{ev}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter / Reset buttons */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleFilter} disabled={isLoading}
                className={`px-6 py-2 rounded text-white transition-colors flex items-center gap-2 ${isLoading ? 'bg-cyan-300 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-600'}`}>
                {isLoading && (
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {isLoading ? 'Loading...' : 'Filter'}
              </button>
              <button onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors">
                Reset
              </button>
            </div>

            {/* ── Table Controls ── */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show</span>
                <select value={entriesCount}
                  onChange={(e) => { setEntriesCount(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-300 rounded px-3 py-1 text-sm">
                  {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Search:</span>
                <input type="text" value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            {/* ── Table ── */}
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Sr No','Image','Reg No','Student Name','Father Name','Mother Name','Age','Gender','DOB','Aadhar No','Phone No','Email','District','Participating In'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-10 text-center text-gray-500">
                        <div className="flex justify-center items-center gap-2">
                          <svg className="animate-spin w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Loading registrations…
                        </div>
                      </td>
                    </tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-8 text-center text-gray-500 border-b border-gray-200">
                        {registrations.length === 0
                          ? 'Select a competition and click Filter to view registrations.'
                          : 'No records match the current filters.'}
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((reg, i) => (
                      <tr key={reg.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{start + i + 1}</td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          {reg.player.passport_photo_path ? (
                            <img
                              src={`${BASE_URL}/uploads/${reg.player.passport_photo_path}`}
                              alt={reg.player.full_name}
                              className="w-10 h-10 object-cover rounded-full border border-gray-300"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{reg.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 whitespace-nowrap">{reg.player.full_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 whitespace-nowrap">{reg.player.father_name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 whitespace-nowrap">{reg.player.mother_name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{calcAge(reg.player.date_of_birth)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 capitalize">{reg.player.gender}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 whitespace-nowrap">{reg.player.date_of_birth}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{reg.player.aadhar_no ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{reg.player.phone_no ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{reg.player.email ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{reg.player.area?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{reg.event_name ?? reg.age_category ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
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
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border rounded text-sm ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Next
                </button>
              </div>
            </div>

            <div className="mt-6">
              <button className="bg-green-500 text-white px-6 py-2 rounded cursor-default">
                Applications Locked
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}