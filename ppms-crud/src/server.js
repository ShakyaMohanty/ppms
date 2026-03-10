import 'dotenv/config';
import express from 'express';
import { dbConnect } from './api/config/db.js';
import testRouter from './api/routes/test.route.js'
import path from 'path'
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
const app = express();
const PORT = process.env.PORT || 8000;

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
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
app.use('/api', testRouter);

const startServer = async () => {
    try{
        await dbConnect();
        app.listen(PORT, ()=>{
            console.log(`Server listening on PORT http://0.0.0.0:${PORT}`);
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

