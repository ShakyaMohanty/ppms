import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (email, resetString) => {
    try{
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?resetString=${resetString}`
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [email],
            subject: 'Password Reset Request',
            html: `<p>Click the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
        });
        if (error) {
            throw error; // Re-throw the error to be caught by the controller
        }

        console.log('Password reset email sent:', data);
        return data;
    }catch(error){
        console.error('Failed to send password reset email:', error);
        throw error;
    }
}

export {sendPasswordResetEmail}