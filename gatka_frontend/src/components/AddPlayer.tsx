import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Users, UserPlus, Menu, X } from 'lucide-react';
import { addPlayer } from '../api/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddPlayerProps {
  userEmail: string;
  userAreaId: number;          // logged-in user's area_id from JWT — pass from App.tsx
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function validatePhone(val: string) {
  if (!val) return 'Phone number is required';
  if (!/^\d{10}$/.test(val)) return 'Phone number must be exactly 10 digits';
  return '';
}

function validateAadhar(val: string) {
  if (!val) return 'Aadhar number is required';
  if (!/^\d{12}$/.test(val)) return 'Aadhar number must be exactly 12 digits';
  return '';
}

function validateDOB(val: string) {
  if (!val) return 'Date of birth is required';
  const dob = new Date(val);
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 80);
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() - 5);
  if (dob > maxDate) return 'Player must be at least 5 years old';
  if (dob < minDate) return 'Date of birth seems too far in the past';
  return '';
}

const MAX_FILE_BYTES = 500 * 1024; // 500 KB

function validateImageFile(file: File | null, label: string): string {
  if (!file) return `${label} is required`;
  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowed.includes(file.type)) return `${label}: only JPEG / PNG allowed`;
  if (file.size > MAX_FILE_BYTES) return `${label}: file must be under 500 KB`;
  return '';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddPlayer({ userEmail, userAreaId, onLogout, onNavigate }: AddPlayerProps) {
  const [sidebarOpen, setSidebarOpen]             = useState(false);
  const [manageRegDropdownOpen, setManageRegDropdownOpen] = useState(true);
  const [stateReportsDropdownOpen, setStateReportsDropdownOpen] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    aadharNo: '',
    maritalStatus: '',
    email: '',
    phoneNo: '',
    whatsappNo: '',
    tShirtSize: '',
    address: '',
  });

  // File inputs
  const [files, setFiles] = useState({
    passportPhoto: null as File | null,
    aadharFront:   null as File | null,
    aadharBack:    null as File | null,
  });

  // Preview URL for passport photo  (Task 2)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Per-field validation errors  (Task 3)
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Submission state  (Tasks 5 & 8)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg]     = useState('');
  const [errorMsg, setErrorMsg]         = useState('');

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // clear that field's error on change
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'passportPhoto' | 'aadharFront' | 'aadharBack'
  ) => {
    const file = e.target.files?.[0] ?? null;
    setFiles(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    // Live preview only for passport photo  (Task 2)
    if (field === 'passportPhoto') {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(file ? URL.createObjectURL(file) : null);
    }
  };

  // ── Validation (full form)  (Task 3) ────────────────────────────────────────

  function validateAll(): Record<string, string> {
    const e: Record<string, string> = {};

    if (!formData.name.trim())          e.name         = 'Name is required';
    if (!formData.fatherName.trim())    e.fatherName   = 'Father name is required';
    if (!formData.motherName.trim())    e.motherName   = 'Mother name is required';
    if (!formData.gender)               e.gender       = 'Gender is required';
    if (!formData.maritalStatus)        e.maritalStatus = 'Marital status is required';
    if (!formData.tShirtSize)           e.tShirtSize   = 'T-shirt size is required';
    if (!formData.address.trim())       e.address      = 'Address is required';
    if (!formData.email.trim())         e.email        = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                                        e.email        = 'Enter a valid email address';

    const dobErr     = validateDOB(formData.dateOfBirth);
    if (dobErr)     e.dateOfBirth  = dobErr;

    const phoneErr   = validatePhone(formData.phoneNo);
    if (phoneErr)   e.phoneNo      = phoneErr;

    const aadharErr  = validateAadhar(formData.aadharNo);
    if (aadharErr)  e.aadharNo     = aadharErr;

    const photoErr   = validateImageFile(files.passportPhoto, 'Passport photo');
    if (photoErr)   e.passportPhoto = photoErr;

    const frontErr   = validateImageFile(files.aadharFront, 'Aadhar front');
    if (frontErr)   e.aadharFront   = frontErr;

    const backErr    = validateImageFile(files.aadharBack, 'Aadhar back');
    if (backErr)    e.aadharBack    = backErr;

    return e;
  }

  // ── Submit  (Tasks 1, 5, 8) ──────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // 1. Validate everything first
    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorMsg('Please fix the errors highlighted below before submitting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Build FormData  (Task 1)
    const data = new FormData();
    data.append('area_id',        String(userAreaId));
    data.append('full_name',      formData.name.trim());
    data.append('father_name',    formData.fatherName.trim());
    data.append('mother_name',    formData.motherName.trim());
    data.append('date_of_birth',  formData.dateOfBirth);
    data.append('gender',         formData.gender);
    data.append('aadhar_no',      formData.aadharNo);
    data.append('marital_status', formData.maritalStatus);
    data.append('email',          formData.email.trim());
    data.append('phone_no',       formData.phoneNo);
    data.append('whatsapp_no',    formData.whatsappNo);
    data.append('t_shirt_size', formData.tShirtSize.toUpperCase());
    data.append('address',        formData.address.trim());
    data.append('passport_photo', files.passportPhoto!);
    data.append('aadhar_front',   files.aadharFront!);
    data.append('aadhar_back',    files.aadharBack!);

    // 3. Call API  (Tasks 1 & 8 — disable button while uploading)
    setIsSubmitting(true);
    try {
      await addPlayer(data);
      setSuccessMsg('Player added successfully! You can add another player or go back to the players list.');
      // Reset form
      setFormData({
        name: '', fatherName: '', motherName: '', dateOfBirth: '',
        gender: '', aadharNo: '', maritalStatus: '', email: '',
        phoneNo: '', whatsappNo: '', tShirtSize: '', address: '',
      });
      setFiles({ passportPhoto: null, aadharFront: null, aadharBack: null });
      setPhotoPreview(null);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add player. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Field helper ─────────────────────────────────────────────────────────────

  const fieldClass = (name: string) =>
    `w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500 ${
      errors[name] ? 'border-red-500 bg-red-50' : 'border-gray-300'
    }`;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded"
      >
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
                className="block px-6 py-3 pl-14 text-gray-300 hover:bg-gray-700 transition-colors">Players Registration</a>
            </div>
          )}

          <div className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
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
            <h1 className="text-gray-800">Add Player</h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline"
                onClick={(e) => { e.preventDefault(); onNavigate?.('dashboard'); }}>Home</a>
              <span className="mx-2">/</span>
              <span>Manage Registrations</span>
              <span className="mx-2">/</span>
              <span>Add Player</span>
            </nav>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg shadow">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
              <h2>Add Player</h2>
            </div>

            {/* ── Global success / error banners (Task 5) ── */}
            {successMsg && (
              <div className="mx-6 mt-4 flex items-start gap-3 bg-green-50 border border-green-400 text-green-800 rounded p-4">
                <span className="text-xl leading-none">✅</span>
                <p className="text-sm">{successMsg}</p>
              </div>
            )}
            {errorMsg && (
              <div className="mx-6 mt-4 flex items-start gap-3 bg-red-50 border border-red-400 text-red-800 rounded p-4">
                <span className="text-xl leading-none">❌</span>
                <p className="text-sm">{errorMsg}</p>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} noValidate className="p-6">

              {/* ── Personal details grid ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Enter Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name}
                    onChange={handleInputChange} placeholder="ENTER NAME"
                    className={fieldClass('name')} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Father Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Enter Father Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="fatherName" value={formData.fatherName}
                    onChange={handleInputChange} placeholder="ENTER FATHER NAME"
                    className={fieldClass('fatherName')} />
                  {errors.fatherName && <p className="text-xs text-red-500 mt-1">{errors.fatherName}</p>}
                </div>

                {/* Mother Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Enter Mother Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="motherName" value={formData.motherName}
                    onChange={handleInputChange} placeholder="ENTER MOTHER NAME"
                    className={fieldClass('motherName')} />
                  {errors.motherName && <p className="text-xs text-red-500 mt-1">{errors.motherName}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={fieldClass('dateOfBirth')} />
                  {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select name="gender" value={formData.gender}
                    onChange={handleInputChange} className={fieldClass('gender')}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
                </div>

                {/* Aadhar No */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Aadhar No <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="aadharNo" value={formData.aadharNo}
                    onChange={handleInputChange} placeholder="Enter 12-digit Aadhar No"
                    maxLength={12} className={fieldClass('aadharNo')} />
                  {errors.aadharNo && <p className="text-xs text-red-500 mt-1">{errors.aadharNo}</p>}
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Marital Status <span className="text-red-500">*</span>
                  </label>
                  <select name="maritalStatus" value={formData.maritalStatus}
                    onChange={handleInputChange} className={fieldClass('maritalStatus')}>
                    <option value="">Select Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                  {errors.maritalStatus && <p className="text-xs text-red-500 mt-1">{errors.maritalStatus}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Enter Email address <span className="text-red-500">*</span>
                  </label>
                  <input type="email" name="email" value={formData.email}
                    onChange={handleInputChange} placeholder="Enter Email address"
                    className={fieldClass('email')} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Phone No */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Enter Phone No <span className="text-red-500">*</span>
                  </label>
                  <input type="tel" name="phoneNo" value={formData.phoneNo}
                    onChange={handleInputChange} placeholder="10-digit phone number"
                    maxLength={10} className={fieldClass('phoneNo')} />
                  {errors.phoneNo && <p className="text-xs text-red-500 mt-1">{errors.phoneNo}</p>}
                </div>

                {/* WhatsApp No */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Whatsapp No</label>
                  <input type="tel" name="whatsappNo" value={formData.whatsappNo}
                    onChange={handleInputChange} placeholder="Enter Whatsapp No"
                    maxLength={10} className={fieldClass('whatsappNo')} />
                </div>

                {/* T-Shirt Size */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    T-Shirt Size <span className="text-red-500">*</span>
                  </label>
                  <select name="tShirtSize" value={formData.tShirtSize}
                    onChange={handleInputChange} className={fieldClass('tShirtSize')}>
                    <option value="">Select T-Shirt Size</option>
                    <option value="xs">XS</option>
                    <option value="s">S</option>
                    <option value="m">M</option>
                    <option value="l">L</option>
                    <option value="xl">XL</option>
                    <option value="xxl">XXL</option>
                  </select>
                  {errors.tShirtSize && <p className="text-xs text-red-500 mt-1">{errors.tShirtSize}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">
                  Enter Address <span className="text-red-500">*</span>
                </label>
                <textarea name="address" value={formData.address}
                  onChange={handleInputChange} placeholder="Enter Address" rows={3}
                  className={fieldClass('address')} />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>

              {/* ── File uploads ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* Passport Photo — with live preview (Task 2) */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Upload Passport Size Photo <span className="text-red-500">*</span>
                  </label>
                  <input type="file" accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'passportPhoto')}
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500 ${errors.passportPhoto ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                  <p className="text-xs text-red-500 mt-1">
                    .JPEG / .JPG / .PNG only — max 500 KB
                  </p>
                  {/* Live preview (Task 2) */}
                  {photoPreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={photoPreview} alt="Passport preview"
                        className="w-20 h-20 object-cover rounded border border-gray-300 shadow-sm" />
                      <div className="text-xs text-gray-600">
                        <p className="font-medium">{files.passportPhoto?.name}</p>
                        <p>{((files.passportPhoto?.size ?? 0) / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  )}
                  {errors.passportPhoto && <p className="text-xs text-red-500 mt-1">{errors.passportPhoto}</p>}
                </div>

                {/* Aadhar Front */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Upload Aadhar Card Photo (Front) <span className="text-red-500">*</span>
                  </label>
                  <input type="file" accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'aadharFront')}
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500 ${errors.aadharFront ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                  <p className="text-xs text-red-500 mt-1">
                    .JPEG / .JPG / .PNG only — max 500 KB
                  </p>
                  {files.aadharFront && (
                    <p className="text-xs text-green-600 mt-1">
                      ✔ {files.aadharFront.name} ({((files.aadharFront.size) / 1024).toFixed(1)} KB)
                    </p>
                  )}
                  {errors.aadharFront && <p className="text-xs text-red-500 mt-1">{errors.aadharFront}</p>}
                </div>
              </div>

              {/* Aadhar Back */}
              <div className="mb-6 md:w-1/2 md:pr-3">
                <label className="block text-sm text-gray-700 mb-2">
                  Upload Aadhar Card Photo (Back) <span className="text-red-500">*</span>
                </label>
                <input type="file" accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'aadharBack')}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500 ${errors.aadharBack ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                <p className="text-xs text-red-500 mt-1">
                  .JPEG / .JPG / .PNG only — max 500 KB
                </p>
                {files.aadharBack && (
                  <p className="text-xs text-green-600 mt-1">
                    ✔ {files.aadharBack.name} ({((files.aadharBack.size) / 1024).toFixed(1)} KB)
                  </p>
                )}
                {errors.aadharBack && <p className="text-xs text-red-500 mt-1">{errors.aadharBack}</p>}
              </div>

              {/* ── Submit button — disabled + spinner while uploading (Task 8) ── */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-6 py-2 rounded text-white transition-colors ${
                    isSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting && (
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  {isSubmitting ? 'Uploading...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center text-xs text-gray-500 mt-6">
            © 2020 Gatka Federation of India All Right Reserved. Design and Developed By YBITechnologies
          </div>
        </div>
      </div>
    </div>
  );
}