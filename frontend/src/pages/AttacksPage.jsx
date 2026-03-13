import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Skeleton, PageHeader } from '../components/UI';
import { Database, Search, Filter, Download, Calendar, ShieldCheck, RefreshCw, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { attackService } from '../services/api';



const TYPE_COLORS = {
    'DDoS': 'danger',
    'SYN Flood': 'warning',
    'Port Scan': 'info',
    'Brute Force': 'warning',
};

const AttacksPage = () => {
    const [attacks, setAttacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const load = async () => {
        setLoading(true);
        try {
            const res = await attackService.getAll();
            setAttacks(res.data?.data || res.data || []);
        } catch {
            setAttacks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleClear = async () => {
        if (!window.confirm("Permanently delete all attack memory records?")) return;
        setLoading(true);
        try {
            await attackService.clearAll();
            await load();
        } catch (e) { console.error(e); setLoading(false); }
    };

    const handleExport = () => {
        if (attacks.length === 0) return alert("No attack records to export.");
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,SourceIP,Type,Time,RuleApplied\n"
            + attacks.map(a => `${a.id},${a.src},${a.type},${a.time},"${a.rule}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attack_memory_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const allTypes = ['All', ...new Set(attacks.map(a => a.type))];
    const filtered = attacks.filter(a => {
        const matchQ = !filter || a.src?.includes(filter) || a.type?.toLowerCase().includes(filter.toLowerCase());
        const matchT = typeFilter === 'All' || a.type === typeFilter;
        return matchQ && matchT;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Reset page if filter changes
    useEffect(() => { setPage(1); }, [filter, typeFilter]);

    return (
        <div className="space-y-5">
            <PageHeader title="Attack Memory Center" subtitle="Long-term storage of neutralized network threats">
                <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={14} /> Refresh</Button>
                <Button variant="secondary" size="sm" onClick={handleExport}><Download size={14} /> Export Report</Button>
                <Button variant="danger" size="sm" onClick={handleClear} disabled={attacks.length === 0}><Trash2 size={14} /> Clear History</Button>
            </PageHeader>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-48 relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                        <input
                            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#94a3b8]"
                            placeholder="Search by IP or Attack Type..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {allTypes.map(t => (
                            <button
                                key={t}
                                onClick={() => setTypeFilter(t)}
                                className={[
                                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                    typeFilter === t ? 'bg-[#2563EB] text-white' : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB]/30',
                                ].join(' ')}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                                {['ID', 'Source IP', 'Attack Type', 'Time Captured', 'Firewall Rule', 'Status'].map(h => (
                                    <th key={h} className="px-5 py-3 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {loading
                                ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-5" /></td></tr>)
                                : (
                                    <AnimatePresence>
                                        {paginated.map((a, idx) => (
                                            <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }} className="hover:bg-[#F8FAFC] transition-colors group">
                                                <td className="px-5 py-3 font-mono text-xs text-[#94a3b8]">#{a.id}</td>
                                                <td className="px-5 py-3 text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{a.src}</td>
                                                <td className="px-5 py-3"><Badge variant={TYPE_COLORS[a.type] || 'info'}>{a.type}</Badge></td>
                                                <td className="px-5 py-3 text-xs text-[#64748B] font-mono">{a.time}</td>
                                                <td className="px-5 py-3">
                                                    <code className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-1 rounded font-mono">{a.rule}</code>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1.5 text-[#22C55E] text-xs font-semibold">
                                                        <ShieldCheck size={13} /> Archived
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )
                            }
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
                    <span>{filtered.length} attack records</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`px-2.5 py-1 rounded border border-[#E2E8F0] transition-colors ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
                        >← Prev</button>
                        <span className="w-7 h-7 flex items-center justify-center bg-[#2563EB] text-white rounded text-xs font-bold">{page}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className={`px-2.5 py-1 rounded border border-[#E2E8F0] transition-colors ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
                        >Next →</button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AttacksPage;
