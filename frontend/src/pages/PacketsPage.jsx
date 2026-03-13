import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Skeleton, PageHeader } from '../components/UI';
import { Wifi, Search, RefreshCw, Download, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { packetService } from '../services/api';



const statusStyle = {
    Normal: { badge: 'success', dot: '#22C55E' },
    Suspicious: { badge: 'warning', dot: '#F59E0B' },
    Attack: { badge: 'danger', dot: '#EF4444' },
};

const PacketsPage = () => {
    const [packets, setPackets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [proto, setProto] = useState('All');

    const load = async () => {
        setLoading(true);
        try {
            const res = await packetService.getAll();
            setPackets(res.data?.data || res.data || []);
        } catch {
            setPackets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = packets.filter(p => {
        const matchQuery = !filter || p.src?.includes(filter) || p.dst?.includes(filter) || p.proto?.toLowerCase().includes(filter.toLowerCase());
        const matchProto = proto === 'All' || p.proto === proto;
        return matchQuery && matchProto;
    });

    const handleExport = () => {
        if (filtered.length === 0) return alert("No packets to export.");
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Time,Source IP,Destination IP,Protocol,Size,Status\n"
            + filtered.map(p => `${p.time},${p.src},${p.dst},${p.proto},${p.size},${p.status}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `live_packets_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-5">
            <PageHeader title="Live Packet Monitor" subtitle="Real-time analysis of incoming network traffic">
                <Button variant="secondary" size="sm" onClick={load}>
                    <RefreshCw size={14} /> Refresh
                </Button>
                <Button variant="secondary" size="sm" onClick={handleExport}>
                    <Download size={14} /> Export CSV
                </Button>
            </PageHeader>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-48 relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                        <input
                            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#94a3b8]"
                            placeholder="Filter by IP or Protocol..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {['All', 'TCP', 'UDP', 'ICMP'].map(p => (
                            <button
                                key={p}
                                onClick={() => setProto(p)}
                                className={[
                                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                    proto === p ? 'bg-[#2563EB] text-white' : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:bg-white hover:border-[#2563EB]/30',
                                ].join(' ')}
                            >
                                {p}
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
                                {['Time', 'Source IP', 'Destination IP', 'Protocol', 'Size (B)', 'Status'].map(h => (
                                    <th key={h} className="px-5 py-3 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                    <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                                ))
                                : (
                                    <AnimatePresence>
                                        {filtered.map((pkt, idx) => {
                                            const s = statusStyle[pkt.status] || { badge: 'secondary', dot: '#64748B' };
                                            return (
                                                <motion.tr
                                                    key={pkt.id}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    className="hover:bg-[#F8FAFC] transition-colors group"
                                                >
                                                    <td className="px-5 py-3 font-mono text-xs text-[#64748B]">{pkt.time}</td>
                                                    <td className="px-5 py-3 text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{pkt.src}</td>
                                                    <td className="px-5 py-3 text-sm text-[#64748B]">{pkt.dst}</td>
                                                    <td className="px-5 py-3">
                                                        <span className="bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded text-[10px] font-bold">{pkt.proto}</span>
                                                    </td>
                                                    <td className="px-5 py-3 text-sm font-medium text-[#0F172A]">{pkt.size}</td>
                                                    <td className="px-5 py-3">
                                                        <Badge variant={s.badge}>{pkt.status}</Badge>
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
                <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
                    <span>Showing {filtered.length} of {packets.length} packets</span>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                        <span className="font-semibold uppercase tracking-widest">Capture Active · Primary-Eth0</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PacketsPage;
