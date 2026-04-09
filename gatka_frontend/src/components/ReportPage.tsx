import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Users, UserPlus, Menu, X, Printer, Lock } from 'lucide-react';
import logoImage from 'figma:asset/56e9d8823c6cc761c45e09ce5421e3f32636cd7d.png';

interface ReportPageProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
  competition?: string;
  district?: string;
  gender?: string;
}

export function ReportPage({ userEmail, onLogout, onNavigate, competition, district, gender }: ReportPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [manageRegDropdownOpen, setManageRegDropdownOpen] = useState(false);
  const [stateReportsDropdownOpen, setStateReportsDropdownOpen] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    console.log('Exporting report...');
  };

  // Competition details mapping - can be extended based on selected competition
  const competitionDetails: Record<string, {
    name: string;
    venue: string;
    dates: string;
  }> = {
    'competition1': {
      name: '9th SENIOR NATIONAL GATKA CHAMPIONSHIP 2025 (MEN & WOMEN)',
      venue: 'Ratwara Sahib, New Chandigarh, Mohali (Punjab)',
      dates: '28-30 December 2025'
    },
    'competition2': {
      name: '5th JUNIOR NATIONAL GATKA CHAMPIONSHIP 2025',
      venue: 'Mumbai, Maharashtra',
      dates: '15-17 January 2025'
    }
  };

  // Get current competition details or use default
  const currentCompetition = competition && competitionDetails[competition] 
    ? competitionDetails[competition]
    : competitionDetails['competition1'];

  // Mock data for different age categories - reordered as requested
  const ageCategories = [
    {
      name: 'Bhujhang (U-11 Years)',
      events: [
        { srNo: 1, event: 'Team Demo', minPlayer: 8, maxPlayer: 11, registered: 'N-A' },
        { srNo: 2, event: 'Individual Demo', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 3, event: 'Team Fari Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 4, event: 'Individual Fari Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 5, event: 'Team Single Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 6, event: 'Individual Single Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
      ]
    },
    {
      name: 'Tufang (U-14 Years)',
      events: [
        { srNo: 1, event: 'Team Demo', minPlayer: 8, maxPlayer: 11, registered: 'N-A' },
        { srNo: 2, event: 'Individual Demo', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 3, event: 'Team Fari Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 4, event: 'Individual Fari Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 5, event: 'Team Single Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 6, event: 'Individual Single Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
      ]
    },
    {
      name: 'Sool (U-17 Years)',
      events: [
        { srNo: 1, event: 'Team Demo', minPlayer: 8, maxPlayer: 11, registered: 'N-A' },
        { srNo: 2, event: 'Individual Demo', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 3, event: 'Team Fari Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 4, event: 'Individual Fari Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 5, event: 'Team Single Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 6, event: 'Individual Single Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
      ]
    },
    {
      name: 'Saif (U-19 Years)',
      events: [
        { srNo: 1, event: 'Individual Demo', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 2, event: 'Team Fari Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 3, event: 'Individual Fari Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 4, event: 'Team Single Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 5, event: 'Individual Single Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 6, event: 'Team Demo', minPlayer: 8, maxPlayer: 11, registered: 'N-A' },
      ]
    },
    {
      name: 'Sipar (U-25 Years)',
      events: [
        { srNo: 1, event: 'Individual Demo', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 2, event: 'Team Fari Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 3, event: 'Individual Fari Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 4, event: 'Team Single Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 5, event: 'Individual Single Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 6, event: 'Team Demo', minPlayer: 8, maxPlayer: 11, registered: 'N-A' },
      ]
    },
    {
      name: 'Sipar (U-30 Years)',
      events: [
        { srNo: 1, event: 'Individual Demo', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 2, event: 'Team Fari Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 3, event: 'Individual Fari Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 4, event: 'Team Single Soti', minPlayer: 3, maxPlayer: 4, registered: 'N-A' },
        { srNo: 5, event: 'Individual Single Soti', minPlayer: 1, maxPlayer: 1, registered: 'N-A' },
        { srNo: 6, event: 'Team Demo', minPlayer: 8, maxPlayer: 11, registered: 'N-A' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded print:hidden"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-gray-900 text-white w-64 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-40 print:hidden`}>
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
            className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
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
                className="block px-6 py-3 pl-14 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Players Registration
              </a>
            </div>
          )}
          <div
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white cursor-pointer"
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
                className="block px-6 py-3 pl-14 bg-blue-700 text-white"
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
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 print:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-gray-800">Maharashtra ({gender === 'male' ? 'Male' : 'Female'})</h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }}>Dashboard</a>
              <span className="mx-2">/</span>
              <span>Rough Report ({gender === 'male' ? 'Male' : 'Female'})</span>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Report Header Card */}
          <div className="bg-white rounded-lg shadow mb-6">
            {/* Top Bar with Title and Buttons */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <img src={logoImage} alt="Federation Logo" className="h-12 w-12 object-contain" />
                <h2 className="text-gray-800">Rough Report ({gender === 'male' ? 'Male' : 'Female'})</h2>
              </div>
              <div className="flex gap-3 print:hidden">
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Lock Applications
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>

            {/* Notes Section */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-gray-800 mb-3"><strong>Note :</strong></p>
              <ol className="space-y-2 text-sm text-gray-700 list-decimal pl-5">
                <li>Registrations will be automatically closed for the state if both the male and female categories applications has been locked by the state .</li>
                <li>You cannot be able to edit,delete added players</li>
                <li>you cannot be able to change or deregister players from the event or neither do any more players registration in the events of competition .</li>
                <li>If you want to make changes in the report even after locking the applications then contact administrator.</li>
              </ol>
            </div>

            {/* Event Details with Logos */}
            <div className="px-6 py-8">
              <div className="flex items-start justify-between mb-6">
                <img src={logoImage} alt="Federation Logo Left" className="h-20 w-20 object-contain" />
                <div className="text-center flex-1 px-4">
                  <h2 className="text-gray-800 text-2xl mb-4" style={{ fontFamily: 'serif' }}>Gatka Federation of Maharashtra</h2>
                  <h3 className="text-gray-800 mb-2">{currentCompetition.name}</h3>
                  <p className="text-gray-700 text-sm">{currentCompetition.venue}</p>
                  <p className="text-gray-700 text-sm mb-4">{currentCompetition.dates}</p>
                  <p className="text-gray-800 mb-4">{district || 'Select District'} ({gender === 'male' ? 'Male' : 'Female'})</p>
                  <div className="text-gray-700 text-sm">
                    <p><strong>Players participated :- 0</strong></p>
                    <p><strong>No. of events played by players :- 0</strong></p>
                  </div>
                </div>
                <img src={logoImage} alt="Federation Logo Right" className="h-20 w-20 object-contain" />
              </div>
            </div>
          </div>

          {/* Age Category Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ageCategories.map((category, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-gray-800">{category.name}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                          Sr No
                        </th>
                        <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                          Min Player
                        </th>
                        <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                          Max Player
                        </th>
                        <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                          Registered
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {category.events.map((event) => (
                        <tr key={event.srNo} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">{event.srNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{event.event}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{event.minPlayer}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{event.maxPlayer}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{event.registered}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}