import React, { useState } from 'react';
import { Menu, X, Trophy, ArrowLeft, Calendar, MapPin, Users, Save } from 'lucide-react';

interface AddCompetitionProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export function AddCompetition({ userEmail, onLogout, onNavigate }: AddCompetitionProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    competitionName: '',
    venue: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    description: '',
    registrationDeadline: '',
    maxParticipants: '',
    ageCategories: [] as string[],
  });

  const ageCategoryOptions = [
    'Bhujhang (U-11 Years)',
    'Tufang (U-14 Years)',
    'Sool (U-17 Years)',
    'Saif (U-19 Years)',
    'Sipar (U-25 Years)',
    'Sipar (U-30 Years)',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAgeCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      ageCategories: prev.ageCategories.includes(category)
        ? prev.ageCategories.filter(c => c !== category)
        : [...prev.ageCategories, category]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Competition Data:', formData);
    // Here you would send data to backend
    alert('Competition added successfully! (Mock - no backend yet)');
    onNavigate('manage-competitions');
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('manage-competitions')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-gray-800">Add New Competition</h1>
            </div>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); onNavigate('admin-dashboard'); }}>Dashboard</a>
              <span className="mx-2">/</span>
              <span>Add Competition</span>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-gray-800">Competition Details</h2>
                <p className="text-sm text-gray-500 mt-1">Fill in the information below to create a new competition</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Competition Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Competition Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="competitionName"
                    value={formData.competitionName}
                    onChange={handleInputChange}
                    placeholder="e.g., 9th SENIOR NATIONAL GATKA CHAMPIONSHIP 2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      placeholder="e.g., Ratwara Sahib, New Chandigarh, Mohali (Punjab)"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Registration Deadline */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Registration Deadline <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="registrationDeadline"
                      value={formData.registrationDeadline}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Status and Max Participants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      placeholder="Leave empty for unlimited"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Age Categories */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Age Categories <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ageCategoryOptions.map((category) => (
                      <label key={category} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.ageCategories.includes(category)}
                          onChange={() => handleAgeCategoryToggle(category)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Enter competition description, rules, or additional information..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('manage-competitions')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Competition
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
