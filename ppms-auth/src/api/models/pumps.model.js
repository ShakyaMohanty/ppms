import {pool} from '../config/db.js';

const selectPumpStatus = async () => {
    const [rows] = await pool.execute(
        `SHOW COLUMNS FROM pumps WHERE Field = 'status'`
    );

    if (rows.length === 0) {
        return [];
    }else{ 
        const statusEnumString = rows[0].Type
        const statusString = statusEnumString.substring(5, statusEnumString.length-1) .replaceAll("'", "").split(',')
        console.log(statusString)
        return statusString  
    }
}

const selectOneByPumpNo = async (pump_no) => {
    const [rows] = await pool.execute(
        `SELECT * FROM pumps WHERE pump_no = ?`,
        [pump_no]
    );
    return rows[0];
};

const createPump = async (pump_no, tank_id, nozzle_count, status) => {
    const [result] = await pool.execute(
        `INSERT INTO pumps (pump_no, tank_id, nozzle_count, status) VALUES (?, ?, ?, ?)`,
        [pump_no, tank_id, nozzle_count, status]
    );
    return result;
};

const updatePump = async (pump_no, tank_id, nozzle_count, status, id) => {
    const [result] = await pool.execute(
        `UPDATE pumps SET pump_no = ?, tank_id = ?, nozzle_count = ?, status = ? WHERE pump_id = ?`, 
        [pump_no, tank_id, nozzle_count, status, id]
    );
    return result;
};

const selectAllPumps = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM pumps`
    );
    return rows;
};

const selectOnePump = async (id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM pumps WHERE pump_id = ?`,
        [id]
    );
    return rows[0];
};

const deletePump = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM pumps WHERE pump_id = ?`,
        [id]
    );
    return result;
};

export {
    selectPumpStatus,
    selectOneByPumpNo,
    createPump,
    updatePump,
    selectAllPumps,
    selectOnePump,
    deletePump
}