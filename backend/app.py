from flask import Flask, jsonify, request
import pg8000
from flask_cors import CORS
import os
import sys
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database connection configuration
DB_CONFIG = {
    'database': 'hon_412',  # Updated database name
    'user': 'yashupatel',    # Your username from the screenshot
    'password': '1973',      # Your password from the screenshot
    'host': 'localhost',
    'port': 5432
}

def get_db_connection():
    """Get a connection to the PostgreSQL database"""
    try:
        connection = pg8000.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def check_db_connection():
    """Check database connection and print status"""
    try:
        conn = get_db_connection()
        if conn:
            print(f"\n✅ Successfully connected to PostgreSQL database: {DB_CONFIG['database']}")
            
            # Count tables in the database
            cursor = conn.cursor()
            cursor.execute("""
                SELECT count(*) FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            """)
            table_count = cursor.fetchone()[0]
            print(f"📊 Found {table_count} tables in the database")
            
            # Get table names
            cursor.execute("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """)
            tables = [row[0] for row in cursor.fetchall()]
            if tables:
                print("📋 Tables found:")
                for table in tables:
                    print(f"   - {table}")
            
            cursor.close()
            conn.close()
            return True
        else:
            print(f"\n❌ Failed to connect to PostgreSQL database: {DB_CONFIG['database']}")
            return False
    except Exception as e:
        print(f"\n❌ Error checking database connection: {e}")
        return False

# Basic test route
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "API is working!"})

# Get all clients
@app.route('/api/clients', methods=['GET'])
def get_clients():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get clients with machine count and last service date
        cursor.execute("""
            SELECT 
                c.*,
                COUNT(m.machine_id) AS machines_count,
                MAX(m.last_service_date) AS last_service_date
            FROM 
                clients c
            LEFT JOIN 
                machines m ON c.client_id = m.client_id
            GROUP BY 
                c.client_id
            ORDER BY 
                c.name
        """)
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        clients_data = cursor.fetchall()
        
        # Convert to list of dictionaries
        clients = []
        for client in clients_data:
            client_dict = dict(zip(column_names, client))
            # Convert datetime objects to strings
            for key, value in client_dict.items():
                if isinstance(value, datetime):
                    client_dict[key] = value.isoformat()
            clients.append(client_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "clients": clients})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Add a new client
@app.route('/api/clients', methods=['POST'])
def add_client():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({"success": False, "error": "Client name is required"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert new client
        cursor.execute("""
            INSERT INTO clients (name, contact_person, email, phone, address, industry, status, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING client_id
        """, (
            data.get('name'),
            data.get('contact_person'),
            data.get('email'),
            data.get('phone'),
            data.get('address'),
            data.get('industry'),
            data.get('status', 'Active'),
            data.get('notes')
        ))
        
        client_id = cursor.fetchone()[0]
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Client added successfully",
            "client_id": client_id
        })
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get all machine models
@app.route('/api/machine-models', methods=['GET'])
def get_machine_models():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM machine_models ORDER BY name")
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        models_data = cursor.fetchall()
        
        # Convert to list of dictionaries
        models = []
        for model in models_data:
            model_dict = dict(zip(column_names, model))
            # Convert datetime objects to strings
            for key, value in model_dict.items():
                if isinstance(value, datetime):
                    model_dict[key] = value.isoformat()
            models.append(model_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "models": models})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get all quotations
@app.route('/api/quotations', methods=['GET'])
def get_quotations():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get quotations with client names
        cursor.execute("""
            SELECT q.*, c.name as client_name 
            FROM quotations q
            LEFT JOIN clients c ON q.client_id = c.client_id
            ORDER BY q.date DESC
        """)
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        quotations_data = cursor.fetchall()
        
        # Convert to list of dictionaries
        quotations = []
        for quotation in quotations_data:
            quotation_dict = dict(zip(column_names, quotation))
            # Convert datetime objects to strings
            for key, value in quotation_dict.items():
                if isinstance(value, datetime):
                    quotation_dict[key] = value.isoformat()
            quotations.append(quotation_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "quotations": quotations})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get a single client by ID
