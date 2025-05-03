# AFQSM - AirFlow Quotation & Service Manager

A comprehensive web application designed for managing airflow equipment quotations and service scheduling. The application provides an efficient way for staff to create machine quotations based on CFM requirements and manage service schedules for installed equipment.

# Quick Start Guide: Running Locally

This step-by-step guide will help you set up and run the application on your local machine.

## System Requirements
- **PostgreSQL 12+** installed and running
- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **Git** for cloning the repository

## Step 1: Clone the Repository
```bash
git clone https://github.com/Splendor73/afqsm.git
cd afqsm
```

## Step 2: Set Up the Database
1. Navigate into the [database_setup](./database_setup/) directory:
```bash
cd database_setup
```

2. Start PostgreSQL and create a new database. Note down your PostgreSQL username and password.
```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE afqsm;

# Connect to the database
\c afqsm;
```

3. Run the SQL code from [setup.sql](./database_setup/setup.sql) to create the tables:
```bash
\i setup.sql;
```

4. Load the sample data for testing:
```bash
# Load clients data
\copy clients(name, contact_person, email, phone, address, industry, status, notes) FROM './dump/clients.csv' DELIMITER '|' CSV HEADER;

# Load machine models data
\copy machine_models(name, cfm_capacity, type, price, category, description) FROM './dump/machine_models.csv' DELIMITER '|' CSV HEADER;

# Load technicians data
\copy technicians(name, email, phone, specialization, status) FROM './dump/technicians.csv' DELIMITER '|' CSV HEADER;

# Load part categories data
\copy part_categories(name, description) FROM './dump/part_categories.csv' DELIMITER '|' CSV HEADER;

# Load parts inventory data
\copy parts(name, sku, category_id, price, stock, threshold, location, description, supplier, supplier_part_no) FROM './dump/parts.csv' DELIMITER '|' CSV HEADER;

# Load suppliers data
\copy suppliers(name, contact_person, email, phone, address, notes) FROM './dump/suppliers.csv' DELIMITER '|' CSV HEADER;

# Load machines data
\copy machines(machine_serial, model_id, client_id, install_date, last_service_date, next_service_date, status, notes) FROM './dump/machines.csv' DELIMITER '|' CSV HEADER;

# Load services data
\copy services(machine_id, service_type, service_date, completed_date, technician_id, status, notes) FROM './dump/services.csv' DELIMITER '|' CSV HEADER;

# Load service parts data
\copy service_parts(service_id, part_id, quantity, unit_price) FROM './dump/service_parts.csv' DELIMITER '|' CSV HEADER;

# Load quotations data
\copy quotations(client_id, date, cfm_requirement, total_amount, status, notes, valid_until, contact_info, client_name) FROM './dump/quotations.csv' DELIMITER '|' CSV HEADER;

# Load quotation items data
\copy quotation_items(quotation_id, model_id, quantity, unit_price, description) FROM './dump/quotation_items.csv' DELIMITER '|' CSV HEADER;

# Load part orders data
\copy part_orders(supplier_id, order_date, status, total_cost, po_number, notes) FROM './dump/part_orders.csv' DELIMITER '|' CSV HEADER;

# Load order items data
\copy order_items(order_id, part_id, quantity, unit_cost) FROM './dump/order_items.csv' DELIMITER '|' CSV HEADER;

# Load inventory transactions data
\copy inventory_transactions(part_id, quantity, reference_type, reference_id, notes) FROM './dump/inventory_transactions.csv' DELIMITER '|' CSV HEADER;
```

## Step 3: Configure the Backend
1. Navigate to the backend directory:
```bash
cd ../backend
```

