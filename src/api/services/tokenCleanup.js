import cron from 'node-cron';
import * as userModel from '../models/users.model.js';

let isTokenCleanupRunning = false;

const cleanupExpiredResetPasswordToken = async () => {
    if(isTokenCleanupRunning){
        console.warn(`reset-password token cleanup skipped... already running.`);
        return;
    }
    isTokenCleanupRunning = true;
    try {
        const result = await userModel.removeResetTokenWithTimeExpiry();
        if(result.affectedRows > 0){
            console.log(`Cleaned up ${result.affectedRows} expired reset-password token at ${new Date()}`);
        }else{
            console.log('No expired reset-password token to clean up.'); // Added log
        }
    } catch (error) {
        console.log('reset-password token cleanup failed: ', error)
    } finally {
        isTokenCleanupRunning = false;
    }
}

const startResetPasswordTokenCleanup = () => {
    cron.schedule('*/2 * * * *', cleanupExpiredResetPasswordToken)
    console.log('reset-password token cleanup scheduler started (runs every 2 minutes)');
}

export {startResetPasswordTokenCleanup}