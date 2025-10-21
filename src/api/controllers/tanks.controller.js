import * as tankModel from '../models/tanks.model.js';
import {isDecimal10_2} from '../validations/dec10_2.validation.js'
const addTank = async (req, res) => {
    // const validateCapacityLiters = isDecimal10_2(10000000000.9);
    console.log(req.body);

    // try {
    //     const {
    //         tank_no,
    //         fuel_type,
    //         capacity_liters,
    //         location,
    //         min_threshold,
    //         max_threshold,
    //         status,
    //         installation_date,
    //         last_calibration_date
    //     } = req.body;
  
    //     const validateCapacityLiters = isDecimal10_2(10000000000.9);
    //     console.log(validateCapacityLiters);


    //     // Basic validation for required fields
    //     if (!tank_no || !fuel_type || !capacity_liters) {
    //         return res.status(400).json({message: `Tank number, fuel type, and capacity are required.`});
    //     }
    //     // if(!tank_no.startsWith('T') || tank_no.length > 3){
    //     //     return res.status(400).json({message: `Tank number must start with 'T' and should be of length less than 3`});
    //     // }
    //     // if(!/^\d+$/.test(tank_no.slice(1))){
    //     //     return res.status(400).json({message: `after first element, other element should be digit`})
    //     // }

    //     const tankNoRegex = /^T\d{1,2}$/;
    //     if (!tankNoRegex.test(tank_no)) {
    //         return res.status(400).json({message: `Invalid tank number format. It must start with 'T' followed by 1 or 2 digits (e.g., T1, T99).`});
    //     }

    //     // Validate fuel_type against ENUM values
    //     // const validFuelTypes = ['Petrol', 'Diesel', 'CNG'];
        
    //     // Fetch valid fuel types from the model
    //     const validFuelTypes = await tankModel.selectTankFuelTypes();
    //     if (!validFuelTypes.includes(fuel_type)) {
    //         return res.status(400).json({message: `Invalid fuel type. Must be 'Petrol', 'Diesel', or 'CNG'.`});
    //     }

    //     // Check if a tank with the same tank_no already exists
    //     // This is important because `tank_no` is a UNIQUE field
    //     const existingTank = await tankModel.selectOneByTankNo(tank_no); // Add a new model method for this
    //     if (existingTank) {
    //         return res.status(409).json({message: `Tank with tank number '${tank_no}' already exists.`});
    //     }

        
    //     // if(validateCapacityLiters){
    //     //     return res.status(400).json({message: validateCapacityLiters[0]})
    //     // }
    //     // // Call the model function to create the tank
    //     // const result = await tankModel.createTank(
    //     //     tank_no,
    //     //     fuel_type,
    //     //     capacity_liters,
    //     //     location,
    //     //     min_threshold,
    //     //     max_threshold,
    //     //     status,
    //     //     installation_date,
    //     //     last_calibration_date
    //     // );

    //     // if (result.affectedRows === 0) {
    //     //     return res.status(500).json({message: `Failed to add tank.`});
    //     // }

    //     res.status(201).json({
    //         message: "Tank successfully added.",
    //         // newTankId: result.insertId,
    //     });

    // } catch (error) {
    //     res.status(500).json({message: `Something went wrong while adding a tank.`, error});
    // }
};

const editTank = async (req, res) => {
    try {
        const {
            tank_no,
            fuel_type,
            capacity_liters,
            location,
            min_threshold,
            max_threshold,
            status,
            installation_date,
            last_calibration_date
        } = req.body;

        if(!tank_no || !fuel_type || !capacity_liters){
            return res.status(400).json({message: `Tank number, fuel type, and capacity are required.`});
        }

        const tankNoRegex = /^T\d{1,2}$/;
        if (!tankNoRegex.test(tank_no)) {
            return res.status(400).json({message: `Invalid tank number format. It must start with 'T' followed by 1 or 2 digits (e.g., T1, T99).`});
        }

        const validFuelTypes = await tankModel.getFuelTypeEnums();
        if (!validFuelTypes.includes(fuel_type)) {
            return res.status(400).json({message: `Invalid fuel type. Must be 'Petrol', 'Diesel', or 'CNG'.`});
        }

        const existingTank = await tankModel.selectOneByTankNo(tank_no);
        if (!existingTank) {
            return res.status(404).json({message: `Tank with tank number '${tank_no}' not found.`});
        }

        const result = await tankModel.updateTank(
            tank_no,
            fuel_type,
            capacity_liters,
            location,
            min_threshold,
            max_threshold,
            status,
            installation_date,
            last_calibration_date 
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({message: `Failed to update tank.`});
        }

        res.status(200).json({message: "Tank successfully updated."});
    } catch (error) {
        return res.status(500).json({message: `Something went wrong while updating a tank.`, error});
    }
}

const getTankFuelTypes = async (req, res) => {
    try {
        const result = await tankModel.selectTankFuelTypes();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message: `Something went wrong while fetching tank fuel types.`, error});
    }
}

export { addTank, editTank, getTankFuelTypes };
