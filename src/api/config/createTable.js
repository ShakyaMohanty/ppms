import { pool } from "./db.js";
import {readFile} from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createRoleTable = async () => {
   const sqlFilePath = path.join(__dirname, '..', 'queries', 'create_tables.sql');
//   console.log(sqlFilePath)

   try{
      const createRoleTableQuery = await readFile(sqlFilePath, 'utf8');
      const sqlClean = createRoleTableQuery.replace(/--.*$/gm, '');
      const queries = sqlClean.split(';').map(q => q.trim()).filter(q => q.length > 0);
      // await pool.execute(createRoleTableQuery);
        console.log(queries)
      // console.log(`Found ${queries.length} queries to execute.`);
      // for (const query of queries) {
      //    console.log(`Executing: ${query.substring(0, 80)}...`); 
      //    await pool.execute(query);

      //    // Add a brief pause to prevent race conditions in specific DB modes (e.g., MySQL < 8 or specific configurations)
      //    await new Promise(resolve => setTimeout(resolve, 50)); 
      // }
      // console.log('Table created successfully or already exists.');
   }catch(error){
      console.error('Error creating table:', error);
      process.exit(1);
   }
}

createRoleTable();