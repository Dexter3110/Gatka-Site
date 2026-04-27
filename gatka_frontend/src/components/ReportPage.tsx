import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users, UserPlus, Menu, X, Printer, Lock, Loader2, AlertCircle } from 'lucide-react';
import logoImage from 'figma:asset/56e9d8823c6cc761c45e09ce5421e3f32636cd7d.png';
import { listCompetitions, listRegistrations, listPlayers } from '../api/api';
import type { Competition, Registration, Player } from '../api/api';

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

  // Live data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [competitionData, setCompetitionData] = useState<Competition | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch competitions to find the selected one
        const comps = await listCompetitions();
        
        // Try to match by competition ID or name
        let matchedComp: Competition | null = null;
        if (competition) {
          // Try as ID first
          const compId = parseInt(competition);
          if (!isNaN(compId)) {
            matchedComp = comps.find(c => c.id === compId) || null;
          }
          // Fallback: try matching by name key
          if (!matchedComp) {
            matchedComp = comps.find(c => 
              c.name.toLowerCase().includes(competition.toLowerCase()) ||
              competition.toLowerCase().includes(c.name.toLowerCase())
            ) || null;
          }
          // If still no match, use the first competition
          if (!matchedComp && comps.length > 0) {
            matchedComp = comps[0];
          }
        } else if (comps.length > 0) {
          matchedComp = comps[0];
        }

        setCompetitionData(matchedComp);

        // Fetch registrations and players
        const [regsData, playersData] = await Promise.all([
          matchedComp ? listRegistrations({ competition_id: matchedComp.id }) : Promise.resolve([]),
          listPlayers(gender ? { gender } : undefined),
        ]);

        setRegistrations(regsData);
        setPlayers(playersData);
      } catch (err: any) {
        setError(err.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [competition, gender]);

  const handlePrint = () => {
    window.print();
  };

  // Compute report data from live registrations
  const filteredRegistrations = registrations.filter(reg => {
    // Filter by gender if specified
    if (gender && reg.player) {
      return reg.player.gender === gender;
    }
    return true;
  });

  // Count unique players participated
  const uniquePlayerIds = new Set(filteredRegistrations.map(r => r.player_id));
  const playersParticipated = uniquePlayerIds.size;

  // Count total events played
  const eventsPlayed = filteredRegistrations.length;

  // Group registrations by age_category and event_name
  const registrationCounts: Record<string, Record<string, number>> = {};
  filteredRegistrations.forEach(reg => {
    const cat = reg.age_category || 'Uncategorized';
    const evt = reg.event_name || 'Unknown Event';
    if (!registrationCounts[cat]) registrationCounts[cat] = {};
    if (!registrationCounts[cat][evt]) registrationCounts[cat][evt] = 0;
    registrationCounts[cat][evt]++;
  });

  // Format competition details
  const compName = competitionData?.name || 'No competition selected';
  const compVenue = competitionData?.venue || '';
  const compDates = competitionData ? (() => {
    const start = new Date(competitionData.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const end = competitionData.end_date ? new Date(competitionData.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    return end ? `${start} - ${end}` : start;
  })() : '';

  // Build age categories from competition data or use defaults
  const defaultAgeCategories = [
    { name: 'Bhujhang (U-11 Years)', events: ['Team Demo', 'Individual Demo', 'Team Fari Soti', 'Individual Fari Soti', 'Team Single Soti', 'Individual Single Soti'] },
    { name: 'Tufang (U-14 Years)', events: ['Team Demo', 'Individual Demo', 'Team Fari Soti', 'Individual Fari Soti', 'Team Single Soti', 'Individual Single Soti'] },
    { name: 'Sool (U-17 Years)', events: ['Team Demo', 'Individual Demo', 'Team Fari Soti', 'Individual Fari Soti', 'Team Single Soti', 'Individual Single Soti'] },
    { name: 'Saif (U-19 Years)', events: ['Individual Demo', 'Team Fari Soti', 'Individual Fari Soti', 'Team Single Soti', 'Individual Single Soti', 'Team Demo'] },
    { name: 'Sipar (U-25 Years)', events: ['Individual Demo', 'Team Fari Soti', 'Individual Fari Soti', 'Team Single Soti', 'Individual Single Soti', 'Team Demo'] },
    { name: 'Sipar (U-30 Years)', events: ['Individual Demo', 'Team Fari Soti', 'Individual Fari Soti', 'Team Single Soti', 'Individual Single Soti', 'Team Demo'] },
  ];

  // Use competition age_categories if available, fall back to defaults
  const ageCategories = competitionData?.age_categories && competitionData.age_categories.length > 0
    ? competitionData.age_categories.map(ac => ({
        name: ac.category_name,
        events: defaultAgeCategories.find(d => d.name === ac.category_name)?.events || defaultAgeCategories[0].events,
      }))
    : defaultAgeCategories;

  // Event min/max player mapping
  const eventPlayerLimits: Record<string, { min: number; max: number }> = {
    'Team Demo': { min: 8, max: 11 },
    'Individual Demo': { min: 1, max: 1 },
    'Team Fari Soti': { min: 3, max: 4 },
    'Individual Fari Soti': { min: 1, max: 1 },
    'Team Single Soti': { min: 3, max: 4 },
    'Individual Single Soti': { min: 1, max: 1 },
  };

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
                className="block px-6 py-3 pl-14 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Summary Sheet Print
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="block px-6 py-3 pl-14 bg-blue-700 text-white"
              >
                Rough Report
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
            <h1 className="text-gray-800">Maharashtra ({gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'All'})</h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }}>Dashboard</a>
              <span className="mx-2">/</span>
              <a href="#" className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('summary-sheet'); }}>Summary Sheet</a>
              <span className="mx-2">/</span>
              <span>Rough Report ({gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'All'})</span>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3 print:hidden">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-red-800 text-sm font-medium">Failed to load report data</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-gray-600 text-sm">Loading report data...</p>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* Report Header Card */}
              <div className="bg-white rounded-lg shadow mb-6">
                {/* Top Bar with Title and Buttons */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <img src={logoImage} alt="Federation Logo" className="h-12 w-12 object-contain" />
                    <h2 className="text-gray-800">Rough Report ({gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'All'})</h2>
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
                      <h3 className="text-gray-800 mb-2">{compName}</h3>
                      <p className="text-gray-700 text-sm">{compVenue}</p>
                      <p className="text-gray-700 text-sm mb-4">{compDates}</p>
                      <p className="text-gray-800 mb-4">{district || 'Select District'} ({gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'All'})</p>
                      <div className="text-gray-700 text-sm">
                        <p><strong>Players participated :- {playersParticipated}</strong></p>
                        <p><strong>No. of events played by players :- {eventsPlayed}</strong></p>
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
                          {category.events.map((event, eventIdx) => {
                            const limits = eventPlayerLimits[event] || { min: 1, max: 1 };
                            const regCount = registrationCounts[category.name]?.[event] || 0;
                            return (
                              <tr key={eventIdx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-700">{eventIdx + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{event}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{limits.min}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{limits.max}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  <span className={regCount > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                    {regCount > 0 ? regCount : 'N-A'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}