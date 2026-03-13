import random
import sqlite3
import datetime

print("\n==============================")
print("IMMUNE NETWORK SECURITY TEST")
print("==============================\n")

# -----------------------------
# 1. Simulate Packet Capture
# -----------------------------

print("[1] Simulating Packet Capture...")

packet = {
    "src_ip": "192.168.1." + str(random.randint(2, 200)),
    "dst_ip": "8.8.8.8",
    "protocol": random.choice(["TCP", "UDP", "ICMP"]),
    "packet_size": random.randint(40, 1500),
    "src_port": random.randint(1000, 65535),
    "dst_port": random.choice([80, 443, 22, 21])
}

print("Packet Captured:", packet)

# -----------------------------
# 2. Feature Extraction
# -----------------------------

print("\n[2] Extracting Features...")

features = [
    packet["packet_size"],
    packet["src_port"],
    packet["dst_port"]
]

print("Feature Vector:", features)

# -----------------------------
# 3. Anomaly Detection
# -----------------------------

print("\n[3] Running Anomaly Detection...")

# simple anomaly rule for testing
if packet["packet_size"] > 1200 or packet["src_port"] > 60000:
    anomaly = True
else:
    anomaly = False

print("Anomaly Detected:", anomaly)

# -----------------------------
# 4. Threat Classification
# -----------------------------

attack_type = "Normal"

if anomaly:
    print("\n[4] Classifying Threat...")
    attack_type = random.choice([
        "SYN Flood",
        "Port Scan",
        "DDoS",
        "Brute Force"
    ])
    print("Attack Type:", attack_type)

# -----------------------------
# 5. Generate Firewall Rule
# -----------------------------

rule = None

if anomaly:
    print("\n[5] Generating Antibody (Firewall Rule)...")
    rule = f"BLOCK IP {packet['src_ip']}"
    print("Firewall Rule:", rule)

# -----------------------------
# 6. Store Attack in Database
# -----------------------------

print("\n[6] Storing Attack Memory...")

conn = sqlite3.connect("attack_memory.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS attacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    src_ip TEXT,
    attack_type TEXT,
    timestamp TEXT,
    firewall_rule TEXT
)
""")

if anomaly:
    cursor.execute("""
    INSERT INTO attacks (src_ip, attack_type, timestamp, firewall_rule)
    VALUES (?, ?, ?, ?)
    """, (
        packet["src_ip"],
        attack_type,
        str(datetime.datetime.now()),
        rule
    ))

    conn.commit()
    print("Attack stored in database")
else:
    print("Normal traffic - not stored")

conn.close()

# -----------------------------
# 7. System Summary
# -----------------------------

print("\n==============================")
print("PIPELINE TEST COMPLETE")
print("==============================")

print("\nSummary:")
print("Source IP:", packet["src_ip"])
print("Protocol:", packet["protocol"])
print("Attack Type:", attack_type)
print("Firewall Rule:", rule)

print("\nBackend pipeline working successfully!\n")
