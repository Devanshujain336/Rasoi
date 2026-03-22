import nodemailer from "nodemailer";

/**
 * sendEmail utility
 * Sends an email using Nodemailer and Gmail SMTP (or any custom SMTP configured in .env).
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
const sendEmail = async (options) => {
    // Return early/mock in development if credentials aren't set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("\n⚠️ EMAIL_USER or EMAIL_PASS not set in .env.");
        console.warn(`Simulated sending email to: ${options.to}`);
        console.warn(`Subject: ${options.subject}`);
        console.warn(`Text: ${options.text}\n`);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // use STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        },
        // Force IPv4 to avoid ENETUNREACH errors on some cloud environments (like Render)
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        family: 4 
    });

    try {
        console.log(`📡 SMTP: Verifying connection to ${transporter.options.host}:${transporter.options.port}...`);
        await transporter.verify();
        console.log("✅ SMTP: Server is ready to take our messages");
    } catch (err) {
        console.error("❌ SMTP: Verification failed:", err);
        // We don't throw here to avoid crashing but we log it clearly
    }

    const mailOptions = {
        from: `"Rasoi Admin" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✉️ Email successfully sent to ${options.to}`);
    } catch (err) {
        console.error("❌ Error sending email:", err);
        throw err;
    }
};

export default sendEmail;
