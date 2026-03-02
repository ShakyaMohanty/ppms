import nodemailer from 'nodemailer'
const sendPasswordResetEmail = async (email, resetString) => {
    try {
        const transport = nodemailer.createTransport({
            secure: true,
            host: "smtp.gmail.com",
            port: 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `Click the link to reset your password: ${process.env.CLIENT_URL}/reset-password?resetString=${resetString}`
        };

        const mailData = await transport.sendMail(mailOptions);
        return mailData;
    } catch (error) {
        console.log(`Password reset failed using nodemailer : `+ error)
        throw error
    }
}
export {sendPasswordResetEmail}