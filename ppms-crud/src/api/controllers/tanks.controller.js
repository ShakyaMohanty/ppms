import { ValidationError } from 'sequelize';
import * as tankModel from '../models/tanks.model.js';
import {validateCapacity, validateMaxThreshold, validateMinThreshold, validateThreshold} from '../validations/tanks.validation.js'

const addTank = async (req, res) => {

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

        
        // Basic validation for required fields
        if (!tank_no || !fuel_type || !capacity_liters || !max_threshold || !min_threshold || !status) {
            return res.status(400).json({message: `Tank number, fuel type, capacity, max threshold, min threshold, and status are required.`});
        }
        // if(!tank_no.startsWith('T') || tank_no.length > 3){
        //     return res.status(400).json({message: `Tank number must start with 'T' and should be of length less than 3`});
        // }
        // if(!/^\d+$/.test(tank_no.slice(1))){
        //     return res.status(400).json({message: `after first element, other element should be digit`})
        // }

        const tankNoRegex = /^T\d{1,2}$/;
        if (!tankNoRegex.test(tank_no)) {
            return res.status(400).json({message: `Invalid tank number format. It must start with 'T' followed by 1 or 2 digits (e.g., T1, T99).`});
        }
        
        // Validate fuel_type against ENUM values : Fetch valid fuel types from the model
        const validFuelTypes = await tankModel.selectTankFuelTypes();
        if (!validFuelTypes.includes(fuel_type)) {
            return res.status(400).json({message: `Invalid fuel type. Must be 'Petrol', 'Diesel', or 'CNG'.`});
        }

        // Check if a tank with the same tank_no already exists : This is important because `tank_no` is a UNIQUE field
        const existingTank = await tankModel.selectOneByTankNo(tank_no); // Add a new model method for this
        if (existingTank) {
            return res.status(409).json({message: `Tank with tank number '${tank_no}' already exists.`});
        }

        const validateCapacityLiters = await validateCapacity(capacity_liters);
        if(validateCapacityLiters.listofErrors.length > 0){
           return res.status(400).json({decimalValidationErrors: validateCapacityLiters.listofErrors[0]});
        }
        

        const validateMinThresholdLiters = await validateThreshold(min_threshold);
        if(validateMinThresholdLiters.listofErrors.length > 0){
            return res.status(400).json({field: min_threshold, minThresholdValidationErrors: validateMinThresholdLiters.listofErrors[0]});
        }

        const validateMaxThresholdLiters = await validateThreshold(max_threshold);
        if(validateMaxThresholdLiters.listofErrors.length > 0){
            return res.status(400).json({field: max_threshold, maxThresholdValidationErrors: validateMaxThresholdLiters.listofErrors[0]});
        }

        const real_capacity_liters =  Number(capacity_liters);
        const real_min_threshold = Number(min_threshold);
        const real_max_threshold = Number(max_threshold);


        // Call the model function to create the tank
        const result = await tankModel.createTank(
            tank_no,
            fuel_type,
            real_capacity_liters,
            location,
            real_min_threshold,
            real_max_threshold,
            status,
            installation_date,
            last_calibration_date
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({message: `Failed to add tank.`});
        }

        res.status(201).json({
            message: "Tank successfully added.",
            // newTankId: result.insertId,
        });

    } catch (error) {
        res.status(500).json({message: `Something went wrong while adding a tank.`, error});
    }
};

const editTank = async (req, res) => {
    try {
        const {
            fuel_type,
            capacity_liters,
            location,
            min_threshold,
            max_threshold,
            status,
            installation_date,
            last_calibration_date
        } = req.body;

        if (!fuel_type || !capacity_liters || !max_threshold || !min_threshold || !status || !location) {
            return res.status(400).json({message: `Fuel type, capacity, max threshold, min threshold, status, and location are required.`});
        }

        const validFuelTypes = await tankModel.selectTankFuelTypes();
        if (!validFuelTypes.includes(fuel_type)) {
            return res.status(400).json({message: `Invalid fuel type. Must be 'Petrol', 'Diesel', or 'CNG'.`});
        }

        const validateCapacityLiters = await validateCapacity(capacity_liters);
        if(validateCapacityLiters.listofErrors.length > 0){
           return res.status(400).json({decimalValidationErrors: validateCapacityLiters.listofErrors[0]});
        }
        
        const validateMinThresholdLiters = await validateThreshold(min_threshold);
        if(validateMinThresholdLiters.listofErrors.length > 0){
            return res.status(400).json({field: min_threshold, minThresholdValidationErrors: validateMinThresholdLiters.listofErrors[0]});
        }

        const validateMaxThresholdLiters = await validateThreshold(max_threshold);
        if(validateMaxThresholdLiters.listofErrors.length > 0){
            return res.status(400).json({field: max_threshold, maxThresholdValidationErrors: validateMaxThresholdLiters.listofErrors[0]});
        }

        const real_capacity_liters =  Number(req.body.capacity_liters);
        const real_min_threshold = Number(req.body.min_threshold);
        const real_max_threshold = Number(req.body.max_threshold);

        const {id} = req.params;

        const result = await tankModel.updateTank(
            id,
            fuel_type,
            real_capacity_liters,
            location,
            real_min_threshold,
            real_max_threshold,
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
};

const getAllTanks = async (req, res) => {
    try {
        const tanks = await tankModel.selectAllTanks();
        if(!tanks || tanks.length === 0){
            return res.status(404).json({message: `No records found!`});
        }
        return res.status(200).json({message: `successfully getting all tanks`, data: tanks});
    } catch (error) {
        return res.status(500).json({message: `somthing went wrong while fetching tanks`, error: error})
    }
};

const getSingleTank = async (req, res) => {
    try {
        const {id} = req.params;
        const tank = await tankModel.selectOneTank(id);
        if(!tank){
            return res.status(404).json({message: `tank with id: ${id} not found!`});
        }
        return res.status(200).json({message: `successfully getting tank with id: ${id}`, data: tank});
    } catch (error) {
        return res.status(500).json({message: `something went wrong while fetching tank with id: ${id}`, error: error});
    }
};

const getTankFuelTypes = async (req, res) => {
    try {
        const result = await tankModel.selectTankFuelTypes();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message: `Something went wrong while fetching tank fuel types.`, error});
    }
};

const getAllTanksByFuelType = async (req, res) => {
    try {
        const { fuel_type } = req.params;
        console.log(fuel_type);
        const tanks = await tankModel.selectTanksByFuelType(fuel_type);
        if(!tanks || tanks.length === 0){
            return res.status(404).json({message: `No tanks found with fuel type: ${fuel_type}`});
        }
        return res.status(200).json({message: `Successfully getting tanks with fuel type: ${fuel_type}`, data: tanks});
    } catch (error) {
        return res.status(500).json({message: `Something went wrong while fetching tanks with fuel type: ${fuel_type}`, error});
    }
};

const deleteTank = async (req, res) => {
    try {
        const {id} = req.params;
        const result = await tankModel.deleteTank(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({message: `Tank with id: ${id} not found.`});
        }
        res.status(200).json({message: `Tank successfully deleted.`});
    } catch (error) {
        res.status(500).json({message: `Something went wrong while deleting tank with id: ${id}.`, error});
    }
};

export { addTank, editTank, getTankFuelTypes, getAllTanks, getSingleTank, deleteTank, getAllTanksByFuelType };