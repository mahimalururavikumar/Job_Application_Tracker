import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ApplicationModal from '../components/ApplicationModal';
import { applicationService, analyticsService } from '../services/api';
import { 
  Search, Filter, ArrowUpDown, Plus, ExternalLink, Edit2, Trash2, 
  AlertCircle, Calendar, MapPin, DollarSign, Briefcase, 
  Clock, CheckCircle2, ChevronLeft, ChevronRight, RefreshCw, XCircle
} from 'lucide-react';

const STATUS_BADGES = {
  Wishlist: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
  Applied: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  Interview: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  Offer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Rejected: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
};

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date_applied');
  const [sortOrder, setSortOrder] = useState('desc');

  // Stats & Overdue
  const [stats, setStats] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;

      const data = await applicationService.getAll(params);
      setApplications(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search, statusFilter]);

  const fetchStats = async () => {
    try {
      const summary = await analyticsService.getSummary();
      setStats(summary);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [fetchApplications]);

  const handleOpenAddModal = () => {
    setEditingApp(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    if (editingApp) {
      await applicationService.update(editingApp.id, formData);
    } else {
      await applicationService.create(formData);
    }
    fetchApplications();
    fetchStats();
  };

  const handleDelete = async (id, company) => {
    if (window.confirm(`Are you sure you want to delete your application for ${company}?`)) {
      try {
        await applicationService.delete(id);
        fetchApplications();
        fetchStats();
      } catch (err) {
        console.error(err);
        alert('Failed to delete application.');
      }
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await applicationService.update(id, { status: newStatus });
      fetchApplications();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const isOverdue = (followUpDate, status) => {
    if (!followUpDate || status === 'Offer' || status === 'Rejected') return false;
    const today = new Date().toISOString().split('T')[0];
    return followUpDate < today;
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 pb-16">
      <Navbar onOpenAddModal={handleOpenAddModal} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Overdue Alert Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Application Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your active pipeline, follow-ups, and interview statuses.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Application</span>
          </button>
        </div>

        {/* Overdue Alert Banner */}
        {stats && stats.overdue_follow_ups > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-amber-300 text-sm">
                  {stats.overdue_follow_ups} Overdue Follow-up Reminder{stats.overdue_follow_ups > 1 ? 's' : ''}!
                </h4>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Check your flagged applications below to send follow-up emails to recruiters.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('All')}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg text-xs font-semibold border border-amber-500/40 transition-colors whitespace-nowrap"
            >
              View All
            </button>
          </div>
        )}

        {/* Highlight Metrics Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <div className="glass-panel p-4 rounded-2xl border border-gray-800">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Apps</span>
              <div className="text-2xl font-black text-white mt-2">{stats.total_applications}</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Applied</span>
              <div className="text-2xl font-black text-blue-300 mt-2">{stats.status_counts?.Applied || 0}</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Interviewing</span>
              <div className="text-2xl font-black text-amber-300 mt-2">{stats.status_counts?.Interview || 0}</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Offers</span>
              <div className="text-2xl font-black text-emerald-300 mt-2">{stats.status_counts?.Offer || 0}</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 col-span-2 sm:col-span-1">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Response Rate</span>
              <div className="text-2xl font-black text-purple-300 mt-2">{stats.response_rate}%</div>
            </div>

          </div>
        )}

        {/* Filter, Search & Sorting Controls */}
        <div className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search company, role, or notes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-gray-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {['All', 'Applied', 'Interview', 'Offer', 'Rejected', 'Wishlist'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400 hidden sm:inline" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sBy, sOrder] = e.target.value.split('-');
                setSortBy(sBy);
                setSortOrder(sOrder);
              }}
              className="px-3 py-2 rounded-xl glass-input text-xs font-medium text-gray-200 bg-gray-900 border border-gray-700"
            >
              <option value="date_applied-desc">Newest First</option>
              <option value="date_applied-asc">Oldest First</option>
              <option value="company-asc">Company (A-Z)</option>
              <option value="status-asc">Status</option>
            </select>
          </div>

        </div>

        {/* Applications List Grid / Cards */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
            <p className="text-gray-400 text-sm mt-3">Loading job applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center border border-gray-800 space-y-4">
            <div className="w-16 h-16 bg-gray-800/60 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No applications found</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              {search || statusFilter !== 'All' 
                ? 'Try adjusting your search filters or status selection.'
                : 'Start tracking your job hunt by adding your first application!'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Application
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => {
              const overdue = isOverdue(app.follow_up_date, app.status);
              return (
                <div
                  key={app.id}
                  className={`glass-panel rounded-2xl p-5 border glass-panel-hover flex flex-col justify-between relative overflow-hidden ${
                    overdue ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-gray-800'
                  }`}
                >
                  {/* Overdue Top Ribbon */}
                  {overdue && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-bl-xl shadow-md">
                      Follow Up Overdue
                    </div>
                  )}

                  <div>
                    {/* Header: Company & Role */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-snug group-hover:text-indigo-300">
                          {app.company}
                        </h3>
                        <p className="text-sm text-indigo-300/90 font-medium mt-0.5">
                          {app.role}
                        </p>
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={app.status}
                        onChange={(e) => handleQuickStatusChange(app.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-xl border appearance-none cursor-pointer focus:outline-none transition-all ${
                          STATUS_BADGES[app.status] || STATUS_BADGES.Applied
                        }`}
                      >
                        <option value="Wishlist" className="bg-gray-900 text-white">Wishlist</option>
                        <option value="Applied" className="bg-gray-900 text-white">Applied</option>
                        <option value="Interview" className="bg-gray-900 text-white">Interview</option>
                        <option value="Offer" className="bg-gray-900 text-white">Offer</option>
                        <option value="Rejected" className="bg-gray-900 text-white">Rejected</option>
                      </select>
                    </div>

                    {/* Metadata tags */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>Applied {app.date_applied}</span>
                      </div>

                      {app.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          <span>{app.location}</span>
                        </div>
                      )}

                      {app.salary && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">{app.salary}</span>
                        </div>
                      )}
                    </div>

                    {/* Follow-up Indicator */}
                    {app.follow_up_date && app.status !== 'Offer' && app.status !== 'Rejected' && (
                      <div className={`mt-3 p-2 rounded-xl text-xs flex items-center gap-2 border ${
                        overdue 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                          : 'bg-gray-800/40 border-gray-700/50 text-gray-300'
                      }`}>
                        <Clock className={`w-3.5 h-3.5 ${overdue ? 'text-amber-400 animate-bounce' : 'text-gray-400'}`} />
                        <span>Follow up by: <strong>{app.follow_up_date}</strong></span>
                      </div>
                    )}

                    {/* Notes Preview */}
                    {app.notes && (
                      <p className="mt-3 text-xs text-gray-400 line-clamp-2 bg-gray-900/50 p-2.5 rounded-xl border border-gray-800/60 italic">
                        "{app.notes}"
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between">
                    {app.link ? (
                      <a
                        href={app.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Job Posting</span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-600">No link</span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(app)}
                        title="Edit application"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id, app.company)}
                        title="Delete application"
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {pages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-800 text-sm">
            <span className="text-xs text-gray-400">
              Showing Page <strong>{page}</strong> of <strong>{pages}</strong> ({total} total apps)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-2 glass-panel border border-gray-800 rounded-xl text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="px-3.5 py-2 glass-panel border border-gray-800 rounded-xl text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-semibold"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingApp}
      />
    </div>
  );
};

export default Dashboard;
