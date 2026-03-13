import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Route, Radar, MemoryStick, ShieldBan,
    Binary, Cpu, PanelLeftClose, PanelLeftOpen, Bell, Search, ShieldCheck, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Live Packets', icon: Route, path: '/packets' },
    { title: 'Threat Detection', icon: Radar, path: '/threats' },
    { title: 'Attack Memory', icon: MemoryStick, path: '/attacks' },
    { title: 'Firewall Rules', icon: ShieldBan, path: '/firewall' },
    { title: 'System Logs', icon: Binary, path: '/logs' },
    { title: 'Settings', icon: Cpu, path: '/settings' },
];

const SidebarLink = ({ to, icon: Icon, label, collapsed }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            [
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                isActive
                    ? 'bg-white/10 text-white'
                    : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white',
            ].join(' ')
        }
        title={collapsed ? label : undefined}
    >
        {({ isActive }) => (
            <>
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </>
        )}
    </NavLink>
);

const DashboardLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="flex h-screen overflow-hidden bg-[#F7F8FA] font-sans">
            {/* Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 68 : 260 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex-shrink-0 bg-[#18181B] flex flex-col overflow-hidden z-30"
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-[#27272A] gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#635BFF] flex items-center justify-center flex-shrink-0 shadow-[0_2px_4px_rgba(99,91,255,0.2)]">
                        <ShieldCheck size={18} strokeWidth={2} className="text-white" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                            >
                                <p className="text-sm font-semibold text-white tracking-tight whitespace-nowrap">IMMUNET</p>
                                <p className="text-[11px] text-[#A1A1AA] whitespace-nowrap">Network Security</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
                    <p className="px-3 pt-4 pb-2 text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Main Menu</p>
                    {NAV_ITEMS.map((item) => (
                        <SidebarLink key={item.path} to={item.path} icon={item.icon} label={item.title} collapsed={collapsed} />
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-[#27272A] space-y-1">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#A1A1AA] hover:bg-white/5 hover:text-white transition-all duration-150"
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        {collapsed ? <PanelLeftOpen size={18} strokeWidth={1.5} /> : <PanelLeftClose size={18} strokeWidth={1.5} />}
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="text-sm overflow-hidden whitespace-nowrap font-medium"
                                >
                                    Collapse Sidebar
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>

                </div>
            </motion.aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-[#FFFFFF] border-b border-[#E6E8EC] flex items-center justify-between px-8 flex-shrink-0 z-20">
                    <div className="flex-1 max-w-md">
                        <div className="relative flex items-center w-full h-9 rounded-lg bg-[#F7F8FA] border border-[#E6E8EC] focus-within:border-[#635BFF] focus-within:ring-2 focus-within:ring-[#635BFF]/10 transition-all">
                            <Search size={16} className="absolute left-3 text-[#9CA3AF] pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full bg-transparent border-none outline-none pl-9 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF]"
                            />
                            <div className="absolute right-2 px-1.5 py-0.5 rounded border border-[#E6E8EC] bg-white text-[10px] text-[#9CA3AF] font-medium pointer-events-none">
                                ⌘K
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                        <div className="flex items-center gap-2 text-[13px] font-medium text-[#6B7280] mr-2">
                            <span className="w-2 h-2 rounded-full bg-[#22C55E] flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            All Systems Operational
                        </div>
                        <div className="h-6 w-px bg-[#E6E8EC]"></div>
                        <button onClick={() => alert("Notification center is empty.")} className="relative p-1.5 rounded-md hover:bg-[#F1F2F4] text-[#6B7280] transition-colors">
                            <Bell size={18} strokeWidth={1.5} />
                            <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-[#635BFF] rounded-full border-2 border-white" />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                    <div className="relative min-h-full">
                        {/* Background decoration */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl" />
                            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#22C55E]/5 rounded-full blur-3xl" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2563EB]/3 rounded-full blur-3xl" />
                        </div>

                        {/* Grid pattern */}
                        <div
                            className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                            style={{
                                backgroundImage: 'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                                backgroundPosition: 'center top',
                            }}
                        />

                        <div className="w-full max-w-7xl mx-auto px-8 py-8 relative z-10">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