2. Create and activate a Python virtual environment:
```bash
# On macOS/Linux
python -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

3. Install required Python packages:
```bash
pip install flask pg8000 flask-cors
```

4. Configure the database connection in app.py:
```python
DB_CONFIG = {
    'database': 'afqsm',          # Database name created in Step 2
    'user': 'YOUR_USERNAME',      # Your PostgreSQL username
    'password': 'YOUR_PASSWORD',  # Your PostgreSQL password
    'host': 'localhost',
    'port': 5432
}
```

## Step 4: Start the Backend Server
Run the Flask application:
```bash
python app.py
```

You should see output similar to:
```
🚀 Starting AFQSM API Server...
✅ Successfully connected to the afqsm database
🌐 Server running at http://0.0.0.0:5017
```

**Important**: Keep this terminal window open and running.

## Step 5: Set Up and Run the Frontend
1. Open a new terminal window/tab

2. Navigate to the project's frontend directory:
```bash
cd ../frontend
```

3. Install the required npm packages:
```bash
npm install
```

4. Start the Next.js development server:
```bash
npm run dev
```

You should see output similar to:
```
ready - started server on 0.0.0.0:3000
```

## Step 6: Access the Application
1. Open your web browser and go to: http://localhost:3000

2. You should see the AFQSM dashboard with an overview of quotations and services.

3. Navigate through the application to manage quotations, services, client information, and inventory.

## Features

- 📝 **Quotation Management**
  - Create detailed quotations based on client CFM requirements
  - Optimize machine selection with cost-efficient combinations
  - Preview total costs and machine specifications
  - Track and manage quotation status (Pending, Approved, Rejected)
  - Convert quotations to PDF for client sharing

- 🔧 **Service Management**
  - Schedule and track maintenance services
  - Manage parts inventory and requirements
  - Assign technicians to service tasks
  - Record completed services with parts usage
  - Service history tracking by client and machine

- 👥 **Client Management**
  - Track client information and contact details
  - View client equipment and service history
  - Monitor upcoming maintenance requirements
  - Client-specific dashboards with quotation and service history

- 📦 **Inventory Control**
  - Track parts inventory and stock levels
  - Manage part categories and suppliers
  - Automated low-stock alerts
  - Usage tracking through service records

- 📊 **Dashboard Analytics**
  - Real-time overview of business activities
  - Quotation and service metrics
  - Inventory status visualization
  - Upcoming service schedules

## Tech Stack

- **Frontend:**
  - Next.js 15
  - React
  - TailwindCSS for styling
  - React Icons for iconography
  - React Hook Form for form handling

- **Backend:**
  - Flask
  - PostgreSQL
  - pg8000 for database connectivity
  - Flask-CORS for cross-origin resource sharing

## Project Structure

```
afqsm/
├── backend/                # Flask backend
│   └── app.py              # Main server file with API endpoints
│
├── database_setup/         # Database setup files
│   ├── setup.sql           # SQL script to create tables
│   └── dump/               # Sample data for testing
│       ├── clients.csv     # Sample client data
│       └── machine_models.csv # Sample machine model data
│
└── frontend/               # Next.js frontend
    ├── public/             # Static files
    └── src/                # Source code
        ├── app/            # Next.js App Router pages
        │   ├── page.tsx    # Dashboard homepage
        │   ├── quotations/ # Quotation management
        │   ├── services/   # Service management
        │   ├── clients/    # Client management
        │   └── inventory/  # Inventory management
        └── components/     # Reusable UI components
```

## Troubleshooting Common Issues

- **Database Connection Errors**:
  - Verify PostgreSQL is running with `pg_isready` command
  - Check that your credentials in `app.py` are correct
  - Confirm the database exists with `psql -U postgres -l`

- **Backend Server Won't Start**:
  - Ensure port 5017 is not already in use
  - Check that all dependencies are installed
  - Verify Python version: `python --version`

- **Frontend Server Issues**:
  - Ensure port 3000 is not already in use
  - Check Node.js version: `node --version`
  - Check npm version: `npm --version`

- **API Connection Issues**:
  - Ensure both backend and frontend servers are running
  - Check for CORS issues in browser developer console
  - Verify API endpoint URLs match the backend server address

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact [support@example.com](mailto:support@example.com).
