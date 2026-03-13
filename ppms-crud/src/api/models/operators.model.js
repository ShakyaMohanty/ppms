import {pool} from '../config/db.js';

const selectOperatorStatus = async () => {
    const [rows] = await pool.execute(
        `SHOW COLUMNS FROM operators WHERE Field = 'status'`
    );

    if (rows.length === 0) {
        return [];
    }else{ 
        const statusEnumString = rows[0].Type
        const statusString = statusEnumString.substring(5, statusEnumString.length-1).replaceAll("'", "").split(',')
        console.log(statusString)
        return statusString  
    }
}


const createOperator = async (user_id, name, contact, login_time, status, experience_years, commission_rate) => {
    const [result] = await pool.execute(
        `INSERT INTO operators (user_id, name, contact, login_time, status, experience_years, commission_rate) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, name, contact, login_time, status, experience_years, commission_rate]
    );
    return result;
};

const updateOperator = async (pump_id, name, contact, login_time, status, id) => {
    const [result] = await pool.execute(
        `UPDATE operators SET pump_id = ?, name = ?, contact = ?, login_time = ?, status = ? WHERE operator_id = ?`, 
        [pump_id, name, contact, login_time, status, id]
    );
    return result;
};

const selectAllOperators = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM operators`
    );
    return rows;
};

const selectOneOperator = async (id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM operators WHERE operator_id = ?`,
        [id]
    );
    return rows[0];
};

const selectOneOperatorByOperatorName = async (name) => {

    const [rows] = await pool.execute(
        `SELECT * FROM operators WHERE name = ?`,
        [name]
    );
    return rows[0];
}

const deleteOperator = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM operators WHERE operator_id = ?`,
        [id]
    );
    return result;
};

const assignShiftAndPumpToOperator = async (operator_id,user_id, pump_id, shift_id, date) => {
    const [result] = await pool.execute(
        `UPDATE operators SET pump_id = ?, user_id = ?, shift_id = ?, assignment_date = ? WHERE operator_id = ?`,
        [pump_id, user_id, shift_id, date, operator_id]
    );
    return result;
    
};



export {
    selectOperatorStatus,
    createOperator,
    updateOperator,
    selectAllOperators,
    selectOneOperator,
    deleteOperator,
    selectOneOperatorByOperatorName,
    assignShiftAndPumpToOperator,
}