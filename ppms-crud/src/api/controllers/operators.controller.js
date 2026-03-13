import * as userModel from '../models/users.model.js';
import * as operatorModel from '../models/operators.model.js';
import * as shiftModel from '../models/shifts.model.js';
import * as pumpModel from '../models/pumps.model.js';
import {validate_2_2_decimal, validateDate} from '../validations/operators.validation.js';
const addOperator = async (req, res) => {
    try {
        const { name, contact, login_time, experience_years, commission_rate, status } = req.body;

        if(!name || !contact || !status || !experience_years || !commission_rate) {
            return res.status(400).json({message: `name, contact, status, experience_years, and commission_rate are required!`})
        }

        // !/^\d{10}$/.test(contact)
        if(contact.length !== 10 || isNaN(contact)) {
            return res.status(400).json({message: `contact must have 10 digits`})
        }

        
        if(validate_2_2_decimal(experience_years).listofErrors.length > 0){
            return res.status(400).json({experienceYearsValidationErrors: validate_2_2_decimal(experience_years).listofErrors[0]});
        }
        const real_experience_years = Number(experience_years);

        if(validate_2_2_decimal(commission_rate).listofErrors.length > 0){
            return res.status(400).json({commissionRateValidationErrors: validate_2_2_decimal(commission_rate).listofErrors[0]});
        }
        const real_commission_rate = Number(commission_rate);

        const valid_status = await operatorModel.selectOperatorStatus();
        if (!valid_status.includes(status)) {
            return res.status(400).json({message: `Invalid status. Must be 'Active' or 'Inactive'.`});
        }

        const existingUser = await operatorModel.selectOneOperatorByOperatorName(name);
        if (existingUser) {
            return res.status(404).json({message: `Operator name '${name}' already exists.`});
        }
        // my operator name must have OP-XXXX format
        const isNameValidRegEx = /^OP-\d{4}$/;
        if (!isNameValidRegEx.test(name)) {
            return res.status(400).json({message: `Invalid operator name format. It must start with 'OP-' followed by 4 digits (e.g., OP-0001, OP-1234).`});
        }
        //add column name in operators table give me query
        // ALTER TABLE operators ADD COLUMN name VARCHAR(255) AFTER user_id;
        const createdOperator = await operatorModel.createOperator( 
            name,
            contact, 
            login_time, 
            status, 
            real_experience_years, 
            real_commission_rate
        );

        if (createdOperator.affectedRows === 0) {
            return res.status(500).json({message: `Failed to create operator.`});
        } else {
            return res.status(201).json({message: `Operator with username '${username}' created successfully.`});
        }


    } catch (error) {
        res.status(500).json({message: `Something went wrong while adding an operator.`, error});
    }
}

const assignOperator = async (req, res) => {

    try {
        const { username, operator, date, shift_name, pump_no } = req.body;

        const selected_operator = await operatorModel.selectOneOperatorByOperatorName(operator);
        if(!selected_operator) {
            return res.status(404).json({message: `Operator name '${operator}' not found.`});
        }

        const selected_pump = await pumpModel.selectOneByPumpNo(pump_no);
        if(!selected_pump) {
            return res.status(404).json({message: `Pump with pump number '${pump_no}' not found.`});
        }
        
        const dateValidation = await validateDate(date);
        if(dateValidation.listofErrors.length > 0){
            return res.status(400).json({dateValidationErrors: dateValidation.listofErrors[0]});
        }else{
            date = dateValidation;
            console.log("validated date", date);
        }
        const shift = await shiftModel.selectOneByShiftName(shift_name);
        if(!shift) {
            return res.status(404).json({message: `Shift with name '${shift_name}' not found.`});
        }

        // const assignmentResult = await operatorModel.assignShiftAndPumpToOperator(
        //     selected_operator.operator_id,
        //     selected_pump.pump_id,
        //     shift.shift_id,
        //     date
        // );

        // if(assignmentResult.affectedRows === 0) {
        //     return res.status(500).json({message: `Failed to assign shift and pump to operator.`});
        // }
        return res.status(200).json({message: `Successfully assigned shift and pump to operator.`});


        // const shifts = await operatorModel.selectShiftsTypes();
        // if(shift_start)

        // const testStartTime = await validateTime("2:30   PM");
        // console.log("testStartTime", testStartTime);
         
    } catch (error) {
        return res.status(500).json({message: `Something went wrong while assigning shift and pump to operator.`, error});
    }
}

const editOperator = async (req, res) => {

}

const getAllOperators = async (req, res) => {

}

const getSingleOperator = async (req, res) => {

}

const deleteOperator = async (req, res) => {

}

const assignUserToOperator = async (req, res) => {
    try {
        const { username } = req.body;
        const user = await userModel.selectOneByUsername(username);
        if(!user) {
            return res.status(404).json({message: `User with username '${username}' not found.`});
        }
         const user_id = user.user_id;
        // check if user is already assigned as operator
        const existingOperator = await operatorModel.selectOneOperatorByOperatorName(username);
        if(existingOperator) {
            return res.status(409).json({message: `User '${username}' is already assigned as an operator.`});
        }

        const assignmentResult = await operatorModel.updateUserInOperator(
            user_id,
            existingOperator.operator_id
        );

        if(assignmentResult.affectedRows === 0) {
            return res.status(500).json({message: `Failed to assign user to operator.`});
        }
        return res.status(200).json({message: `Successfully assigned user to operator.`});

    } catch (error) {
        return res.status(500).json({message: `Something went wrong while assigning user to operator.`, error: error});
    }
}

export { addOperator, editOperator, getAllOperators, getSingleOperator, deleteOperator, assignOperator, assignUserToOperator };