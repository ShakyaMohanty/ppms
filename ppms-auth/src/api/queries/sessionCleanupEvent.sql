-- Create a MySQL Event (Automated):
-- Enable event scheduler (run once)
SET GLOBAL event_scheduler = ON;

-- Create auto cleanup event that runs every 5 minutes
CREATE EVENT cleanup_expired_sessions
ON SCHEDULE EVERY 5 MINUTE
DO
BEGIN
    UPDATE users 
    SET session_id = NULL, 
        session_expiry_time = NULL 
    WHERE session_expiry_time < NOW() 
      AND session_id IS NOT NULL;
END;

-- --Check if Event is Running:
-- sqlSHOW EVENTS;
-- SHOW VARIABLES LIKE 'event_scheduler';