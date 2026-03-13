import { pool } from "../config/db.js";

const createShift = async (shiftName, startTime, endTime, status) => {
    const [rows] = await pool.execute(
        `INSERT INTO shifts (shift_name, start_time, end_time, status) VALUES (?, ?, ?, ?)`,
        [shiftName, startTime, endTime, status]
    );
    return rows;
}

const selectAllShift = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM shifts`
    );
    return rows[0];
}
const selectOneShift = async (id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM shifts WHERE id = ?`,
        [id]
    );
    return rows[0];
}

const updateShift = async (shiftName, startTime, endTime, status, id) => {
    const [result] = await pool.execute(
        `UPDATE shifts SET shift_name = ?, start_time = ?, end_time = ?, status = ? WHERE shift_id = ?`,
        [shiftName, startTime, endTime, status, id]
    )
    return result;
}

const deleteShift = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM shifts WHERE shift_id = ?`,
        [id]
    )
    return result;
}

const updateShiftStatus = async (id, status) => {
    const [result] = await pool.execute(
        `UPDATE shifts SET status = ? WHERE shift_id = ?`,
        [status, id]
    )
    return result;
}

const selectShiftStatus = async () => {
    const [rows] = await pool.execute(
         `SHOW COLUMNS FROM shifts WHERE Field = 'status'`
    );
    if (rows.length === 0) {
        return [];
    }else{ 
        const statusEnumString = rows[0].Type
        const statusString = statusEnumString.substring(5, statusEnumString.length-1).replaceAll("'", "").split(',')
        return statusString  
    }
}   

const selectOneByShiftName = async (shift_name) => {
    const [rows] = await pool.execute(
        `SELECT * FROM shifts WHERE shift_name = ?`,
        [shift_name]
    );
    return rows[0];
}

export {
    createShift,
    selectAllShift,
    selectOneShift,
    updateShift,
    deleteShift,
    updateShiftStatus,
    selectOneByShiftName,
    selectShiftStatus
}