import React, { useState, useEffect } from 'react';
import { X, Building2, Briefcase, Link as LinkIcon, Calendar, DollarSign, MapPin, FileText, Bell } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'Wishlist', label: 'Wishlist', color: 'bg-gray-500/20 text-gray-300 border-gray-500/40' },
  { value: 'Applied', label: 'Applied', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { value: 'Interview', label: 'Interview', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { value: 'Offer', label: 'Offer', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { value: 'Rejected', label: 'Rejected', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
];

const ApplicationModal = ({ isOpen, onClose, onSubmit, initialData = null, initialStatus = null }) => {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    link: '',
    status: 'Applied',
    date_applied: new Date().toISOString().split('T')[0],
    follow_up_date: '',
    location: '',
    salary: '',
    job_type: 'Full-time',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company || '',
        role: initialData.role || '',
        link: initialData.link || '',
        status: initialData.status || 'Applied',
        date_applied: initialData.date_applied || new Date().toISOString().split('T')[0],
        follow_up_date: initialData.follow_up_date || '',
        location: initialData.location || '',
        salary: initialData.salary || '',
        job_type: initialData.job_type || 'Full-time',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        company: '',
        role: '',
        link: '',
        status: initialStatus || 'Applied',
        date_applied: new Date().toISOString().split('T')[0],
        follow_up_date: '',
        location: '',
        salary: '',
        job_type: 'Full-time',
        notes: '',
      });
    }
    setError('');
  }, [initialData, initialStatus, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.company.trim() || !formData.role.trim()) {
      setError('Company name and Role are required.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl p-6 shadow-2xl border border-gray-700/60 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              {initialData ? 'Edit Application' : 'Add New Application'}
            </h2>
            <p className="text-sm text-gray-400">
              Track your job progress, follow-ups, and notes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Row 1: Company & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Google, Stripe"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Role Title *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Status & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-sm text-white bg-gray-900"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Date Applied
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="date_applied"
                  value={formData.date_applied}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Follow-up Date
              </label>
              <div className="relative">
                <Bell className="absolute left-3 top-3 w-4 h-4 text-amber-400" />
                <input
                  type="date"
                  name="follow_up_date"
                  value={formData.follow_up_date || ''}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Job Link & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Job Posting URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Remote / New York"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Salary & Job Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Salary Range
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-emerald-400" />
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. $130,000 - $160,000"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Job Type
              </label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-sm text-white bg-gray-900"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Notes / Referral Details
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Key requirements, contact person, interview prep notes..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Application'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ApplicationModal;
