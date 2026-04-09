import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Users, UserPlus, Menu, X } from 'lucide-react';

interface PlayersRegistrationProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

export function PlayersRegistration({ userEmail, onLogout, onNavigate }: PlayersRegistrationProps) {
  const [entriesCount, setEntriesCount] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [manageRegDropdownOpen, setManageRegDropdownOpen] = useState(true);
  const [stateReportsDropdownOpen, setStateReportsDropdownOpen] = useState(false);
  
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [selectedEventGroup, setSelectedEventGroup] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedState, setSelectedState] = useState('Maharashtra');

  const handleFilter = () => {
    // Filter logic would go here
    console.log('Filtering with:', {
      competition: selectedCompetition,
      ageGroup: selectedAgeGroup,
      eventGroup: selectedEventGroup,
      event: selectedEvent,
      state: selectedState
    });
  };

  const handleReset = () => {
    setSelectedCompetition('');
    setSelectedAgeGroup('');
    setSelectedEventGroup('');
    setSelectedEvent('');
    setSelectedState('Maharashtra');
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
            onClick={(e) => {
              e.preventDefault();
              onNavigate && onNavigate('dashboard');
            }}
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
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate('players');
                }}
                className="block px-6 py-3 pl-14 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Players
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate('registrations');
                }}
                className="block px-6 py-3 pl-14 bg-blue-700 text-white"
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
            <h1 className="text-gray-800">Players Registration</h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }}>Dashboard</a>
              <span className="mx-2">/</span>
              <span>Players Registration</span>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-800 mb-4">Players Registration</h2>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Note :</span> Whenever you select/change any option in the dropdown menu click on <span className="font-semibold">filter button</span> . It is <span className="font-semibold">mandatory</span> to click on <span className="font-semibold">filter button</span> when you select/change any option in dropdown .
              </p>
            </div>

            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Select Competition <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCompetition}
                  onChange={(e) => setSelectedCompetition(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Competition</option>
                  <option value="competition1">Competition 1</option>
                  <option value="competition2">Competition 2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Select Age Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedAgeGroup}
                  onChange={(e) => setSelectedAgeGroup(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Age Group</option>
                  <option value="under12">Under 12</option>
                  <option value="under16">Under 16</option>
                  <option value="under18">Under 18</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Select Event Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEventGroup}
                  onChange={(e) => setSelectedEventGroup(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Event Group</option>
                  <option value="group1">Event Group 1</option>
                  <option value="group2">Event Group 2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Select Event <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Event</option>
                  <option value="event1">Event 1</option>
                  <option value="event2">Event 2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Maharashtra"
                  />
                  <button
                    onClick={handleFilter}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded transition-colors"
                  >
                    Filter
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Table Controls */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show</span>
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
                <span className="text-sm text-gray-700">entries</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Search:</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Sr No</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Image</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Registration No</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Father Name</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Mother Name</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Age</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Gender</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Date of Birth</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Aadhar No</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Phone No</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Email</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">State</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700 border-b border-gray-200">Participating In</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={14} className="px-6 py-8 text-center text-gray-500 border-b border-gray-200">
                      No data available in table
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                Showing 0 to 0 of 0 entries
              </div>
              <div className="flex gap-2">
                <button
                  disabled
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-400 cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-400 cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Applications Locked Button */}
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