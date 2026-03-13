import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#22C55E]/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2563EB]/3 rounded-full blur-3xl" />
            </div>

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-sm z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="inline-flex items-center justify-center w-14 h-14 bg-[#2563EB] rounded-2xl shadow-lg shadow-[#2563EB]/30 mb-4"
                    >
                        <Shield size={28} className="text-white" />
                    </motion.div>
                    <h1 className="text-xl font-bold text-[#0F172A]">ImmuneNet</h1>
                    <p className="text-sm text-[#64748B] mt-1">Biological Immune System Inspired Security</p>
                </div>

                {/* Card */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8">
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-[#64748B] mb-6">Secure Access</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#0F172A] mb-2 uppercase tracking-wide">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="admin@immune.net"
                                defaultValue="admin@immune.net"
                                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#94a3b8]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#0F172A] mb-2 uppercase tracking-wide">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    defaultValue="password"
                                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#94a3b8] pr-10"
                                />
                                <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all duration-150 active:scale-95 shadow-sm shadow-[#2563EB]/20 mt-2"
                        >
                            Sign In to Dashboard
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
                        <div className="flex items-center gap-2 text-[10px] text-[#94a3b8] font-mono uppercase tracking-widest">
                            <Terminal size={10} />
                            Secure Access Node v1.02 · End-to-End Encrypted
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