@app.route('/api/clients/<int:client_id>', methods=['GET'])
def get_client(client_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get client details
        cursor.execute("""
            SELECT * FROM clients WHERE client_id = %s
        """, (client_id,))
        
        client_data = cursor.fetchone()
        if not client_data:
            return jsonify({"success": False, "error": "Client not found"}), 404
        
        # Get column names
        client_columns = [desc[0] for desc in cursor.description]
        client_dict = dict(zip(client_columns, client_data))
        
        # Get client's machines
        cursor.execute("""
            SELECT 
                m.*,
                mm.name as model_name,
                mm.cfm_capacity,
                mm.type,
                mm.category,
                (SELECT MAX(s.service_date) FROM services s WHERE s.machine_id = m.machine_id) as last_service
            FROM 
                machines m
            JOIN
                machine_models mm ON m.model_id = mm.model_id
            WHERE 
                m.client_id = %s
            ORDER BY 
                m.machine_serial
        """, (client_id,))
        
        machines_data = cursor.fetchall()
        machine_columns = [desc[0] for desc in cursor.description]
        
        # Convert machines to list of dictionaries
        machines = []
        for machine in machines_data:
            machine_dict = dict(zip(machine_columns, machine))
            # Convert datetime objects to strings
            for key, value in machine_dict.items():
                if isinstance(value, datetime):
                    machine_dict[key] = value.isoformat()
            machines.append(machine_dict)
        
        # Convert client datetime objects to strings
        for key, value in client_dict.items():
            if isinstance(value, datetime):
                client_dict[key] = value.isoformat()
        
        # Add machines to client dictionary
        client_dict['machines'] = machines
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "client": client_dict})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Update a client
@app.route('/api/clients/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({"success": False, "error": "Client name is required"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First check if client exists
        cursor.execute("SELECT client_id FROM clients WHERE client_id = %s", (client_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Client not found"}), 404
        
        # Update client
        cursor.execute("""
            UPDATE clients 
            SET 
                name = %s,
                contact_person = %s,
                email = %s,
                phone = %s,
                address = %s,
                industry = %s,
                status = %s,
                notes = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE client_id = %s
        """, (
            data.get('name'),
            data.get('contact_person'),
            data.get('email'),
            data.get('phone'),
            data.get('address'),
            data.get('industry'),
            data.get('status', 'Active'),
            data.get('notes'),
            client_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Client updated successfully"
        })
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get all part categories
@app.route('/api/part-categories', methods=['GET'])
def get_part_categories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM part_categories ORDER BY name")
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        categories_data = cursor.fetchall()
        
        # Convert to list of dictionaries
        categories = []
        for category in categories_data:
            category_dict = dict(zip(column_names, category))
            # Convert datetime objects to strings
            for key, value in category_dict.items():
                if isinstance(value, datetime):
                    category_dict[key] = value.isoformat()
            categories.append(category_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "categories": categories})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get all parts with category information
@app.route('/api/parts', methods=['GET'])
def get_parts():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get parts with category names
        cursor.execute("""
            SELECT 
                p.*,
                pc.name as category_name
            FROM 
                parts p
            LEFT JOIN 
                part_categories pc ON p.category_id = pc.category_id
            ORDER BY 
                p.name
        """)
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        parts_data = cursor.fetchall()
        
        # Convert to list of dictionaries
        parts = []
        for part in parts_data:
            part_dict = dict(zip(column_names, part))
            # Convert datetime objects to strings
            for key, value in part_dict.items():
                if isinstance(value, datetime):
                    part_dict[key] = value.isoformat()
            parts.append(part_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "parts": parts})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get a single part by ID
@app.route('/api/parts/<int:part_id>', methods=['GET'])
def get_part(part_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get part with category name
        cursor.execute("""
            SELECT 
                p.*,
                pc.name as category_name
            FROM 
                parts p
            LEFT JOIN 
                part_categories pc ON p.category_id = pc.category_id
            WHERE 
                p.part_id = %s
        """, (part_id,))
        
        part_data = cursor.fetchone()
        if not part_data:
            return jsonify({"success": False, "error": "Part not found"}), 404
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        part_dict = dict(zip(column_names, part_data))
        
        # Convert datetime objects to strings
        for key, value in part_dict.items():
            if isinstance(value, datetime):
                part_dict[key] = value.isoformat()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "part": part_dict})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Add a new part
