import React, { useState } from 'react';
import { Card, Button, PageHeader } from '../components/UI';
import { Settings, Activity, Shield, Database, Bell, Network, Key, Globe, RefreshCw, Power } from 'lucide-react';
import { motion } from 'framer-motion';

const Toggle = ({ active, onToggle }) => (
    <button
        onClick={onToggle}
        className={[
            'w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 outline-none focus:ring-2 focus:ring-[#2563EB]/20',
            active ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]',
        ].join(' ')}
        role="switch"
        aria-checked={active}
    >
        <motion.span
            initial={false}
            animate={{ x: active ? 26 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
        />
    </button>
);

const ToggleCard = ({ icon: Icon, title, desc, active, onToggle, color = '#2563EB', bg = 'rgba(37,99,235,0.1)' }) => (
    <Card className="p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl flex-shrink-0 transition-colors" style={{ backgroundColor: active ? bg : 'rgba(100,116,139,0.08)', color: active ? color : '#94a3b8' }}>
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#0F172A]">{title}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{desc}</p>
                </div>
            </div>
            <Toggle active={active} onToggle={onToggle} />
        </div>
    </Card>
);

const SettingsPage = () => {
    const defaultConfig = {
        packetCapture: true,
        mlDetection: true,
        autoFirewall: false,
        notifications: true,
        iface: 'eth0',
        apiKey: 'C4-X92-IMMUNE-7721-B8',
    };

    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('immune_config');
        return saved ? JSON.parse(saved) : defaultConfig;
    });

    const [saving, setSaving] = useState(false);

    const toggle = (key) => {
        setConfig(prev => {
            let next = { ...prev, [key]: !prev[key] };
            
            // Logic: Dependency checks
            if (key === 'packetCapture' && !next.packetCapture) {
                next.mlDetection = false;
                next.autoFirewall = false;
            }
            if (key === 'mlDetection' && !next.mlDetection) {
                next.autoFirewall = false;
            }
            if (key === 'mlDetection' && next.mlDetection && !next.packetCapture) {
                next.packetCapture = true;
            }
            if (key === 'autoFirewall' && next.autoFirewall) {
                next.packetCapture = true;
                next.mlDetection = true;
            }

            localStorage.setItem('immune_config', JSON.stringify(next));
            return next;
        });
    };

    const handleReset = () => {
        if (window.confirm("Reset all settings to factory default values?")) {
            setConfig(defaultConfig);
            localStorage.setItem('immune_config', JSON.stringify(defaultConfig));
        }
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            alert("Security configuration synchronized with local node.");
        }, 800);
    };

    const handlePurge = () => {
        if (window.confirm("CRITICAL: This will wipe all historical threat intelligence. Proceed?")) {
            alert("Threat memory purged.");
        }
    };

    const TOGGLES = [
        { key: 'packetCapture', icon: Activity, title: 'Packet Capture', desc: 'Continuous monitoring of network interfaces', color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
        { key: 'mlDetection', icon: Shield, title: 'ML Detection', desc: 'Machine learning entropy-based anomaly engine', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
        { key: 'autoFirewall', icon: Database, title: 'Auto Firewall', desc: 'Automatically generate antibody rules for detected threats', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        { key: 'notifications', icon: Bell, title: 'System Alerts', desc: 'Push notifications for high confidence threat events', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    ];

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <PageHeader title="System Configuration" subtitle="Configure the behavior of the autonomous defense network">
                <Button variant="secondary" size="sm" onClick={handleReset}><RefreshCw size={14} /> Reset Defaults</Button>
                <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" /> : <Power size={14} />}
                    {saving ? 'Syncing...' : 'Save Changes'}
                </Button>
            </PageHeader>

            {/* Module toggles */}
            <div>
                <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-widest mb-3">Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TOGGLES.map(t => (
                        <div key={t.key} className={(!config.packetCapture && (t.key === 'mlDetection' || t.key === 'autoFirewall')) || (!config.mlDetection && t.key === 'autoFirewall') ? 'opacity-60 grayscale-[0.5]' : ''}>
                            <ToggleCard
                                icon={t.icon}
                                title={t.title}
                                desc={t.desc}
                                active={config[t.key]}
                                onToggle={() => toggle(t.key)}
                                color={t.color}
                                bg={t.bg}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Hardware settings */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E2E8F0]">
                    <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#2563EB]">
                        <Network size={16} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#0F172A]">Hardware & Interface</p>
                        <p className="text-xs text-[#64748B]">Configure low-level network parameters</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-semibold text-[#64748B] uppercase tracking-widest">Active Network Interface</label>
                        <select
                            value={config.iface}
                            onChange={e => setConfig(c => ({ ...c, iface: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm font-medium outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all appearance-none cursor-pointer"
                        >
                            <option value="eth0">eth0 — Physical Ethernet</option>
                            <option value="wlan0">wlan0 — Wireless Interface</option>
                            <option value="lo">lo — Local Loopback</option>
                            <option value="tun0">tun0 — VPN Tunnel</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-semibold text-[#64748B] uppercase tracking-widest">API Security Key</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={config.apiKey}
                                readOnly
                                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm font-mono outline-none pr-10 cursor-default"
                            />
                            <button className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-white text-[#94a3b8] transition-colors">
                                <Key size={13} />
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Danger zone */}
            <Card className="p-6 border-[#EF4444]/20" style={{ borderStyle: 'dashed', background: 'rgba(239,68,68,0.02)' }}>
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-[#EF4444]/10 rounded-lg text-[#EF4444]">
                        <Globe size={16} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#EF4444] uppercase tracking-wider">Danger Zone</p>
                        <p className="text-xs text-[#64748B]">Irreversible system actions</p>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-[#0F172A]">Wipe Attack Memory</p>
                        <p className="text-xs text-[#64748B] mt-0.5">Permanently clear all historical attack data from the security database</p>
                    </div>
                    <Button variant="danger" size="sm" onClick={handlePurge}>Purge Records</Button>
                </div>
            </Card>

            {/* Footer */}
            <p className="text-center text-[10px] font-mono text-[#94a3b8] uppercase tracking-widest">
                Core Version 1.2.0-stable · Node: IMMUNE-NODE-X502
            </p>
        </div>
    );
};

export default SettingsPage;
