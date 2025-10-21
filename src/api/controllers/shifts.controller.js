import * as shiftModel from '../models/shifts.model.js'

// get all shifts
const getAllShifts = async (req, res) => {
    try {
        const shifts = await shiftModel.selectAllShift();
        if(!shifts || shifts.length === 0){
            return res.status(404).json({message: `No records found!`});
        }
        return res.status(200).json({message: `successfully getting all shifts`, data: shifts});
    } catch (error) {
        return res.status(500).json({message: `somthing went wrong while fetching shifts`, error: error})
    }
}

// add a shift record
const addShift = async (req, res) => {
    try {
        const {shiftName, startTime, endTime, status} = req.body;
        if(!shiftName || !startTime || !endTime || !status){
            return res.status(400).json({message: `required body data missing...`})
        }
        const result = await shiftModel.createShift(shiftName, startTime, endTime, status);
        if(!result || result.affectedRows === 0){
            return res.status(400).json({message: `failed to add shifts...`})
        }
        return res.status(200).json({message: `successfully added a shift...`})
    } catch (error) {
        return res.status(500).json({message: `something went wrong`})
    }
}

// fetch single shift with id parameter
const getSingleShift = async (req, res) => {
    const {id} = req.params;
    try {
        const shift = await shiftModel.selectOneShift(id);
        if(!shift || shift.length === 0){
            return res.status(404).json({message: `shift with id: ${id} not found!`});
        }
        return res.status(200).json({message: `successfully getting a shift`, data: shift});
    } catch (error) {
        return res.status(500).json({message: `somthing went wrong`, error: error})
    }
}

// update a single record of shift
const updateShift = async (req, res) => {
    const {shiftName, startTime, endTime, status} = req.body;
    const {id} = req.params;
    try {
         if(!shiftName || !startTime || !endTime || !status){
            return res.status(400).json({message: `required body data missing...`})
        }
        const result = await shiftModel.updateShift(shiftName, startTime, endTime, status, id);
        if(!result || result.affectedRows === 0){
            const shiftExists = await shiftModel.selectOneShift(id);
            if(!shiftExists || shiftExists.length === 0){
                return res.status(404).json({message: `shift with shift id : ${id} not found!`});
            }
            return res.status(400).json({message: `Failed to update shift with id: ${id}. No changes made...`})
        }
        return res.status(200).json({message: `successfully updated data`});
    } catch (error) {
        return res.status(500).json({message: `somthing went wrong while updating shift with id: ${id}`, error: error})
    }
}

// delete a single record of shift
const deleteShift = async (req, res) => {
    const {id} = req.params;
    try {
        const result = await shiftModel.deleteShift(id);
        if(!result || result.affectedRows === 0){
            return res.status(404).json({message: `No records found!`});
        }
        return res.status(200).json({message: `successfully deleted data`, });
    } catch (error) {
        return res.status(500).json({message: `somthing went wrong`, error: error})
    }
}

const changeShiftStatus = async (req, res) => {
    const {id} = req.params;
    const {status} = req.body
    if (!status) {
        return res.status(400).json({message: `missing 'status' in request body.`});
    }
    try {
        const shift = await shiftModel.selectOneShift(id);
        if(!shift || shift.length === 0){
            return res.status(404).json({message: `shift with id: ${id} not found!`});
        }
        if(shift.status === status){
            return res.status(400).json({message: `Shift status is already ${status}`});
        }
        const updatedShiftStatus = await shiftModel.updateShiftStatus(id, status);
        if(updatedShiftStatus.affectedRows === 0){
            return res.status(400).json({message: `failed to update status ${status} for shift with id: ${id}`});
        }
        return res.status(200).json({message: `successfully updated status of shift id: ${id}`})

    } catch (error) {
        return res.status(500).json({message: `something went wrong!`, error: error})
    }
}

export {getAllShifts, addShift, getSingleShift, updateShift, deleteShift, changeShiftStatus}