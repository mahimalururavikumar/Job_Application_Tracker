import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ApplicationModal from '../components/ApplicationModal';
import { analyticsService, applicationService } from '../services/api';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  BarChart3, PieChart as PieIcon, TrendingUp, Award, Calendar, 
  Clock, AlertCircle, RefreshCw, Zap, CheckCircle2, FileText
} from 'lucide-react';

const STATUS_COLORS = {
  Wishlist: '#6b7280',   // Gray
  Applied: '#3b82f6',    // Blue
  Interview: '#f59e0b',  // Amber
  Offer: '#10b981',      // Emerald
  Rejected: '#f43f5e',   // Rose
};

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load analytics summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleModalSubmit = async (formData) => {
    await applicationService.create(formData);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-100">
        <Navbar onOpenAddModal={() => setIsModalOpen(true)} />
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-gray-400 text-sm mt-3">Analyzing your job application metrics...</p>
        </div>
      </div>
    );
  }

  // Format data for Recharts Pie Chart
  const pieData = summary?.status_counts
    ? Object.entries(summary.status_counts)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: status,
          value: count,
          color: STATUS_COLORS[status] || '#8b5cf6',
        }))
    : [];

  // Format data for Recharts Monthly Trend Bar Chart
  const barData = summary?.monthly_trend || [];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 pb-16">
      <Navbar onOpenAddModal={() => setIsModalOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Job Hunt Analytics & Insights
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your conversion rates, response velocity, and status distributions.
          </p>
        </div>

        {/* Top Key Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Applications</span>
              <div className="text-3xl font-black text-white mt-1">{summary?.total_applications || 0}</div>
              <span className="text-xs text-gray-500 mt-1 block">Active pipeline entries</span>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Response Rate</span>
              <div className="text-3xl font-black text-purple-200 mt-1">{summary?.response_rate || 0}%</div>
              <span className="text-xs text-purple-300/70 mt-1 block">Interviews + Offers + Rejections</span>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-300 border border-purple-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Interview Rate</span>
              <div className="text-3xl font-black text-amber-200 mt-1">{summary?.interview_rate || 0}%</div>
              <span className="text-xs text-amber-300/70 mt-1 block">Conversion to Interviews</span>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-300 border border-amber-500/30">
              <Zap className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Offers Secured</span>
              <div className="text-3xl font-black text-emerald-200 mt-1">
                {summary?.status_counts?.Offer || 0}
              </div>
              <span className="text-xs text-emerald-300/70 mt-1 block">Accepted / Pending offers</span>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-300 border border-emerald-500/30">
              <Award className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Recharts Donut Pie Chart for Status Breakdown */}
          <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-white">Status Breakdown</h3>
              </div>
              <span className="text-xs text-gray-400">Applications count by phase</span>
            </div>

            {pieData.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-500">
                No application data yet to display status breakdown.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0b0f19" strokeWidth={3} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '12px',
                        color: '#f9fafb',
                        fontSize: '13px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-xs font-semibold text-gray-300">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2: Application Volume / Trend over Time */}
          <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-lg text-white">Application Velocity</h3>
              </div>
              <span className="text-xs text-gray-400">Monthly submissions count</span>
            </div>

            {barData.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-500">
                No application history yet to display velocity timeline.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '12px',
                        color: '#f9fafb',
                        fontSize: '13px',
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>

        {/* AI Momentum & Advice Card */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-purple-950/20 to-gray-900/40">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Interview Performance Takeaways
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-300 mt-4">
            <li className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
              <strong className="text-indigo-300 block mb-1">Target 10+ Apps/Week</strong>
              Maintain high top-of-funnel velocity to maximize offer probability.
            </li>
            <li className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
              <strong className="text-amber-300 block mb-1">7-Day Follow Ups</strong>
              Applications followed up within 7-10 days yield 3x higher response rate.
            </li>
            <li className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
              <strong className="text-emerald-300 block mb-1">Interview Prep Notes</strong>
              Document recruiter questions in notes to continuously improve interview performance.
            </li>
          </ul>
        </div>

      </div>

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default Analytics;