@app.route('/api/parts', methods=['POST'])
def add_part():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('price'):
            return jsonify({
                "success": False, 
                "error": "Part name and price are required"
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert new part
        cursor.execute("""
            INSERT INTO parts (
                name, 
                sku, 
                category_id, 
                price, 
                stock, 
                threshold, 
                location, 
                description, 
                supplier, 
                supplier_part_no
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING part_id
        """, (
            data.get('name'),
            data.get('sku'),
            data.get('category_id'),
            data.get('price'),
            data.get('stock', 0),
            data.get('threshold', 5),
            data.get('location'),
            data.get('description'),
            data.get('supplier'),
            data.get('supplier_part_no')
        ))
        
        part_id = cursor.fetchone()[0]
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Part added successfully",
            "part_id": part_id
        })
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Update a part
@app.route('/api/parts/<int:part_id>', methods=['PUT'])
def update_part(part_id):
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or 'price' not in data:
            return jsonify({
                "success": False, 
                "error": "Part name and price are required"
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First check if part exists
        cursor.execute("SELECT part_id FROM parts WHERE part_id = %s", (part_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Part not found"}), 404
        
        # Update part
        cursor.execute("""
            UPDATE parts 
            SET 
                name = %s,
                sku = %s,
                category_id = %s,
                price = %s,
                stock = %s,
                threshold = %s,
                location = %s,
                description = %s,
                supplier = %s,
                supplier_part_no = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE part_id = %s
        """, (
            data.get('name'),
            data.get('sku'),
            data.get('category_id'),
            data.get('price'),
            data.get('stock', 0),
            data.get('threshold', 5),
            data.get('location'),
            data.get('description'),
            data.get('supplier'),
            data.get('supplier_part_no'),
            part_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Part updated successfully"
        })
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Update part stock level
@app.route('/api/parts/<int:part_id>/stock', methods=['PUT'])
def update_part_stock(part_id):
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'quantity' not in data:
            return jsonify({
                "success": False, 
                "error": "Quantity is required"
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First check if part exists
        cursor.execute("SELECT stock FROM parts WHERE part_id = %s", (part_id,))
        part = cursor.fetchone()
        if not part:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Part not found"}), 404
        
        current_stock = part[0]
        new_stock = current_stock + data['quantity']
        
        # Update part stock
        cursor.execute("""
            UPDATE parts 
            SET 
                stock = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE part_id = %s
        """, (
            new_stock,
            part_id
        ))
        
        # Add inventory transaction record
        cursor.execute("""
            INSERT INTO inventory_transactions (
                part_id,
                quantity,
                reference_type,
                reference_id,
                notes
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (
            part_id,
            data['quantity'],
            data.get('reference_type', 'Manual Adjustment'),
            data.get('reference_id'),
            data.get('notes')
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Stock updated successfully",
            "new_stock": new_stock
        })
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get all services with client and machine information
@app.route('/api/services', methods=['GET'])
def get_services():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get services with related information
        cursor.execute("""
            SELECT 
                s.*,
                c.name as client_name,
                m.machine_serial,
                mm.name as model_name,
                mm.type as machine_type,
                t.name as technician_name  -- Changed from u.name
            FROM 
                services s
            LEFT JOIN 
                machines m ON s.machine_id = m.machine_id
            LEFT JOIN 
                machine_models mm ON m.model_id = mm.model_id
            LEFT JOIN 
                clients c ON m.client_id = c.client_id
            LEFT JOIN 
                technicians t ON s.technician_id = t.technician_id -- Changed from users u
            ORDER BY 
                s.service_date DESC
        """)
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        services_data = cursor.fetchall()
        
        # Convert to list of dictionaries
        services = []
        for service in services_data:
            service_dict = dict(zip(column_names, service))
            # Convert datetime objects to strings
            for key, value in service_dict.items():
                if isinstance(value, datetime):
                    service_dict[key] = value.isoformat()
            
            # Get service parts
            cursor.execute("""
                SELECT 
                    sp.*,
                    p.name as part_name,
                    p.price as part_price
                FROM 
                    service_parts sp
                LEFT JOIN 
                    parts p ON sp.part_id = p.part_id
                WHERE 
                    sp.service_id = %s
            """, (service_dict['service_id'],))
            
            parts_columns = [desc[0] for desc in cursor.description]
            parts_data = cursor.fetchall()
            
            # Convert to list of dictionaries
            parts = []
            for part in parts_data:
                part_dict = dict(zip(parts_columns, part))
                parts.append(part_dict)
            
            service_dict['parts'] = parts
            services.append(service_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "services": services})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get a single service by ID
@app.route('/api/services/<int:service_id>', methods=['GET'])
def get_service(service_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get service details
        cursor.execute("""
            SELECT 
                s.*,
                c.name as client_name,
                c.client_id,
                m.machine_serial,
                mm.name as model_name,
                mm.type as machine_type,
                t.name as technician_name -- Changed from u.name
            FROM 
                services s
            LEFT JOIN 
                machines m ON s.machine_id = m.machine_id
            LEFT JOIN 
                machine_models mm ON m.model_id = mm.model_id
            LEFT JOIN 
                clients c ON m.client_id = c.client_id
            LEFT JOIN 
                technicians t ON s.technician_id = t.technician_id -- Changed from users u
            WHERE 
                s.service_id = %s
        """, (service_id,))
        
        service_data = cursor.fetchone()
        if not service_data:
            return jsonify({"success": False, "error": "Service not found"}), 404
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        service_dict = dict(zip(column_names, service_data))
        
        # Convert datetime objects to strings
        for key, value in service_dict.items():
            if isinstance(value, datetime):
                service_dict[key] = value.isoformat()
        
        # Get service parts
        cursor.execute("""
            SELECT 
                sp.*,
                p.name as part_name,
                p.price as part_price
            FROM 
                service_parts sp
            LEFT JOIN 
                parts p ON sp.part_id = p.part_id
            WHERE 
                sp.service_id = %s
        """, (service_id,))
        
        parts_columns = [desc[0] for desc in cursor.description]
        parts_data = cursor.fetchall()
        
        # Convert to list of dictionaries
        parts = []
        for part in parts_data:
            part_dict = dict(zip(parts_columns, part))
            parts.append(part_dict)
        
        service_dict['parts'] = parts
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "service": service_dict})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get all technicians/users for service assignment
@app.route('/api/technicians', methods=['GET'])
def get_technicians():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all active technicians
        cursor.execute("""
            SELECT technician_id, name, email, specialization, status -- Removed role, adjusted columns
            FROM technicians -- Changed from users
            WHERE status = 'Active' -- Assuming 'Active' status means they are available
            ORDER BY name
        """)
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        technicians_data = cursor.fetchall()
        
        # Convert to list of dictionaries
        technicians = []
        for tech in technicians_data:
            tech_dict = dict(zip(column_names, tech))
            technicians.append(tech_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "technicians": technicians})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Check technician availability for a specific date
@app.route('/api/technicians/availability', methods=['GET'])
def get_technician_availability():
    try:
        # Get date parameter from query string
        service_date = request.args.get('date')
        
        if not service_date:
            return jsonify({"success": False, "error": "Date parameter is required"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check which technicians are already assigned to services on the given date
        cursor.execute("""
            SELECT 
                technician_id, 
                COUNT(*) as service_count 
            FROM 
                services 
            WHERE 
                service_date = %s
                AND status = 'Scheduled'
            GROUP BY 
                technician_id
        """, (service_date,))
        
        # Create availability information - a list of technicians who are busy
        availability_data = cursor.fetchall()
        availability = []
        
        for data in availability_data:
            technician_id, service_count = data
            availability.append({
                "technician_id": technician_id,
                "is_busy": service_count > 0
            })
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True, 
            "date": service_date,
            "availability": availability
        })
    
    except Exception as e:
        print(f"Error checking technician availability: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Add a new service
@app.route('/api/services', methods=['POST'])
def add_service():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('machine_id') or not data.get('service_type') or not data.get('service_date'):
            return jsonify({
                "success": False, 
                "error": "Machine ID, service type, and service date are required"
            }), 400
        
        conn = get_db_connection()
        # Start a transaction
        conn.autocommit = False
        cursor = conn.cursor()
        
        try:
            # Check if machine exists
            cursor.execute("SELECT machine_id FROM machines WHERE machine_id = %s", (data.get('machine_id'),))
            if not cursor.fetchone():
                conn.rollback()
                cursor.close()
                conn.close()
                return jsonify({"success": False, "error": "Machine not found"}), 404
            
            # Check if technician exists
            if data.get('technician_id'):
                cursor.execute("SELECT technician_id FROM technicians WHERE technician_id = %s", (data.get('technician_id'),))
                if not cursor.fetchone():
                    conn.rollback()
                    cursor.close()
                    conn.close()
                    return jsonify({"success": False, "error": "Technician not found"}), 404
            
            # Insert new service
            cursor.execute("""
                INSERT INTO services (
                    machine_id, 
                    service_type, 
                    service_date, 
                    technician_id, 
                    status, 
                    notes,
                    created_at,
                    updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING service_id
            """, (
                data.get('machine_id'),
                data.get('service_type'),
                data.get('service_date'),
                data.get('technician_id'),
                data.get('status', 'Scheduled'),
                data.get('notes')
            ))
            
            service_id = cursor.fetchone()[0]
            
            # Add service parts if provided
            if data.get('parts'):
                for part in data.get('parts'):
                    # Validate part exists
                    cursor.execute("SELECT part_id, stock, price FROM parts WHERE part_id = %s", (part.get('part_id'),))
                    part_data = cursor.fetchone()
                    if not part_data:
                        conn.rollback()
                        cursor.close()
                        conn.close()
                        return jsonify({"success": False, "error": f"Part with ID {part.get('part_id')} not found"}), 404
                    
                    part_id, current_stock, part_price = part_data
                    
                    # Insert into service_parts
                    cursor.execute("""
                        INSERT INTO service_parts (
                            service_id, 
                            part_id, 
                            quantity,
                            unit_price
                        )
                        VALUES (%s, %s, %s, %s)
                    """, (
                        service_id,
                        part.get('part_id'),
                        part.get('quantity', 1),
                        part_price
                    ))
                    
                    # Update part inventory only if service is completed immediately
                    if data.get('status') == 'Completed':
                        # Check if we have enough stock
                        quantity = part.get('quantity', 1)
                        
                        if current_stock < quantity:
                            conn.rollback()
                            cursor.close()
                            conn.close()
                            return jsonify({
                                "success": False, 
                                "error": f"Not enough stock for part {part_id}. Available: {current_stock}, Required: {quantity}"
                            }), 400
                        
                        # Update stock
                        cursor.execute("""
                            UPDATE parts 
                            SET stock = stock - %s,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE part_id = %s
                        """, (
                            quantity,
                            part.get('part_id')
                        ))
                        
                        # Add inventory transaction record
                        cursor.execute("""
                            INSERT INTO inventory_transactions (
                                part_id,
                                quantity,
                                reference_type,
                                reference_id,
                                notes,
                                transaction_date
                            )
                            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                        """, (
                            part.get('part_id'),
                            -quantity,
                            'Service',
                            service_id,
                            f"Used in service #{service_id}"
                        ))
            
            # Update machine's last service date only if service is completed
            if data.get('status') == 'Completed':
                cursor.execute("""
                    UPDATE machines 
                    SET last_service_date = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE machine_id = %s
                """, (
                    data.get('service_date'),
                    data.get('machine_id')
                ))
            
            # Commit the transaction
            conn.commit()
            cursor.close()
            conn.close()
            
            return jsonify({
                "success": True,
                "message": "Service scheduled successfully",
                "service_id": service_id
            })
            
        except Exception as e:
            # Rollback transaction on error
            conn.rollback()
            cursor.close()
            conn.close()
            raise e
            
    except Exception as e:
        print(f"Error scheduling service: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Complete a service
@app.route('/api/services/<int:service_id>/complete', methods=['PUT'])
def complete_service(service_id):
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        # Start a transaction
        conn.autocommit = False
        cursor = conn.cursor()
        
        try:
            # First check if service exists and its current status
            cursor.execute("SELECT service_id, machine_id, status FROM services WHERE service_id = %s", (service_id,))
            service = cursor.fetchone()
            if not service:
                conn.rollback()
                cursor.close()
                conn.close()
                return jsonify({"success": False, "error": "Service not found"}), 404
            
            # Check if service is already completed - prevent duplicate completion
            service_id, machine_id, current_status = service
            if current_status == 'Completed':
                conn.rollback()
                cursor.close()
                conn.close()
                return jsonify({"success": False, "error": "Service is already completed"}), 400
            
            # Update service status
            cursor.execute("""
                UPDATE services 
                SET 
                    status = 'Completed',
                    completion_date = CURRENT_TIMESTAMP,
                    completion_notes = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE service_id = %s
            """, (
                data.get('completion_notes', ''),
                service_id
            ))
            
            # Get service parts
            cursor.execute("""
                SELECT sp.part_id, sp.quantity, p.stock
                FROM service_parts sp
                JOIN parts p ON sp.part_id = p.part_id
                WHERE sp.service_id = %s
            """, (service_id,))
            
            parts = cursor.fetchall()
            
            # Update inventory for each part used
            for part in parts:
                part_id, quantity, current_stock = part
                
                # Check if we have enough stock
                if current_stock < quantity:
                    conn.rollback()
                    cursor.close()
                    conn.close()
                    return jsonify({
                        "success": False, 
                        "error": f"Not enough stock for part {part_id}. Available: {current_stock}, Required: {quantity}"
                    }), 400
                
                # Update part stock
                cursor.execute("""
                    UPDATE parts 
                    SET stock = stock - %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE part_id = %s
                """, (quantity, part_id))
                
                # Add inventory transaction record
                cursor.execute("""
                    INSERT INTO inventory_transactions (
                        part_id,
                        quantity,
                        reference_type,
                        reference_id,
                        notes,
                        transaction_date
                    )
                    VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                """, (
                    part_id,
                    -quantity,
                    'Service',
                    service_id,
                    f"Used in service #{service_id}"
                ))
            
            # Update machine's last service date
            cursor.execute("""
                UPDATE machines 
                SET 
                    last_service_date = CURRENT_DATE,
                    updated_at = CURRENT_TIMESTAMP
                WHERE machine_id = %s
            """, (machine_id,))
            
            # Commit the transaction
            conn.commit()
            cursor.close()
            conn.close()
            
            return jsonify({
                "success": True,
                "message": "Service completed successfully"
            })
            
        except Exception as e:
            # Rollback transaction on error
            conn.rollback()
            cursor.close()
            conn.close()
            raise e
            
    except Exception as e:
        print(f"Error completing service: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get all machines with client information for service scheduling
@app.route('/api/machines', methods=['GET'])
def get_machines():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get machines with client names
        cursor.execute("""
            SELECT 
                m.*,
                c.name as client_name,
                mm.name as model_name,
                mm.type,
                mm.cfm_capacity,
                (SELECT MAX(s.service_date) FROM services s WHERE s.machine_id = m.machine_id) as last_service
            FROM 
                machines m
            JOIN
                clients c ON m.client_id = c.client_id
            JOIN
                machine_models mm ON m.model_id = mm.model_id
            ORDER BY 
                c.name, m.machine_serial
        """)
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        machines_data = cursor.fetchall()
        
        # Convert to list of dictionaries
        machines = []
        for machine in machines_data:
            machine_dict = dict(zip(column_names, machine))
            # Convert datetime objects to strings
            for key, value in machine_dict.items():
                if isinstance(value, datetime):
                    machine_dict[key] = value.isoformat()
            machines.append(machine_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "machines": machines})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get all machines for a specific client
@app.route('/api/clients/<int:client_id>/machines', methods=['GET'])
def get_client_machines(client_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get client's machines
        cursor.execute("""
            SELECT 
                m.*,
                mm.name as model_name,
                mm.type,
                mm.cfm_capacity,
                (SELECT MAX(s.service_date) FROM services s WHERE s.machine_id = m.machine_id) as last_service
            FROM 
                machines m
            JOIN
                machine_models mm ON m.model_id = mm.model_id
            WHERE 
                m.client_id = %s
            ORDER BY 
                m.machine_serial
        """, (client_id,))
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        machines_data = cursor.fetchall()
        
        # Convert to list of dictionaries
        machines = []
        for machine in machines_data:
            machine_dict = dict(zip(column_names, machine))
            # Convert datetime objects to strings
            for key, value in machine_dict.items():
                if isinstance(value, datetime):
                    machine_dict[key] = value.isoformat()
            machines.append(machine_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "machines": machines})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Get all services for a specific client
@app.route('/api/clients/<int:client_id>/services', methods=['GET'])
def get_client_services(client_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First check if client exists
        cursor.execute("SELECT client_id FROM clients WHERE client_id = %s", (client_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Client not found"}), 404
        
        # Get services with related information for this client
        cursor.execute("""
            SELECT 
                s.*,
                m.machine_serial,
                mm.name as model_name,
                mm.type as machine_type,
                t.name as technician_name
            FROM 
                services s
            LEFT JOIN 
                machines m ON s.machine_id = m.machine_id
            LEFT JOIN 
                machine_models mm ON m.model_id = mm.model_id
            LEFT JOIN 
                technicians t ON s.technician_id = t.technician_id
            WHERE 
                m.client_id = %s
            ORDER BY 
                s.service_date DESC
        """, (client_id,))
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        services_data = cursor.fetchall()
        
        # Convert to list of dictionaries
        services = []
        for service in services_data:
            service_dict = dict(zip(column_names, service))
            # Convert datetime objects to strings
            for key, value in service_dict.items():
                if isinstance(value, datetime):
                    service_dict[key] = value.isoformat()
            
            # Get service parts
            cursor.execute("""
                SELECT 
                    sp.*,
                    p.name as part_name,
                    p.price as part_price
                FROM 
                    service_parts sp
                LEFT JOIN 
                    parts p ON sp.part_id = p.part_id
                WHERE 
                    sp.service_id = %s
            """, (service_dict['service_id'],))
            
            parts_columns = [desc[0] for desc in cursor.description]
            parts_data = cursor.fetchall()
            
            # Convert to list of dictionaries
            parts = []
            for part in parts_data:
                part_dict = dict(zip(parts_columns, part))
                parts.append(part_dict)
            
            service_dict['parts'] = parts
            services.append(service_dict)
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "services": services})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("\n🚀 Starting AFQSM API Server...")
    
    # Check database connection before starting server
    if not check_db_connection():
        print("❌ Failed to connect to the database. Please check your connection settings.")
        sys.exit(1)
    
    print(f"\n🌐 Server running at http://0.0.0.0:5017")
    print("⚡ API endpoints:")
    print("   - http://0.0.0.0:5017/api/test")
    print("   - http://0.0.0.0:5017/api/clients")
    print("   - http://0.0.0.0:5017/api/machine-models")
    print("   - http://0.0.0.0:5017/api/quotations")
    print("   - http://0.0.0.0:5017/api/part-categories")
    print("   - http://0.0.0.0:5017/api/parts")
    print("\n📝 Press CTRL+C to stop the server")
    
    app.run(debug=True, host='0.0.0.0', port=5017)