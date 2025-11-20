-- =====================================================
-- PATROL PUMP MANAGEMENT SYSTEM - COMPLETE SCHEMA
-- =====================================================

-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin','Manager','Operator','Accountant') NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    session_id VARCHAR(255) NULL,
    session_expiry_time DATETIME NULL,
    reset_password_token VARCHAR(255) NULL,
    reset_password_token_expiry DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    
    -- Constraints
    CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (phone REGEXP '^[0-9+\-\s()]{10,15}$'),
    
    -- Both session fields must be set together or both NULL
    CONSTRAINT chk_session_expiry CHECK (
        (session_id IS NULL AND session_expiry_time IS NULL) OR
        (session_id IS NOT NULL AND session_expiry_time IS NOT NULL)
    ),
    --Both reset fields must be set together or both NULL
    CONSTRAINT chk_reset_token_expiry CHECK (   
        (reset_password_token IS NULL AND reset_password_token_expiry IS NULL) OR
        (reset_password_token IS NOT NULL AND reset_password_token_expiry IS NOT NULL)
    )
);

-- 2. SHIFTS TABLE
-- =====================================================
CREATE TABLE shifts (
    shift_id INT PRIMARY KEY AUTO_INCREMENT,
    shift_name VARCHAR(20) NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_shift_times CHECK (start_time != end_time)
);

-- 3. TANKS TABLE
-- =====================================================
CREATE TABLE tanks (
    tank_id INT PRIMARY KEY AUTO_INCREMENT,
    tank_no VARCHAR(20) UNIQUE NOT NULL,
    fuel_type ENUM('Petrol','Diesel','CNG') NOT NULL,
    capacity_liters DECIMAL(10,2) NOT NULL,
    location VARCHAR(100),
    min_threshold DECIMAL(8,2),
    max_threshold DECIMAL(8,2),
    status ENUM('Active','Maintenance','Inactive') DEFAULT 'Active',
    installation_date DATE,
    last_calibration_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_capacity CHECK (capacity_liters > 0),
    CONSTRAINT chk_thresholds CHECK (
        min_threshold IS NULL OR max_threshold IS NULL OR min_threshold < max_threshold
    ),
    CONSTRAINT chk_min_threshold CHECK (min_threshold IS NULL OR min_threshold >= 0),
    CONSTRAINT chk_max_threshold CHECK (
        max_threshold IS NULL OR max_threshold <= capacity_liters
    )
);

-- 4. PUMPS TABLE
-- =====================================================
CREATE TABLE pumps (
    pump_id INT PRIMARY KEY AUTO_INCREMENT,
    pump_no VARCHAR(20) UNIQUE NOT NULL,
    tank_id INT NOT NULL,
    nozzle_count INT NOT NULL,
    status ENUM('Active','Maintenance','Inactive') DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (tank_id) REFERENCES tanks(tank_id) ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT chk_nozzle_count CHECK (nozzle_count > 0 AND nozzle_count <= 10)
);

-- 5. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    vehicle_number VARCHAR(20),
    type ENUM('Retail','Account','Fleet','Corporate') DEFAULT 'Retail',
    credit_limit DECIMAL(10,2) DEFAULT 0,
    outstanding_balance DECIMAL(10,2) DEFAULT 0,
    status ENUM('Active','Inactive','Blocked') DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_credit_limit CHECK (credit_limit >= 0),
    CONSTRAINT chk_outstanding_balance CHECK (outstanding_balance >= 0)
);

