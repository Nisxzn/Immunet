from flask import Flask, jsonify, request
from backend.database.models import db, PacketStats, Threat, AttackMemory, FirewallRule, SystemLog
from backend.packet_capture.capture import start_sniffer
import threading
import os

def create_app():
    app = Flask(__name__)
    # Find absolute path to project root
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'immune_network.db')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)

    with app.app_context():
        db.create_all()

    # Log sniffer start as a baseline
    # (Actually we do this in start_sniffer)

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.json
        return jsonify({'token': 'jwt_token_here', 'user': data.get('email', 'admin@immune.net')})

    @app.route('/api/stats', methods=['GET'])
    def get_stats():
        return jsonify({
            'total_packets': PacketStats.query.count(),
            'total_threats': Threat.query.count(),
            'total_blocked': FirewallRule.query.filter_by(action='BLOCK').count()
        })

    @app.route('/api/packets', methods=['GET'])
    def get_packets():
        packets = PacketStats.query.order_by(PacketStats.timestamp.desc()).limit(100).all()
        return jsonify({
            'data': [{
                'id': p.id,
                'src': p.src_ip,
                'dst': p.dst_ip,
                'proto': p.protocol,
                'size': p.size,
                'status': p.status,
                'time': p.timestamp.strftime('%H:%M:%S')
            } for p in packets]
        })

    @app.route('/api/threats', methods=['GET', 'POST'])
    def get_threats():
        threats = Threat.query.order_by(Threat.timestamp.desc()).limit(50).all()
        return jsonify({
            'data': [{
                'id': t.id,
                'type': t.type,
                'src': t.src_ip,
                'conf': t.confidence,
                'status': t.status,
                'time': t.timestamp.strftime('%H:%M:%S')
            } for t in threats]
        })

    @app.route('/api/threats/block', methods=['POST'])
    def block_threat():
        data = request.json
        ip = data.get('ip')
        if ip:
            existing = FirewallRule.query.filter_by(ip=ip).first()
            if not existing:
                rule = FirewallRule(ip=ip, action="BLOCK", status="Active")
                db.session.add(rule)
                mem = AttackMemory(src_ip=ip, type="Manual Block", rule_applied=f"BLOCK IP {ip}")
                db.session.add(mem)
                log = SystemLog(type="Firewall", message=f"Manual antibody generated: BLOCK IP {ip}")
                db.session.add(log)
                db.session.commit()
            # Update threat status
            Threat.query.filter_by(src_ip=ip, status='Active').update({'status': 'Neutralized'})
            db.session.commit()
        return jsonify({'status': 'ok'})

    @app.route('/api/threats/block-all', methods=['POST'])
    def block_all_threats():
        threats = Threat.query.filter_by(status='Active').all()
        for t in threats:
            t.status = 'Neutralized'
            existing = FirewallRule.query.filter_by(ip=t.src_ip).first()
            if not existing:
                rule = FirewallRule(ip=t.src_ip, action="BLOCK", status="Active")
                db.session.add(rule)
                mem = AttackMemory(src_ip=t.src_ip, type=t.type, rule_applied=f"BLOCK IP {t.src_ip}")
                db.session.add(mem)
                log = SystemLog(type="Firewall", message=f"Auto-antibody generated: BLOCK IP {t.src_ip}")
                db.session.add(log)
        db.session.commit()
        return jsonify({'status': 'ok'})

    @app.route('/api/threats/<int:id>/ignore', methods=['POST'])
    def ignore_threat(id):
        threat = Threat.query.get(id)
        if threat:
            threat.status = 'Ignored'
            db.session.commit()
        return jsonify({'status': 'ok'})

    @app.route('/api/attacks', methods=['GET', 'DELETE'])
    def handle_attacks():
        if request.method == 'DELETE':
            AttackMemory.query.delete()
            db.session.commit()
            return jsonify({'status': 'ok'})
        
        attacks = AttackMemory.query.order_by(AttackMemory.timestamp.desc()).all()
        return jsonify({
            'data': [{
                'id': a.id,
                'src': a.src_ip,
                'type': a.type,
                'rule': a.rule_applied,
                'time': a.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            } for a in attacks]
        })

    @app.route('/api/firewall', methods=['GET', 'POST'])
    def handle_firewall():
        if request.method == 'POST':
            data = request.json
            ip = data.get('ip')
            action = data.get('action', 'BLOCK')
            if ip:
                rule = FirewallRule(ip=ip, action=action, status="Active")
                db.session.add(rule)
                log = SystemLog(type="Firewall", message=f"Manual rule added: {action} {ip}")
                db.session.add(log)
                db.session.commit()
            return jsonify({'status': 'ok'})

        rules = FirewallRule.query.order_by(FirewallRule.timestamp.desc()).all()
        return jsonify({
            'data': [{
                'id': r.id,
                'ip': r.ip,
                'type': r.action,
                'status': r.status,
                'time': r.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            } for r in rules]
        })

    @app.route('/api/firewall/<int:id>', methods=['PATCH', 'DELETE'])
    def update_firewall(id):
        rule = FirewallRule.query.get(id)
        if not rule:
            return jsonify({'error': 'Not found'}), 404
            
        if request.method == 'DELETE':
            db.session.delete(rule)
            log = SystemLog(type="Firewall", message=f"Rule #{id} removed.")
            db.session.add(log)
            db.session.commit()
        elif request.method == 'PATCH':
            data = request.json
            rule.status = data.get('status', rule.status)
            log = SystemLog(type="Firewall", message=f"Rule #{id} status changed to {rule.status}.")
            db.session.add(log)
            db.session.commit()
            
        return jsonify({'status': 'ok'})

    @app.route('/api/logs', methods=['GET', 'DELETE'])
    def handle_logs():
        if request.method == 'DELETE':
            SystemLog.query.delete()
            db.session.commit()
            return jsonify({'status': 'ok'})
            
        logs = SystemLog.query.order_by(SystemLog.timestamp.desc()).limit(200).all()
        return jsonify({
            'data': [{
                'id': l.id,
                'type': l.type,
                'msg': l.message,
                'time': l.timestamp.strftime('%H:%M:%S')
            } for l in logs]
        })

    return app
