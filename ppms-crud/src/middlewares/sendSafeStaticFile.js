// We only need to use normalize for sending safe file when we are manually using routing for 
// sending or serving static files

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sendSafeStaticFile = (filePath) => {
    return (req, res) => {
        const normalizedPath = path.normalize(filePath);

        if(!normalizedPath.startsWith(path.join(__dirname, '../../public'))){
            res.status(403).send('Forbidden');
        };

        res.sendFile(normalizedPath, (err) => {
            if(err){
                console.error(`Error serving ${normalizedPath}:`, err.message);
                // Don't expose detailed error information
                if (err.code === 'ENOENT') {
                    return res.status(404).send('Not Found');
                }
                return res.status(500).send('Internal Server Error');
            };
        });
    };
    
};

export {sendSafeStaticFile};