-- 6. OPERATORS TABLE (SHIFT-AGNOSTIC)
-- =====================================================
CREATE TABLE operators (
    operator_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    employee_code VARCHAR(20) UNIQUE,
    login_time DATETIME NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 7. OPERATOR SHIFT ASSIGNMENTS TABLE (DYNAMIC SCHEDULING)
-- =====================================================
CREATE TABLE operator_shift_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    operator_id INT NOT NULL,
    shift_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('Scheduled','Active','Completed','Cancelled','No-Show') DEFAULT 'Scheduled',
    clock_in_time DATETIME NULL,
    clock_out_time DATETIME NULL,
    opening_cash DECIMAL(10,2) NULL,
    closing_cash DECIMAL(10,2) NULL,
    handover_notes TEXT NULL,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE RESTRICT,
    FOREIGN KEY (shift_id) REFERENCES shifts(shift_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    
    -- Business Rules
    UNIQUE KEY unique_operator_date_shift (operator_id, date, shift_id),
    
    -- Constraints
    CONSTRAINT chk_cash_amounts CHECK (
        (opening_cash IS NULL OR opening_cash >= 0) AND 
        (closing_cash IS NULL OR closing_cash >= 0)
    ),
    CONSTRAINT chk_clock_times CHECK (
        clock_out_time IS NULL OR clock_in_time IS NULL OR clock_out_time > clock_in_time
    )
);

-- 8. DELIVERY TABLE
-- =====================================================
CREATE TABLE delivery (
    delivery_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    fuel_type ENUM('Petrol','Diesel','CNG') NOT NULL,
    tank_id INT NOT NULL,
    supplier_name VARCHAR(100),
    driver_name VARCHAR(100),
    vehicle_number VARCHAR(20),
    invoiced_quantity DECIMAL(10,3) NOT NULL,
    measured_quantity DECIMAL(10,3) NOT NULL,
    discrepancy DECIMAL(10,3) AS (invoiced_quantity - measured_quantity) STORED,
    status ENUM('Verified','Short','Disputed','Pending') DEFAULT 'Pending',
    rate_per_liter DECIMAL(8,3) NOT NULL,
    total_amount DECIMAL(12,2) AS (invoiced_quantity * rate_per_liter) STORED,
    invoice_file_url VARCHAR(255),
    delivery_datetime DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (tank_id) REFERENCES tanks(tank_id) ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT chk_invoiced_qty CHECK (invoiced_quantity > 0),
    CONSTRAINT chk_measured_qty CHECK (measured_quantity >= 0),
    CONSTRAINT chk_delivery_rate CHECK (rate_per_liter > 0)
);

-- 9. DAILY_STOCK TABLE
-- =====================================================
CREATE TABLE daily_stock (
    stock_id INT PRIMARY KEY AUTO_INCREMENT,
    tank_id INT NOT NULL,
    date DATE NOT NULL,
    fuel_type ENUM('Petrol','Diesel','CNG') NOT NULL,
    opening_stock DECIMAL(10,3) NOT NULL,
    delivery_invoice_no VARCHAR(50),
    measured_quantity DECIMAL(10,3) DEFAULT 0,
    dispensed_quantity DECIMAL(10,3) DEFAULT 0,
    closing_stock DECIMAL(10,3) NOT NULL,
    evaporation_loss DECIMAL(10,3) AS (opening_stock + measured_quantity - dispensed_quantity - closing_stock) STORED,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (tank_id) REFERENCES tanks(tank_id) ON DELETE RESTRICT,
    FOREIGN KEY (delivery_invoice_no) REFERENCES delivery(invoice_no) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_opening_stock CHECK (opening_stock >= 0),
    CONSTRAINT chk_closing_stock CHECK (closing_stock >= 0),
    CONSTRAINT chk_dispensed_qty CHECK (dispensed_quantity >= 0),
    CONSTRAINT chk_measured_qty_stock CHECK (measured_quantity >= 0),
    
    -- Unique constraint for one record per tank per day
    UNIQUE KEY unique_tank_date (tank_id, date)
);

-- 10. SALES TABLE
-- =====================================================
CREATE TABLE sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    pump_id INT NOT NULL,
    tank_id INT NOT NULL,
    operator_id INT NOT NULL,
    fuel_type ENUM('Petrol','Diesel','CNG') NOT NULL,
    date DATE NOT NULL,
    quantity_dispensed DECIMAL(8,3) NOT NULL,
    rate_per_liter DECIMAL(8,3) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_mode ENUM('Cash','Card','UPI','Credit') NOT NULL,
    customer_id INT,
    shift_id INT,
    transaction_ref VARCHAR(50),
    sale_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (pump_id) REFERENCES pumps(pump_id) ON DELETE RESTRICT,
    FOREIGN KEY (tank_id) REFERENCES tanks(tank_id) ON DELETE RESTRICT,
    FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
    FOREIGN KEY (shift_id) REFERENCES shifts(shift_id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_quantity CHECK (quantity_dispensed > 0),
    CONSTRAINT chk_rate CHECK (rate_per_liter > 0),
    CONSTRAINT chk_total_amount CHECK (total_amount > 0),
    CONSTRAINT chk_transaction_ref CHECK (
        (payment_mode IN ('Card','UPI') AND transaction_ref IS NOT NULL) OR 
        (payment_mode IN ('Cash','Credit'))
    )
);
-- Sales table indexes
CREATE INDEX idx_sales_date_pump ON sales(date, pump_id);
CREATE INDEX idx_sales_date_operator ON sales(date, operator_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_datetime ON sales(sale_datetime);

-- 11. RECONCILIATION TABLE
-- =====================================================
CREATE TABLE reconciliation (
    recon_id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    tank_id INT NOT NULL,
    invoice_no VARCHAR(50),
    opening_stock DECIMAL(10,3) NOT NULL,
    invoiced_quantity DECIMAL(10,3) DEFAULT 0,
    measured_quantity DECIMAL(10,3) DEFAULT 0,
    dispensed_quantity DECIMAL(10,3) DEFAULT 0,
    closing_stock DECIMAL(10,3) NOT NULL,
    delivery_shortage DECIMAL(10,3) AS (invoiced_quantity - measured_quantity) STORED,
    expected_closing_stock DECIMAL(10,3) AS (opening_stock + measured_quantity - dispensed_quantity) STORED,
    evaporation_loss DECIMAL(10,3) AS (expected_closing_stock - closing_stock) STORED,
    status ENUM('OK','Warning','Dispute','Pending') DEFAULT 'Pending',
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (tank_id) REFERENCES tanks(tank_id) ON DELETE RESTRICT,
    FOREIGN KEY (invoice_no) REFERENCES delivery(invoice_no) ON DELETE SET NULL,
    
    -- Unique constraint for one reconciliation per tank per day
    UNIQUE KEY unique_recon_tank_date (tank_id, date)
);

-- 12. PRICE_HISTORY TABLE (Additional - for rate management)
-- =====================================================
CREATE TABLE price_history (
    price_id INT PRIMARY KEY AUTO_INCREMENT,
    fuel_type ENUM('Petrol','Diesel','CNG') NOT NULL,
    rate_per_liter DECIMAL(8,3) NOT NULL,
    effective_from DATETIME NOT NULL,
    effective_to DATETIME,
    created_by INT NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT chk_price_rate CHECK (rate_per_liter > 0),
    CONSTRAINT chk_price_dates CHECK (effective_to IS NULL OR effective_from < effective_to)
);

-- 13. AUDIT_LOG TABLE (Additional - for system audit)
-- =====================================================
CREATE TABLE audit_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL,
    operation ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    record_id INT NOT NULL,
    old_values JSON,
    new_values JSON,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Index for performance
    INDEX idx_audit_table_date (table_name, timestamp),
    INDEX idx_audit_user_date (user_id, timestamp)
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================



-- Delivery table indexes  
CREATE INDEX idx_delivery_date_tank ON delivery(delivery_datetime, tank_id);
CREATE INDEX idx_delivery_supplier ON delivery(supplier_name);

-- Daily stock indexes
CREATE INDEX idx_daily_stock_date_tank ON daily_stock(date, tank_id);

-- Reconciliation indexes
CREATE INDEX idx_recon_date ON reconciliation(date);
CREATE INDEX idx_recon_status ON reconciliation(status);

-- Operator shift assignment indexes
CREATE INDEX idx_operator_assignments_date ON operator_shift_assignments(date, status);
CREATE INDEX idx_operator_assignments_operator ON operator_shift_assignments(operator_id, date);
CREATE INDEX idx_operator_assignments_shift ON operator_shift_assignments(shift_id, date);

-- Users table indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- =====================================================
-- INITIAL DATA INSERTS
-- =====================================================

-- Insert default shifts
INSERT INTO shifts (shift_name, start_time, end_time) VALUES
('Morning', '06:00:00', '14:00:00'),
('Evening', '14:00:00', '22:00:00'),
('Night', '22:00:00', '06:00:00');

-- Insert default admin user (password should be hashed in real implementation)
INSERT INTO users (username, password_hash, role, email, phone) VALUES
('admin', '$2y$10$example_hash_here', 'Admin', 'admin@petrolpump.com', '+91-9876543210');

