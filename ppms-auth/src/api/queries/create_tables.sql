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
    user_id INT NULL,
    pump_id INT NULL,
    contact VARCHAR(50),
    -- employee_code VARCHAR(20) UNIQUE,
    login_time DATETIME NULL,
    experience_years DECIMAL(2,2) DEFAULT 0,
    commission_rate DECIMAL(2,2) DEFAULT 0,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (pump_id) REFERENCES pumps(pump_id) ON DELETE SET NULL ON UPDATE CASCADE
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



-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================
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

