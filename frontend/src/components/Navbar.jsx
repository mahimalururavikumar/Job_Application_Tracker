import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LayoutDashboard, Kanban, BarChart3, Plus, LogOut, User } from 'lucide-react';

const Navbar = ({ onOpenAddModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
    }`;

  return (
    <nav className="sticky top-0 z-40 glass-panel border-b border-gray-800/80 mb-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-indigo-200">
                TrackFlow
              </span>
              <span className="text-xs text-indigo-400 block font-semibold -mt-1 tracking-wider uppercase">
                Job Tracker
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/dashboard" className={navLinkStyle}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/kanban" className={navLinkStyle}>
              <Kanban className="w-4 h-4" />
              <span>Kanban Board</span>
            </NavLink>
            <NavLink to="/analytics" className={navLinkStyle}>
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </NavLink>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Application</span>
            </button>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-medium text-gray-200">
                  {user?.full_name || 'Job Seeker'}
                </span>
                <span className="text-xs text-gray-400 max-w-[140px] truncate">
                  {user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
