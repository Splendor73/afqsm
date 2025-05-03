BEGIN;

-- Drop all tables if they exist
DROP TABLE IF EXISTS
    inventory_transactions,
    order_items,
    part_orders,
    suppliers,
    quotation_items,
    quotations,
    service_parts,
    services,
    parts,
    part_categories,
    technicians,
    machines,
    machine_models,
    clients
CASCADE;

-- Client information
CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    industry VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Machine catalog/models
CREATE TABLE machine_models (
    model_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cfm_capacity INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'Fixed Bit' or 'VFD'
    price NUMERIC(10,2) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Individual machines owned by clients
CREATE TABLE machines (
    machine_id SERIAL PRIMARY KEY,
    machine_serial VARCHAR(50) NOT NULL UNIQUE,
    model_id INTEGER REFERENCES machine_models(model_id),
    client_id INTEGER REFERENCES clients(client_id),
    install_date DATE,
    last_service_date DATE,
    next_service_date DATE,
    status VARCHAR(20) DEFAULT 'Operational',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Service personnel
CREATE TABLE technicians (
    technician_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    specialization VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Inventory categories
CREATE TABLE part_categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory items
CREATE TABLE parts (
    part_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    category_id INTEGER REFERENCES part_categories(category_id),
    price NUMERIC(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    threshold INTEGER DEFAULT 5,
    location VARCHAR(50),
    description TEXT,
    supplier VARCHAR(100),
    supplier_part_no VARCHAR(50),
    last_order_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Maintenance services
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    machine_id INTEGER REFERENCES machines(machine_id),
    service_type VARCHAR(30) NOT NULL, -- 'Small Service' or 'Big Service'
    service_date DATE NOT NULL,
    completion_date DATE,
    technician_id INTEGER REFERENCES technicians(technician_id),
    status VARCHAR(20) DEFAULT 'Scheduled',
    notes TEXT,
    completion_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Parts used during services
CREATE TABLE service_parts (
    service_part_id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(service_id) ON DELETE CASCADE,
    part_id INTEGER REFERENCES parts(part_id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client quotations
CREATE TABLE quotations (
    quotation_id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(client_id),
    date DATE NOT NULL,
    cfm_requirement INTEGER,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    notes TEXT,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    contact_info VARCHAR(100), -- For new potential clients without existing records
    client_name VARCHAR(100)   -- For new potential clients without existing records
);

-- Items in quotations
CREATE TABLE quotation_items (
    item_id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES quotations(quotation_id) ON DELETE CASCADE,
    model_id INTEGER REFERENCES machine_models(model_id),
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Part suppliers
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Purchase orders for parts
CREATE TABLE part_orders (
    order_id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(supplier_id),
    order_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    total_cost NUMERIC(10,2),
    po_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Items in purchase orders
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES part_orders(order_id) ON DELETE CASCADE,
    part_id INTEGER REFERENCES parts(part_id),
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simple inventory changes tracking (without user references)
CREATE TABLE inventory_transactions (
    transaction_id SERIAL PRIMARY KEY,
    part_id INTEGER REFERENCES parts(part_id),
    quantity INTEGER NOT NULL, -- Positive for additions, negative for removals
    reference_type VARCHAR(30), -- 'Order', 'Service', 'Adjustment'
    reference_id INTEGER,      -- ID of related record
    notes TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT; 