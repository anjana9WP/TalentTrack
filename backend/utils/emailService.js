// utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 587, // Use 465 for SSL, 587 for TLS
    secure: false, // `false` for TLS (587), `true` for SSL (465)
    auth: {
        user: "mrmrizkan@yahoo.com", // Your Yahoo email
        pass: "arvnmlmeffvnsksh", // Your Yahoo App Password
    },
    tls: {
        rejectUnauthorized: false, // Ignore certificate validation issues
    },
});

const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: '"Event System" <mrmrizkan@yahoo.com>', // Yahoo requires "from" to be your Yahoo email
            to,
            subject,
            text,
        });
        console.log(`📧 Email sent to ${to}: ${info.response}`);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};

module.exports = sendEmail;

