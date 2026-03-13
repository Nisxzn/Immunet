import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Skeleton, PageHeader } from '../components/UI';
import { Shield, AlertTriangle, Eye, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { threatService } from '../services/api';



const STATS = [
    { label: 'High Confidence', val: 12, icon: Shield, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    { label: 'Active Attacks', val: 5, icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Neutralized', val: 142, icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Suspicious', val: 8, icon: Eye, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
];

const statusStyle = {
    Active: { badge: 'danger', dot: 'bg-[#EF4444] animate-pulse' },
    Suspicious: { badge: 'warning', dot: 'bg-[#F59E0B]' },
    Neutralized: { badge: 'success', dot: 'bg-[#22C55E]' },
};

const confColor = (c) => c >= 90 ? '#EF4444' : c >= 70 ? '#F59E0B' : '#2563EB';

const ThreatsPage = () => {
    const [threats, setThreats] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await threatService.getAll();
            setThreats(res.data?.data || res.data || []);
        } catch {
            setThreats([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleBlockAll = async () => {
        if (!window.confirm("Are you sure you want to block all active threats?")) return;
        setLoading(true);
        try {
            await threatService.blockAll();
            await load();
        } catch (e) { console.error(e); setLoading(false); }
    };

    const handleBlockIP = async (ip) => {
        setLoading(true);
        try {
            await threatService.blockIP(ip);
            await load();
        } catch (e) { console.error(e); setLoading(false); }
    };

    const handleIgnore = async (id) => {
        setLoading(true);
        try {
            await threatService.ignore(id);
            await load();
        } catch (e) { console.error(e); setLoading(false); }
    };

    // Calculate real stats
    const statsData = [
        { label: 'High Confidence', val: threats.filter(t => t.conf >= 90).length, icon: Shield, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
        { label: 'Active Attacks', val: threats.filter(t => t.status === 'Active').length, icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Neutralized', val: threats.filter(t => t.status === 'Neutralized').length, icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
        { label: 'Ignored/Suspicious', val: threats.filter(t => t.status === 'Ignored' || t.status === 'Suspicious').length, icon: Eye, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
    ];

    return (
        <div className="space-y-5">
            <PageHeader title="Threat Detection Center" subtitle="Automated analysis of suspicious network activity">
                <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={14} /> Refresh</Button>
                <Button variant="danger" size="sm" onClick={handleBlockAll} disabled={threats.filter(t => t.status === 'Active').length === 0}><Ban size={14} /> Block All Active</Button>
            </PageHeader>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((s, i) => (
                    <div
                        key={i}
                        className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                    >
                        <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: s.bg, color: s.color }}>
                            <s.icon size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide">{s.label}</p>
                            <h3 className="text-xl font-bold text-[#0F172A]">{s.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                                {['Threat Type', 'Source IP', 'Confidence', 'Detected', 'Status', 'Action'].map(h => (
                                    <th key={h} className="px-5 py-3 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {loading
                                ? [...Array(4)].map((_, i) => <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-5" /></td></tr>)
                                : (
                                    <AnimatePresence>
                                        {threats.length === 0 && (
                                            <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-[#64748B]">No threats detected.</td></tr>
                                        )}
                                        {threats.map((t, idx) => {
                                            const s = statusStyle[t.status] || { badge: 'secondary', dot: 'bg-[#64748B]' };
                                            return (
                                                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="hover:bg-[#F8FAFC] transition-colors group">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                                                            <span className="text-sm font-semibold text-[#0F172A]">{t.type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 font-mono text-sm text-[#64748B]">{t.src}</td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-sm font-bold" style={{ color: confColor(t.conf) }}>{t.conf}%</span>
                                                    </td>
                                                    <td className="px-5 py-3 text-xs text-[#64748B]">{t.time}</td>
                                                    <td className="px-5 py-3"><Badge variant={s.badge}>{t.status}</Badge></td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-1">
                                                            {t.status === 'Active' || t.status === 'Suspicious' ? (
                                                                <>
                                                                    <button onClick={() => handleIgnore(t.id)} className="p-1.5 rounded-lg hover:bg-[#2563EB]/10 hover:text-[#2563EB] text-[#64748B] transition-colors" title="Ignore Threat"><Eye size={14} /></button>
                                                                    <button onClick={() => handleBlockIP(t.src)} className="p-1.5 rounded-lg hover:bg-[#EF4444]/10 hover:text-[#EF4444] text-[#64748B] transition-colors" title="Block IP"><Ban size={14} /></button>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs text-[#94a3b8] italic">Actioned</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ThreatsPage;
