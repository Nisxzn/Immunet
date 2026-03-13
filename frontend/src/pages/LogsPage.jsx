import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, PageHeader } from '../components/UI';
import { Terminal, Download, Pause, Play, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { logService } from '../services/api';



const LOG_COLORS = {
    System: { prefix: 'text-[#2563EB]', bracket: 'SYS' },
    Attack: { prefix: 'text-[#EF4444]', bracket: 'ATK' },
    Firewall: { prefix: 'text-[#22C55E]', bracket: 'FWL' },
};

const TABS = ['All', 'System', 'Attack', 'Firewall'];

const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('All');
    const [paused, setPaused] = useState(false);
    const bottomRef = useRef(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await logService.getAll();
            setLogs(res.data?.data || res.data || []);
        } catch {
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);
    useEffect(() => {
        if (!paused) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs, paused]);

    // Simple Auto-refresh for logs
    useEffect(() => {
        if (paused) return;
        const interval = setInterval(() => {
            load();
        }, 5000);
        return () => clearInterval(interval);
    }, [paused]);

    const handleClear = async () => {
        if (!window.confirm("Permanently delete all system logs?")) return;
        setLoading(true);
        try {
            await logService.clearAll();
            await load();
        } catch (e) { console.error(e); setLoading(false); }
    };

    const handleExport = () => {
        if (logs.length === 0) return alert("No logs to export.");
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Time,Type,Message\n"
            + logs.map(l => `${l.id},${l.time},${l.type},"${l.msg}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `system_logs_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filtered = tab === 'All' ? logs : logs.filter(l => l.type === tab);

    return (
        <div className="space-y-5 flex flex-col" style={{ height: 'calc(100vh - 112px)' }}>
            <PageHeader title="System Log Center" subtitle="Real-time chronicle of all system events and security transitions">
                <Button variant="secondary" size="sm" onClick={() => setPaused(!paused)}>
                    {paused ? <Play size={14} /> : <Pause size={14} />} {paused ? 'Resume' : 'Pause'}
                </Button>
                <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={14} /> Refresh</Button>
                <Button variant="secondary" size="sm" onClick={handleExport}><Download size={14} /> Export</Button>
                <Button variant="danger" size="sm" onClick={handleClear} disabled={logs.length === 0}><Trash2 size={14} /> Clear</Button>
            </PageHeader>

            {/* Tabs */}
            <div className="flex items-center gap-2">
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={[
                            'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                            tab === t ? 'bg-[#2563EB] text-white shadow-sm shadow-[#2563EB]/20' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]',
                        ].join(' ')}
                    >
                        {t} Logs
                        <span className={[
                            'ml-2 text-xs px-1.5 py-0.5 rounded-full font-mono',
                            tab === t ? 'bg-white/20 text-white' : 'bg-[#F8FAFC] text-[#94a3b8]',
                        ].join(' ')}>
                            {t === 'All' ? logs.length : logs.filter(l => l.type === t).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Console */}
            <div className="flex-1 bg-[#0F172A] rounded-xl overflow-hidden flex flex-col border border-[#1E293B]">
                {/* Console header */}
                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-widest text-white/30">
                        <Terminal size={12} />
                        Live Console Output
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/30">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" /> Stream Connected
                        </span>
                        <span>Node: CORE-ALPHA-01</span>
                        {paused && <span className="text-[#F59E0B]">● PAUSED</span>}
                    </div>
                </div>

                {/* Log output */}
                <div className="flex-1 overflow-auto p-5 space-y-1.5">
                    {loading ? (
                        <div className="text-[#64748B] font-mono text-sm animate-pulse">Connecting to log stream...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-[#475569] font-mono text-sm">No logs to display.</div>
                    ) : (
                        filtered.map((log) => {
                            const c = LOG_COLORS[log.type] || { prefix: 'text-white/50', bracket: '???' };
                            return (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-3 font-mono text-sm leading-relaxed group hover:bg-white/5 px-2 py-0.5 rounded transition-colors"
                                >
                                    <span className="text-white/20 whitespace-nowrap flex-shrink-0 text-xs">[{log.time}]</span>
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 flex-shrink-0 ${c.prefix}`}>
                                        {c.bracket}
                                    </span>
                                    <span className="text-white/70 break-all">{log.msg}</span>
                                </motion.div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                    {/* Cursor blink */}
                    <div className="flex items-center gap-2 font-mono text-sm text-white/20 mt-1">
                        <span>$</span>
                        <span className="w-2 h-4 bg-white/30 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogsPage;
