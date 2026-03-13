import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Skeleton, PageHeader } from '../components/UI';
import { Shield, AlertTriangle, Play, Plus, Trash2, Edit2, Search, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { firewallService } from '../services/api';



const STATS = [
    { label: 'Active Block Rules', val: 124, icon: Shield, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    { label: 'Manual Exceptions', val: 56, icon: Play, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Global Rules', val: 10, icon: AlertTriangle, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
];

const ruleVariant = { BLOCK: 'danger', ALLOW: 'success', WATCH: 'warning' };
const statusVariant = { Active: 'success', Disabled: 'secondary' };

const FirewallPage = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const res = await firewallService.getAll();
            setRules(res.data?.data || res.data || []);
        } catch {
            setRules([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleRemove = async (id) => {
        if (!window.confirm(`Are you sure you want to delete rule #${id}?`)) return;
        setLoading(true);
        try {
            await firewallService.removeRule(id);
            await load();
        } catch (e) { console.error(e); setLoading(false); }
    };

    const handleToggle = async (id, currentStatus) => {
        setLoading(true);
        try {
            const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
            await firewallService.updateRule(id, newStatus);
            await load();
        } catch (e) { console.error(e); setLoading(false); }
    };

    const handleCreate = async () => {
        const ip = window.prompt("Enter IPv4 Address to Block:");
        if (!ip) return;

        // simple validation
        if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
            alert("Invalid IP address format.");
            return;
        }

        setLoading(true);
        try {
            await firewallService.addRule({ ip, action: 'BLOCK' });
            await load();
        } catch (e) { console.error(e); setLoading(false); }
    };

    const handleDeployAll = async () => {
        const disabledRules = rules.filter(r => r.status === 'Disabled');
        if (disabledRules.length === 0) return alert("No disabled rules to deploy.");

        if (!window.confirm("Deploy all disabled rules?")) return;

        setLoading(true);
        try {
            for (let r of disabledRules) {
                await firewallService.updateRule(r.id, 'Active');
            }
            await load();
        } catch (e) { console.error(e); setLoading(false); }
    };

    const filtered = rules.filter(r => !filter || r.ip?.includes(filter) || String(r.id).includes(filter));

    // Dynamic stats
    const statsData = [
        { label: 'Active Block Rules', val: rules.filter(r => r.type === 'BLOCK' && r.status === 'Active').length, icon: Shield, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
        { label: 'Disabled/Exceptions', val: rules.filter(r => r.status === 'Disabled').length, icon: Play, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
        { label: 'Total Rules', val: rules.length, icon: AlertTriangle, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
    ];

    return (
        <div className="space-y-5">
            <PageHeader title="Firewall Controller" subtitle="Manage dynamic antibody rules protecting your network">
                <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={14} /> Refresh</Button>
                <Button variant="secondary" size="sm" onClick={handleDeployAll}><Play size={14} /> Deploy All</Button>
                <Button variant="primary" size="sm" onClick={handleCreate}><Plus size={14} /> Create Rule</Button>
            </PageHeader>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statsData.map((s, i) => (
                    <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group">
                        <div>
                            <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide">{s.label}</p>
                            <h3 className="text-2xl font-bold text-[#0F172A] mt-1">{s.val}</h3>
                        </div>
                        <div className="p-3 rounded-xl group-hover:rotate-6 transition-transform" style={{ backgroundColor: s.bg, color: s.color }}>
                            <s.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <Card>
                <div className="p-4 border-b border-[#E2E8F0]">
                    <div className="relative max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                        <input
                            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#94a3b8]"
                            placeholder="Search by IP or Rule ID..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                                {['Rule ID', 'IP Address', 'Action', 'Created Time', 'Status', 'Controls'].map(h => (
                                    <th key={h} className="px-5 py-3 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {loading
                                ? [...Array(4)].map((_, i) => <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-5" /></td></tr>)
                                : (
                                    <AnimatePresence>
                                        {filtered.length === 0 && (
                                            <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-[#64748B]">No firewall rules found.</td></tr>
                                        )}
                                        {filtered.map((r, idx) => (
                                            <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }} className="hover:bg-[#F8FAFC] transition-colors group">
                                                <td className="px-5 py-3 font-mono text-xs text-[#94a3b8]">#{r.id}</td>
                                                <td className="px-5 py-3 text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{r.ip}</td>
                                                <td className="px-5 py-3"><Badge variant={ruleVariant[r.type] || 'info'}>{r.type}</Badge></td>
                                                <td className="px-5 py-3 text-xs font-mono text-[#64748B]">{r.time}</td>
                                                <td className="px-5 py-3"><Badge variant={statusVariant[r.status] || 'info'}>{r.status}</Badge></td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => handleToggle(r.id, r.status)} className="p-1.5 rounded-lg hover:bg-[#2563EB]/10 hover:text-[#2563EB] text-[#64748B] transition-colors" title={r.status === 'Active' ? 'Disable Rule' : 'Enable Rule'}><Edit2 size={14} /></button>
                                                        <button onClick={() => handleRemove(r.id)} className="p-1.5 rounded-lg hover:bg-[#EF4444]/10 hover:text-[#EF4444] text-[#64748B] transition-colors" title="Remove"><Trash2 size={14} /></button>
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
            </Card>
        </div>
    );
};

export default FirewallPage;
