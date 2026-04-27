import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users, UserPlus, Menu, X } from 'lucide-react';
import { listCompetitions, type Competition } from '../api/api';

interface SummarySheetPrintProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

// All 36 districts of Maharashtra
const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar','Akola','Amravati','Aurangabad','Beed','Bhandara','Buldhana',
  'Chandrapur','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna',
  'Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nanded',
  'Nandurbar','Nashik','Osmanabad','Palghar','Parbhani','Pune','Raigad',
  'Ratnagiri','Sangli','Satara','Sindhudurg','Solapur','Thane',
  'Wardha','Washim','Yavatmal',
];

export function SummarySheetPrint({ userEmail, onLogout, onNavigate }: SummarySheetPrintProps) {
  const [sidebarOpen, setSidebarOpen]                       = useState(false);
  const [manageRegDropdownOpen, setManageRegDropdownOpen]   = useState(false);
  const [stateReportsDropdownOpen, setStateReportsDropdownOpen] = useState(true);

  // Filter state
  const [competitions, setCompetitions]             = useState<Competition[]>([]);
  const [competitionsLoading, setCompetitionsLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [selectedDistrict, setSelectedDistrict]     = useState('');
  const [selectedGender, setSelectedGender]         = useState('');

  // Form feedback
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // ── Load competitions from API on mount ──────────────────────────────────

  useEffect(() => {
    setCompetitionsLoading(true);
    listCompetitions()
      .then(setCompetitions)
      .catch(() => setCompetitions([]))  // degrade gracefully
      .finally(() => setCompetitionsLoading(false));
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!selectedCompetition) e.competition = 'Please select a competition';
    if (!selectedDistrict)    e.district    = 'Please select a district';
    if (!selectedGender)      e.gender      = 'Please select a gender';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(false);
    // Navigate to report page with selected parameters
    onNavigate?.(
      `report?competition=${selectedCompetition}&district=${encodeURIComponent(selectedDistrict)}&gender=${selectedGender}`
    );
  };

  const handleReset = () => {
    setSelectedCompetition('');
    setSelectedDistrict('');
    setSelectedGender('');
    setErrors({});
    setSubmitted(false);
  };

  const fieldClass = (key: string) =>
    `w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500 ${
      errors[key] ? 'border-red-500 bg-red-50' : 'border-gray-300'
    }`;

  // ─── Render ──────────────────────────────────────────────────────────────

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

          <div className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white cursor-pointer"
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
                className="block px-6 py-3 pl-14 bg-blue-700 text-white">
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
            <h1 className="text-gray-800">Summary Sheet Print</h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline"
                onClick={(e) => { e.preventDefault(); onNavigate?.('dashboard'); }}>Dashboard</a>
              <span className="mx-2">/</span>
              <span>Summary Sheet Print</span>
            </nav>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-800 mb-6">Summary Sheet Print</h2>

            {/* Filter form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

              {/* Competition — live from API */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Select Competition <span className="text-red-500">*</span>
                </label>
                {competitionsLoading ? (
                  <div className="w-full border border-gray-300 rounded px-3 py-2 text-gray-400 text-sm bg-gray-50">
                    Loading competitions…
                  </div>
                ) : (
                  <select value={selectedCompetition}
                    onChange={(e) => { setSelectedCompetition(e.target.value); setErrors(p => ({ ...p, competition: '' })); }}
                    className={fieldClass('competition')}>
                    <option value="">Select Competition</option>
                    {competitions.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                )}
                {errors.competition && <p className="text-xs text-red-500 mt-1">{errors.competition}</p>}
              </div>

              {/* District */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  District <span className="text-red-500">*</span>
                </label>
                <select value={selectedDistrict}
                  onChange={(e) => { setSelectedDistrict(e.target.value); setErrors(p => ({ ...p, district: '' })); }}
                  className={fieldClass('district')}>
                  <option value="">Select District</option>
                  {MAHARASHTRA_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Select Gender <span className="text-red-500">*</span>
                </label>
                <select value={selectedGender}
                  onChange={(e) => { setSelectedGender(e.target.value); setErrors(p => ({ ...p, gender: '' })); }}
                  className={fieldClass('gender')}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button onClick={handleSubmit}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded transition-colors">
                Submit
              </button>
              <button onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}