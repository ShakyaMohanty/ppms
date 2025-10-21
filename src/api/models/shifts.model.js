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
        `UPDATE shifts SET shift_name = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?`,
        [shiftName, startTime, endTime, status, id]
    )
    return result;
}

const deleteShift = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM shifts WHERE id = ?`,
        [id]
    )
    return result;
}

const updateShiftStatus = async (id, status) => {
    const [result] = await pool.execute(
        `UPDATE shifts SET status = ? WHERE id = ?`,
        [id, status]
    )
    return result;
}
export {
    createShift,
    selectAllShift,
    selectOneShift,
    updateShift,
    deleteShift,
    updateShiftStatus
}