import threading
import datetime
import scapy.all as scapy
from backend.database.models import db, PacketStats, Threat, AttackMemory, FirewallRule, SystemLog

class SnifferState:
    running = False
    app_context = None

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

                # Generate biological firewall rule / antibody based on threat severity
                if conf >= 90:
                    # check if rule exists
                    existing = FirewallRule.query.filter_by(ip=src).first()
                    if not existing:
                        rule = FirewallRule(ip=src, action="BLOCK", status="Active")
                        db.session.add(rule)
                        
                        memory = AttackMemory(src_ip=src, type=threat_type, rule_applied=f"BLOCK IP {src}")
                        db.session.add(memory)
                        
                        log2 = SystemLog(type="Firewall", message=f"Generated antibody: BLOCK IP {src}")
                        db.session.add(log2)

            # Insert packet stat
            stat = PacketStats(src_ip=src, dst_ip=dst, protocol=protocol, size=size, status=stat_status)
            db.session.add(stat)
            db.session.commit()

def start_sniffer(app):
    SnifferState.app_context = app
    SnifferState.running = True

    try:
        ifaces = scapy.get_if_list()
        default_iface = scapy.conf.iface
        
        with app.app_context():
            log = SystemLog(type="System", message=f"Packet monitoring initiated. Using default interface: {default_iface}")
            db.session.add(log)
            log2 = SystemLog(type="System", message=f"Total interfaces found: {len(ifaces)}")
            db.session.add(log2)
            db.session.commit()

        # Capture packets
        # On Windows, we often need to be specific or use 'sniff(iface=conf.iface)'
        scapy.sniff(prn=process_packet, filter="ip", store=False)
        
    except Exception as e:
        with app.app_context():
            errMsg = f"Sniffer Critical Error: {str(e)}"
            print(errMsg)
            log = SystemLog(type="System", message=errMsg)
            db.session.add(log)
            db.session.commit()
