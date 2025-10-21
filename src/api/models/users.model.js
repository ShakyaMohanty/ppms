import { pool } from "../config/db.js";

// create a new user
const createUser = async (username, email, password) => {
    const [result] = await pool.execute(
        `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`, 
        [username, email, password]
    );
    // console.log("Insert result in model:", result); 
    return result;
}

const assignUserRole = async (role, userId) => {
    const [result] = await pool.execute(
        `UPDATE users SET name = ?, email = ? WHERE user_id = ?`, 
        [role, userId]
    );
}
// find user by their username
const findUserByUsername = async (username) => {
    const [rows] = await pool.execute(
        `SELECT * FROM users WHERE username = ?`, 
        [username]
    )
    return rows[0];
}

const findUserByEmail = async (email) => {
    const [rows] = await pool.execute(
        `SELECT * FROM users WHERE email = ?`, 
        [email]
    );
    return rows[0];
}
// find user by their id
const findUserById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM users WHERE user_id = ?`, 
        [id]
    );
    // console.log(rows)
    return rows[0];
}

// update signin sessions
const addSessionToUser = async (sessionId, sessionExpiryTime, userId) => {
    const [result] = await pool.execute(
        `UPDATE users SET session_id = ?, session_expiry_time = ? WHERE user_id = ?`, 
        [sessionId, sessionExpiryTime, userId]
    );
    // console.log(result)
    return result
}

// update session to NULL where session Expiry Time is less than current Time.
const removeSessionWithTimeExpiry = async () => {
    const [result] = await pool.execute(
        `UPDATE users SET session_id = NULL, session_expiry_time = NULL WHERE session_expiry_time < NOW() AND session_id IS NOT NULL`
    );
    return result
}

const findUserBySessionId = async (sessionId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM users WHERE session_id = ?`, 
        [sessionId]
    );
    return rows[0]
}

const removeSessionBySessionId = async (sessionId) => {
    const [result] = await pool.execute(
        `UPDATE users SET session_id = NULL, session_expiry_time = NULL WHERE session_id = ?`, 
        [sessionId]
    );
    return result
}

const addPasswordResetString = async (userId, hashedResetString, resetStringExpiryTime) => {
    const [result] = await pool.execute(
        `UPDATE users SET reset_password_token = ?, reset_password_token_expiry = ? WHERE user_id = ?`, 
        [hashedResetString, resetStringExpiryTime, userId]
    );
    console.log(result)
    return result;
}

const resetPasswordByEmail = async (hashedPassword, email) => {
    const [result] = await pool.execute(
        `UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_token_expiry = NULL WHERE email = ?`,
        [hashedPassword, email]
    );
    return result;
}

const removeResetTokenWithTimeExpiry = async () => {
    const [result] = await pool.execute(
        `UPDATE users SET reset_password_token = NULL, reset_password_token_expiry = NULL WHERE reset_password_token_expiry < NOW() AND reset_password_token IS NOT NULL`
    );
    return result
}

export {
    findUserByUsername, 
    findUserById, 
    findUserByEmail,
    createUser, 
    addSessionToUser, 
    removeSessionWithTimeExpiry, 
    findUserBySessionId, 
    removeSessionBySessionId,
    addPasswordResetString,
    resetPasswordByEmail,
    removeResetTokenWithTimeExpiry
}