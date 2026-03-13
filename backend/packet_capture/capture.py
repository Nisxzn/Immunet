import threading
import datetime
import scapy.all as scapy
from backend.database.models import db, PacketStats, Threat, AttackMemory, FirewallRule, SystemLog

import random
import time

class SnifferState:
    running = False
    app_context = None
    last_packet_time = 0

def simulate_traffic(app):
    """Generates baseline traffic if no real packets are detected."""
    with app.app_context():
        # Backfill some history if DB is empty for meaningful comparisons
        if PacketStats.query.count() < 10:
            print("Backfilling historical data for meaningful dashboard comparisons...")
            now = datetime.datetime.utcnow()
            # Last month
            for _ in range(200):
                ts = now - datetime.timedelta(days=random.randint(31, 60))
                p = PacketStats(src_ip=f"192.168.1.{random.randint(1, 254)}", dst_ip="10.0.0.5", 
                                protocol=random.choice(["TCP", "UDP", "ICMP"]), size=random.randint(40, 1500), 
                                status="Normal", timestamp=ts)
                db.session.add(p)
            # This month
            for _ in range(150):
                ts = now - datetime.timedelta(days=random.randint(1, 28))
                p = PacketStats(src_ip=f"192.168.1.{random.randint(1, 254)}", dst_ip="10.0.0.5", 
                                protocol=random.choice(["TCP", "UDP", "ICMP"]), size=random.randint(40, 1500), 
                                status="Normal", timestamp=ts)
                db.session.add(p)
            db.session.commit()

    while SnifferState.running:
        # Generate packet every 2-4 seconds for a "live" feel
        with app.app_context():
            src = f"192.168.1.{random.randint(2, 254)}"
            proto = random.choice(["TCP", "UDP", "ICMP", "TCP", "TCP", "UDP"])
            size = random.randint(64, 1400)
            
            # 15% chance of a threat simulation
            if random.random() < 0.15:
                # Randomize threat type
                r = random.random()
                if r < 0.4: size = 2000 # DDoS
                elif r < 0.7: protocol = "ICMP"; size = 600 # Ping of Death
                else: protocol = "TCP"; size = 30 # SYN Flood
            
            process_packet_data(src, "10.0.0.5", proto, size)
        
        time.sleep(random.randint(2, 5))

def process_packet_data(src, dst, protocol, size):
    """Shared logic for real and simulated packets."""
    threat_type, conf, threat_status = detect_threats(src, protocol, size)

    stat_status = "Normal"
    if conf >= 90: stat_status = "Attack"
    elif conf >= 70: stat_status = "Suspicious"

    # Create log entries and threats if dangerous
    if stat_status != "Normal":
        threat = Threat(type=threat_type, src_ip=src, confidence=conf, status=threat_status)
        db.session.add(threat)
        
        log = SystemLog(type="Attack", message=f"{threat_type} detected from {src} ({conf}% confidence).")
        db.session.add(log)

        if conf >= 90:
            existing = FirewallRule.query.filter_by(ip=src).first()
            if not existing:
                rule = FirewallRule(ip=src, action="BLOCK", status="Active")
                db.session.add(rule)
                memory = AttackMemory(src_ip=src, type=threat_type, rule_applied=f"BLOCK IP {src}")
                db.session.add(memory)
                log2 = SystemLog(type="Firewall", message=f"Generated antibody: BLOCK IP {src}")
                db.session.add(log2)

    stat = PacketStats(src_ip=src, dst_ip=dst, protocol=protocol, size=size, status=stat_status)
    db.session.add(stat)
    db.session.commit()
    SnifferState.last_packet_time = time.time()
def detect_threats(src_ip, protocol, size):
    # A simple mock biological-inspired AI evaluation
    confidence = 0
    threat_type = "Normal"
    status = "Normal"

    if int(size) > 1500:
        threat_type = "DDoS"
        confidence = 92
        status = "Active"
    elif protocol == "TCP" and int(size) < 40:
        threat_type = "SYN Flood"
        confidence = 85
        status = "Suspicious"
    elif protocol == "ICMP" and int(size) > 500:
        threat_type = "Ping of Death"
        confidence = 90
        status = "Active"

    return threat_type, confidence, status

def process_packet(packet):
    if not SnifferState.app_context:
        return

    if scapy.IP in packet:
        src = packet[scapy.IP].src
        dst = packet[scapy.IP].dst
        size = len(packet)
        protocol = "Other"

        if scapy.TCP in packet: protocol = "TCP"
        elif scapy.UDP in packet: protocol = "UDP"
        elif scapy.ICMP in packet: protocol = "ICMP"

        with SnifferState.app_context.app_context():
            process_packet_data(src, dst, protocol, size)

def start_sniffer(app):
    SnifferState.app_context = app
    SnifferState.running = True

    # Start simulator thread
    sim_thread = threading.Thread(target=simulate_traffic, args=(app,), daemon=True)
    sim_thread.start()

    try:
        # On Windows, scapy sometimes needs NPCAP or specific interface
        # We try to use the default but catch errors
        print("Starting Scapy sniffer...")
        scapy.sniff(prn=process_packet, filter="ip", store=False)
        
    except Exception as e:
        with app.app_context():
            errMsg = f"Sniffer Warning (using simulator fallback): {str(e)}"
            print(errMsg)
            log = SystemLog(type="System", message=errMsg)
            db.session.add(log)
            db.session.commit()
        
        # Keep simulator running
        while SnifferState.running:
            time.sleep(1)
