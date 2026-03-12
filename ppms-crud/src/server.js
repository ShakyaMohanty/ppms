import 'dotenv/config';
import express from 'express';
import { dbConnect } from './api/config/db.js';
import testRouter from './api/routes/test.route.js';
// import shiftRouter from './api/routes/shifts.route.js';
import tanksRouter from './api/routes/tanks.route.js';
// import pumpRouter from './api/routes/pumps.route.js';
// import operatorRouter from './api/routes/operators.route.js';
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./api/config/swagger_doc.js";
import path from 'path'
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// express static comes with security so we don't need to normalize our __dirname
app.use(express.static(path.join(__dirname, '../public'), {
    dotfiles: 'ignore',
    etag: false,
    setHeaders: (res) => {
        res.set('X-Powered-By', '')
    }
}))
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
app.use('/api', [testRouter, tanksRouter]);

const startServer = async () => {
    try{
        await dbConnect();
        app.listen(PORT, ()=>{
            console.log(`Server listening on PORT http://127.0.0.1:${PORT}`);
        });
    }
    catch(error){
        console.error('Failed to start server:', error);
        process.exit(1); // Exit the application if the connection fails
    }
}

// Call the async function and handle the promise with .then()
startServer().then(() => {
    console.log('Startup process complete.');
}).catch(error => {
    console.error('Server failed to start:', error);
});

