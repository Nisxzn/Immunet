import os
import sys

# Ensure backend package is importable
sys.path.append(os.getcwd())

from backend.run import create_app
from backend.packet_capture.capture import start_sniffer
import threading
from flask_cors import CORS

if __name__ == '__main__':
    app = create_app()
    CORS(app)
    
    print("Starting Immune Network Security System...")
    print("Backend API: http://localhost:5000/api")
    
    # Start sniffer in a separate thread
    t = threading.Thread(target=start_sniffer, args=(app,), daemon=True)
    t.start()
    
    print("Sniffer thread started. Check System Logs page in dashboard for status.")
    
    app.run(port=5000, host='0.0.0.0', debug=False, use_reloader=False)
