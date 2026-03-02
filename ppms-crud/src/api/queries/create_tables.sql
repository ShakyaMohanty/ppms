-- =====================================================
-- PATROL PUMP MANAGEMENT SYSTEM - COMPLETE SCHEMA
-- =====================================================

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
    measured_quantity DECIMAL(10,3) DEFAULT 0,
    dispensed_quantity DECIMAL(10,3) DEFAULT 0,
    closing_stock DECIMAL(10,3) NOT NULL,
    delivery_invoice_no VARCHAR(50) NULL,
    evaporation_loss DECIMAL(10,3) AS (opening_stock + measured_quantity - dispensed_quantity - closing_stock) STORED,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    -- FOREIGN KEY (tank_id) REFERENCES tanks(tank_id) ON DELETE RESTRICT,
    FOREIGN KEY (delivery_invoice_no) REFERENCES delivery(invoice_no) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_opening_stock CHECK (opening_stock >= 0),
    CONSTRAINT chk_closing_stock CHECK (closing_stock >= 0),
    CONSTRAINT chk_dispensed_qty CHECK (dispensed_quantity >= 0),
    CONSTRAINT chk_measured_qty_stock CHECK (measured_quantity >= 0)
    
    -- Unique constraint for one record per tank per day
    -- UNIQUE KEY unique_tank_date (tank_id, date)
);

-- 10. SALES TABLE
-- =====================================================
CREATE TABLE sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    sale_type ENUM('Retail', 'Wholesale') NOT NULL,
    pump_id INT NOT NULL,
    operator_id INT NOT NULL,
    fuel_type ENUM('Petrol','Diesel','CNG') NOT NULL,
    date DATE NOT NULL,
    quantity_dispensed DECIMAL(8,3) NOT NULL,
    rate_per_liter DECIMAL(8,3) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_mode ENUM('Cash','Card','UPI','Credit') NOT NULL,
    transaction_ref VARCHAR(50) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    -- FOREIGN KEY (pump_id) REFERENCES pumps(pump_id) ON DELETE RESTRICT,
    -- FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE RESTRICT,
    -- FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
    -- FOREIGN KEY (shift_id) REFERENCES shifts(shift_id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_quantity CHECK (quantity_dispensed > 0),
    CONSTRAINT chk_rate CHECK (rate_per_liter > 0),
    CONSTRAINT chk_total_amount CHECK (total_amount > 0)
    -- CONSTRAINT chk_transaction_ref CHECK (
    --    (payment_mode IN ('Card','UPI') AND transaction_ref IS NOT NULL) OR 
    --    (payment_mode IN ('Cash','Credit'))
    -- )
);
-- Sales table indexes
-- CREATE INDEX idx_sales_date_pump ON sales(date, pump_id);
-- CREATE INDEX idx_sales_date_operator ON sales(date, operator_id);
-- CREATE INDEX idx_sales_customer ON sales(customer_id);
-- CREATE INDEX idx_sales_datetime ON sales(sale_datetime);

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
    delivery_shortage DECIMAL(10,3),
    expected_closing_stock DECIMAL(10,3),
    evaporation_loss DECIMAL(10,3),
    -- delivery_shortage DECIMAL(10,3) AS (invoiced_quantity - measured_quantity) STORED,
    -- expected_closing_stock DECIMAL(10,3) AS (opening_stock + measured_quantity - dispensed_quantity) STORED,
    -- evaporation_loss DECIMAL(10,3) AS ((opening_stock + measured_quantity - dispensed_quantity) - closing_stock) STORED,
    status ENUM('OK','Warning','Dispute','Pending') DEFAULT 'Pending',
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    
    -- Foreign Keys
    -- FOREIGN KEY (tank_id) REFERENCES tanks(tank_id) ON DELETE RESTRICT,
    -- FOREIGN KEY (invoice_no) REFERENCES delivery(invoice_no) ON DELETE SET NULL,
    
    -- Unique constraint for one reconciliation per tank per day
    -- UNIQUE KEY unique_recon_tank_date (tank_id, date)
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
    -- FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    
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
    -- FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    
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
-- CREATE INDEX idx_operator_assignments_date ON operator_shift_assignments(date, status);
-- CREATE INDEX idx_operator_assignments_operator ON operator_shift_assignments(operator_id, date);
-- CREATE INDEX idx_operator_assignments_shift ON operator_shift_assignments(shift_id, date);

-- Users table indexes
-- CREATE INDEX idx_users_role ON users(role);
-- CREATE INDEX idx_users_status ON users(status);



