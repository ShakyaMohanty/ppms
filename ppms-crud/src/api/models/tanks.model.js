
import { pool } from "../config/db.js";
  
const selectTankFuelTypes = async () => {
    const [rows] = await pool.execute(
        `SHOW COLUMNS FROM tanks WHERE Field = 'fuel_type'`
    );

    if (rows.length === 0) {
        return [];
    }else{
        
        const fuelTypeEnumString = rows[0].Type
        const fuelTypeString = fuelTypeEnumString.substring(5, fuelTypeEnumString.length-1) .replaceAll("'", "").split(',')
        console.log(fuelTypeString)
        return fuelTypeString

        
    }

}

const createTank = async (tank_no, fuel_type, capacity_liters, location, min_threshold, max_threshold, status, installation_date, last_calibration_date) => {
    const [result] = await pool.execute(
        `INSERT INTO tanks (tank_no, fuel_type, capacity_liters, location, min_threshold, max_threshold, status, installation_date, last_calibration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tank_no, fuel_type, capacity_liters, location, min_threshold, max_threshold, status, installation_date, last_calibration_date]
    );
    return result;
}

const selectOneByTankNo = async (tank_no) => {
    const [rows] = await pool.execute(
        `SELECT * FROM tanks WHERE tank_no = ?`,
        [tank_no]
    );
    return rows[0];
}

const updateTank = async (id, fuel_type, capacity_liters, location, min_threshold, max_threshold, status, installation_date, last_calibration_date) => {
    const [result] = await pool.execute(
        `UPDATE tanks SET fuel_type = ?, capacity_liters = ?, location = ?, min_threshold = ?, max_threshold = ?, status = ?, installation_date = ?, last_calibration_date = ? WHERE tank_id = ?`,  
        [fuel_type, capacity_liters, location, min_threshold, max_threshold, status, installation_date, last_calibration_date, id]
    );
    return result;
}

const selectAllTanks = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM tanks`
    );
    return rows;
}

const selectOneTank = async (id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM tanks WHERE tank_id = ?`,
        [id]
    );
    return rows[0];
}

const deleteTank = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM tanks WHERE tank_id = ?`, 
        [id]
    );
    return result;
}

const selectTanksByFuelType = async (fuel_type) => {
    const [rows] = await pool.execute(
        `SELECT * FROM tanks WHERE fuel_type = ?`,
        [fuel_type]
    );
    return rows;
}

// const selectTankByMinCapacity = async (min_capacity) => {
//     const [rows] = await pool.execute(
//         `SELECT * FROM tanks WHERE capacity_liters >= ?`,
//         [min_capacity]
//     );
//     return rows;
// }

export {
    selectTankFuelTypes, 
    createTank, 
    selectOneByTankNo, 
    updateTank, 
    selectAllTanks, 
    selectOneTank, 
    deleteTank, 
    selectTanksByFuelType, 
    // selectTankByMinCapacity
}