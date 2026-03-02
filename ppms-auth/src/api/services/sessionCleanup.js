import cron from 'node-cron';
import * as userModel from '../models/users.model.js'

let isSessionCleanupRunning = false;
const cleanupExpiredSessions = async ( ) => {
    if(isSessionCleanupRunning){
        console.warn(`Session cleanup skipped... already running.`);
        return;
    }
    isSessionCleanupRunning = true;

    try{
        const result = await userModel.removeSessionWithTimeExpiry();

        if(result.affectedRows > 0){
            console.log(`Cleaned up ${result.affectedRows} expired sessions at ${new Date()}`);
        }else {
            console.log('No expired sessions to clean up.'); // Added log
        }
    }catch(error){
        console.error('Session cleanup failed:', error);
    }finally{
        isSessionCleanupRunning = false;
    }
    
}

const startSessionCleanup = () => {
    cron.schedule('*/2 * * * *', cleanupExpiredSessions);
    console.log('Session cleanup scheduler started (runs every 2 minutes)');
};

export {startSessionCleanup}