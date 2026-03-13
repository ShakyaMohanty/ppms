import * as pumpModel from '../models/pumps.model.js';
import * as tankModel from '../models/tanks.model.js';

const addPump = async (req, res) => {
    try {
        const {
            pump_no,
            tank_no,
            nozzle_count,
            status
        } = req.body;

        if (!pump_no || !tank_no || !nozzle_count || !status) {
            return res.status(400).json({message: `Pump number, tank ID, nozzle count, and status are required.`});
        }
    
        const pumpNoRegex = /^P-\d{1,2}$/;
        if (!pumpNoRegex.test(pump_no)) {
            return res.status(400).json({message: `Invalid pump number format. It must start with 'P-' followed by 1 or 2 digits (e.g., P-1, P-99).`});
        }

        const valid_nozzle_count = parseInt(nozzle_count, 10);

        if (isNaN(valid_nozzle_count) || valid_nozzle_count <= 0) {
            return res.status(400).json({message: `Nozzle count must be a positive integer.`});
        }

        if (valid_nozzle_count > 4) {
            return res.status(400).json({message: `Nozzle count cannot exceed 4.`});
        }
        
        const validStatus = await pumpModel.selectPumpStatus();
        if (!validStatus.includes(status)) {
            return res.status(400).json({message: `Invalid status. Must be 'Active' or 'Inactive'.`});
        }

        const existingPump = await pumpModel.selectOneByPumpNo(pump_no);
        if (existingPump) {
            return res.status(409).json({message: `Pump with pump number '${pump_no}' already exists.`});
        }

        const tank = await tankModel.selectOneByTankNo(tank_no);
        if (!tank) {
            return res.status(404).json({message: `Tank with tank number '${tank_no}' not found.`});
        }

        const result = await pumpModel.createPump(pump_no, tank.tank_id, valid_nozzle_count, status);
        if (result.affectedRows === 1) {
            return res.status(201).json({message: `Pump with pump number '${pump_no}' created successfully.`});
        } else {
            return res.status(500).json({message: `Failed to create pump.`});
        }


    } catch (error) {
        res.status(500).json({message: `Something went wrong while adding a pump.`, error});
    }
};

const editPump = async (req, res) => {

    try {
         const {
            pump_no,
            tank_no,
            nozzle_count,
            status
        } = req.body;


        if (!pump_no || !tank_no || !nozzle_count || !status) {
            return res.status(400).json({message: `Pump number, tank ID, nozzle count, and status are required.`});
        }

        const pumpNoRegex = /^P-\d{1,2}$/;
        if (!pumpNoRegex.test(pump_no)) {
            return res.status(400).json({message: `Invalid pump number format. It must start with 'P-' followed by 1 or 2 digits (e.g., P-1, P-99).`});
        }

        const valid_nozzle_count = parseInt(nozzle_count, 10);

        if (isNaN(valid_nozzle_count) || valid_nozzle_count <= 0) {
            return res.status(400).json({message: `Nozzle count must be a positive integer.`});
        }

        if (valid_nozzle_count > 4) {
            return res.status(400).json({message: `Nozzle count cannot exceed 4.`});
        }
        
        const validStatus = await pumpModel.selectPumpStatus();
        if (!validStatus.includes(status)) {
            return res.status(400).json({message: `Invalid status. Must be 'Active' or 'Inactive'.`});
        }

        const existingPump = await pumpModel.selectOneByPumpNo(pump_no);
        if (existingPump) {
            return res.status(409).json({message: `Pump with pump number '${pump_no}' already exists.`});
        }

        const tank = await tankModel.selectOneByTankNo(tank_no);
        if (!tank) {
            return res.status(404).json({message: `Tank with tank number '${tank_no}' not found.`});
        }

        const {id} = req.params;

        const result = await pumpModel.updatePump(pump_no, tank.tank_id, valid_nozzle_count, status, id);
        if (result.affectedRows === 1) {
            return res.status(200).json({message: `Pump with pump number '${pump_no}' updated successfully.`});
        } else {
            return res.status(500).json({message: `Failed to update pump.`});
        }
        
    } catch (error) {
        res.status(500).json({message: `Something went wrong while updating a pump.`, error});
    }

   

};

const getAllPumps = async (req, res) => {
    try {
        const pumps = await pumpModel.selectAllPumps();
        if(!pumps || pumps.length === 0){
            return res.status(404).json({message: `No records found!`});
        }
        return res.status(200).json({message: `successfully getting all pumps`, data: pumps});
    } catch (error) {
        return res.status(500).json({message: `somthing went wrong while fetching pumps`, error: error})
    }
};

const getSinglePump = async (req, res) => {
    try {
        const {id} = req.params;
        const pump = await pumpModel.selectOnePump(id);
        if(!pump){
            return res.status(404).json({message: `pump with id: ${id} not found!`});
        }
        return res.status(200).json({message: `successfully getting pump with id: ${id}`, data: pump});
    } catch (error) {
        return res.status(500).json({message: `something went wrong while fetching pump with id: ${id}`, error: error});
    }
};

const deletePump = async (req, res) => {
    try {
        const {id} = req.params;
        const result = await pumpModel.deletePump(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({message: `Pump with id: ${id} not found.`});
        }
        res.status(200).json({message: `Pump successfully deleted.`});
    } catch (error) {
        res.status(500).json({message: `Something went wrong while deleting pump with id: ${id}.`, error});
    }
};

export { addPump, editPump, getAllPumps, getSinglePump, deletePump };