import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  PiggyBank, 
  Landmark, 
  Receipt, 
  BookOpen, 
  FileBarChart, 
  UserCog,
  LogOut,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Savings', path: '/savings', icon: PiggyBank },
  { name: 'Loans', path: '/loans', icon: Landmark },
  { name: 'Installments', path: '/installments', icon: Receipt },
  { name: 'Day Book', path: '/daybook', icon: BookOpen },
  { name: 'Reports', path: '/reports', icon: FileBarChart },
  { name: 'Staff', path: '/staff', icon: UserCog },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#0B0F19] text-slate-200 overflow-hidden selection:bg-red-500/30">
      {/* Sidebar - Glassmorphic */}
      <aside className="w-64 glass-panel border-r border-white/10 flex flex-col relative z-20">
        <div className="p-6 flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
            <svg viewBox="0 0 100 100" className="h-7 w-7 text-red-600" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 40 L30 15 L70 15 Z M60 50 L85 30 L85 70 Z M50 60 L70 85 L30 85 Z M40 50 L15 70 L15 30 Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-red-600 tracking-wide leading-tight">RAKESH</h1>
            <p className="text-[8px] uppercase tracking-widest text-slate-400 leading-tight mt-0.5">Microfinance<br/>Management System</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden group",
                isActive 
                  ? "text-white bg-red-500/10 border border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav" 
                      className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
                    />
                  )}
                  <item.icon className={cn("mr-3 h-5 w-5 transition-colors", isActive ? "text-red-500" : "text-slate-500 group-hover:text-red-400/70")} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button className="flex items-center px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-all border border-transparent hover:border-red-500/30 group">
            <LogOut className="mr-3 h-5 w-5 group-hover:text-red-400" />
            System Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Ambient Background Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-900/20 blur-[120px] pointer-events-none" />

        <header className="glass-panel border-b border-white/10 z-10 sticky top-0">
          <div className="px-8 py-5 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                title="Go Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                {navItems.find(item => item.path === location.pathname)?.name || 'System Overview'}
              </h2>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-slate-400 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 p-[2px]">
                <div className="h-full w-full rounded-full bg-[#0B0F19] flex items-center justify-center text-white font-bold text-sm">
                  AD
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
