-- =====================================================
-- USEFUL VIEWS
-- =====================================================

-- Current fuel prices view
CREATE VIEW current_fuel_prices AS
SELECT 
    fuel_type,
    rate_per_liter,
    effective_from
FROM price_history 
WHERE status = 'Active' 
  AND effective_from <= NOW() 
  AND (effective_to IS NULL OR effective_to > NOW())
ORDER BY fuel_type;

-- Daily sales summary view
CREATE VIEW daily_sales_summary AS
SELECT 
    DATE(sale_datetime) as sale_date,
    fuel_type,
    SUM(quantity_dispensed) as total_quantity,
    SUM(total_amount) as total_revenue,
    COUNT(*) as total_transactions
FROM sales 
GROUP BY DATE(sale_datetime), fuel_type
ORDER BY sale_date DESC, fuel_type;

-- Current shift operator view
CREATE VIEW current_shift_operators AS
SELECT 
    osa.assignment_id,
    o.operator_id,
    o.name as operator_name,
    s.shift_id,
    s.shift_name,
    s.start_time,
    s.end_time,
    osa.status,
    osa.clock_in_time,
    osa.date
FROM operator_shift_assignments osa
JOIN operators o ON osa.operator_id = o.operator_id
JOIN shifts s ON osa.shift_id = s.shift_id
WHERE osa.date = CURDATE()
  AND osa.status IN ('Scheduled', 'Active')
  AND s.status = 'Active'
  AND o.status = 'Active';

-- Shift performance summary view
CREATE VIEW shift_performance_summary AS
SELECT 
    osa.date,
    s.shift_name,
    o.name as operator_name,
    COUNT(sa.sale_id) as total_transactions,
    COALESCE(SUM(sa.quantity_dispensed), 0) as total_quantity,
    COALESCE(SUM(sa.total_amount), 0) as total_revenue,
    osa.clock_in_time,
    osa.clock_out_time
FROM operator_shift_assignments osa
JOIN operators o ON osa.operator_id = o.operator_id
JOIN shifts s ON osa.shift_id = s.shift_id
LEFT JOIN sales sa ON sa.operator_id = o.operator_id 
    AND sa.shift_id = s.shift_id 
    AND sa.date = osa.date
WHERE osa.status = 'Completed'
GROUP BY osa.assignment_id, osa.date, s.shift_name, o.name
ORDER BY osa.date DESC, s.start_time;

-- Tank status view
CREATE VIEW tank_status AS
SELECT 
    t.tank_id,
    t.tank_no,
    t.fuel_type,
    t.capacity_liters,
    COALESCE(ds.closing_stock, 0) as current_stock,
    t.min_threshold,
    t.max_threshold,
    CASE 
        WHEN COALESCE(ds.closing_stock, 0) <= t.min_threshold THEN 'Low'
        WHEN COALESCE(ds.closing_stock, 0) >= t.max_threshold THEN 'High'
        ELSE 'Normal'
    END as stock_status,
    t.status as tank_status
FROM tanks t
LEFT JOIN daily_stock ds ON t.tank_id = ds.tank_id 
    AND ds.date = CURDATE()
WHERE t.status = 'Active';