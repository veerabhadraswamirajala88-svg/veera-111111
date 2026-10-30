import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Search,
  Bookmark,
  History,
  BarChart3,
  Sliders,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { profile, preferences } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'AI Assistant', path: '/assistant', icon: Sparkles, highlight: true },
    { name: 'Smart Search', path: '/search', icon: Search },
    { name: 'Saved Items', path: '/saved', icon: Bookmark },
    { name: 'Activity Log', path: '/activity', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Preferences', path: '/preferences', icon: Sliders },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Privacy & Control', path: '/privacy', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon
                  className={`w-4 h-4 mr-3 transition-colors ${
                    item.highlight ? 'text-indigo-500 group-hover:scale-110' : ''
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.highlight && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Profile Summary Card */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-100 dark:border-indigo-950/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-indigo-500" />
                Adaptive Engine
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Active
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p className="flex justify-between">
                <span>Budget Max:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {preferences?.budget_max
                    ? `${preferences.currency} ${preferences.budget_max.toLocaleString()}`
                    : 'Unlimited'}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Interests:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {preferences?.interests?.length || 0} selected
                </span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
