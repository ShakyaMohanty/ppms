
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

        return fuelTypeString

        // console.log(fuelTypeString)
    }

}


export {selectTankFuelTypes}
