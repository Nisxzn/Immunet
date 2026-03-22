# Immunet: Biological Intrusion Detection System

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Status-Active-green?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Stack-React%20%2B%20Flask-orange?style=for-the-badge" alt="Stack">
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License">
</p>

---

## 🧬 Overview

**Immunet** is a state-of-the-art Network Security and Intrusion Detection System (IDS) inspired by the biological immune system. Just as the human immune system identifies and neutralizes pathogens, **Immunet** monitors network traffic, captures real-time packets, and generates "Antibodies" (firewall rules) to protect your digital environment from "Malicious Antigens".

Built with a focus on high-performance packet capture and a premium user experience, Immunet provides security professionals with a clear, interactive, and intelligent view of their network health.

---

## ✨ Key Features

- 📡 **Real-time Packet Capture**: Monitoring network interfaces using Scapy for deep packet inspection.
- 🧠 **Immune Memory**: A persistence layer for tracking previous attack patterns and neutralizing them efficiently.
- 🧪 **Antibody Generator**: Automated firewall rule generation based on detected threat signatures.
- 📊 **Dynamic Dashboard**: Interactive visualizations of network throughput, threat levels, and system performance.
- 🧱 **Active Firewall**: Robust management of inbound and outbound rules with real-time status updates.
- 🚨 **Threat Intelligence**: Multi-stage classification of network activities into Safe, Suspicious, or Malicious categories.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Chart.js](https://www.chartjs.org/)

### Backend
- **Engine**: [Flask](https://flask.palletsprojects.com/)
- **Packet Engine**: [Scapy](https://scapy.net/)
- **Database**: [SQLite](https://www.sqlite.org/) with [SQLAlchemy](https://www.sqlalchemy.org/)
- **System Metrics**: [psutil](https://github.com/giampaolo/psutil)

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Administrator/Sudo privileges (Required for packet capture)

### 1. Clone the Repository
```bash
git clone https://github.com/Nisxzn/Immunet.git
cd Immunet
```

### 2. Backend Setup
```bash
# Create a virtual environment
python -m venv venv
source venv/bin/scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
python run_backend.py
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

---

## 📂 Project Structure

```text
├── backend/            # Flask API & Security Engines
│   ├── packet_capture/ # Scapy-based monitoring
│   ├── detection/      # Threat classification logic
│   └── database/       # SQLAlchemy models & migrations
├── frontend/           # React + Vite application
│   ├── src/pages/      # Dashboard, Packets, Firewall, etc.
│   └── src/components/ # Reusable UI components
├── run_backend.py      # Entry point for the backend
└── requirements.txt    # Python dependencies
```

---

## 🛡️ Security Disclaimer

This tool is designed for educational and network administrative purposes. Ensure you have explicit permission before monitoring any network that you do not own or manage.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Developed by <b>Nisxzn</b>
</p>
