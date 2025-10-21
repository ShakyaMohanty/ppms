import { pool } from "./db.js";
import {readFile} from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createRoleTable = async () => {
     const sqlFilePath = path.join(__dirname, '..', 'queries', 'create_tables.sql');

     try{
        const createRoleTableQuery = await readFile(sqlFilePath, 'utf8');
        const queries = createRoleTableQuery.split(';').map(q => q.trim())
        .filter(q => q.length > 0);
        // await pool.execute(createRoleTableQuery);
        // console.log(queries)
        for (const query of queries) {
            await pool.execute(query);
        }
        console.log('Table created successfully or already exists.');
     }catch(error){
        console.error('Error creating table:', error);
        process.exit(1);
     }
}

createRoleTable();