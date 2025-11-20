import 'dotenv/config';
import express from 'express';
import { dbConnect } from './api/config/db.js';
import userRouter from './api/routes/users.route.js'
import shiftRouter from './api/routes/shifts.route.js'
import tankRouter from './api/routes/tanks.route.js'
import { startSessionCleanup } from './api/services/sessionCleanup.js';
import { startResetPasswordTokenCleanup } from './api/services/tokenCleanup.js';
import path from 'path'
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from './api/services/logger.js';

const app = express();
startSessionCleanup();
startResetPasswordTokenCleanup();
const PORT = process.env.PORT || 8000;


// app.get('/', (req, res) => {
//     console.log(req.host);
//     res.json({message: "successfully getting / "})
// });

app.use(express.json());
app.use(cookieParser());

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// express static comes with security so we don't need to normalize our __dirname
app.use(express.static(path.join(__dirname, '../public'), {
    dotfiles: 'ignore',
    etag: false,
    setHeaders: (res) => {
        res.set('X-Powered-By', '')
    }
}))

app.use('/api', [userRouter, shiftRouter, tankRouter]);


const startServer = async () => {
    try{
        await dbConnect();
        app.listen(PORT, ()=>{
            logger.info("Server started");
            console.log(`Server listening on PORT http://127.0.0.1:${PORT}`);
        });
    }
    catch(error){
        logger.error("Failed to start server")
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

