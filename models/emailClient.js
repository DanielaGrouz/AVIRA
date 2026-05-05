const nodemailer = require('nodemailer');
const configClient = require("./configClient");
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'appavira@gmail.com',
        pass: configClient.getConfig("GMAIL_PASSWORD")
    }
});


const generateStyledHtml = (subject, content) => {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #fdfbfb; padding: 40px; direction: ltr; text-align: left;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f1f1f1;">
            
            <!-- Header Section -->
            <div style="background-color: #e0f2f1; padding: 30px; text-align: center;">
                <img src="cid:logo1" alt="Appavira Logo" style="width: 80px; height: auto; margin-bottom: 15px;">
                <h1 style="margin: 0; color: #4db6ac; font-size: 24px; font-weight: 600;">${subject}</h1>
            </div>
            
            <!-- Body Section -->
            <div style="padding: 40px; color: #546e7a; line-height: 1.8;">
                <p style="font-size: 18px; margin-bottom: 20px;">Hello,</p>
                
                <div style="background-color: #f3e5f5; border-left: 5px solid #ce93d8; padding: 25px; border-radius: 12px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 16px; color: #6a1b9a;">${content}</p>
                </div>
                
                <p style="font-size: 14px; color: #90a4ae; margin-top: 40px;">
                    Best regards,<br>
                    <strong>AVIRA Team</strong>
                </p>
            </div>
            
            <!-- Footer Section -->
            <div style="background-color: #fafafa; padding: 25px; text-align: center; border-top: 1px solid #f1f1f1;">
                <img src="cid:logo2" alt="Appavira Icon" style="width: 40px; height: auto; margin-bottom: 10px; opacity: 0.8;">
                <p style="margin: 0; font-size: 11px; color: #b0bec5; letter-spacing: 1px; text-transform: uppercase;">
                    © ${new Date().getFullYear()} AVIRA System • Automated Notification
                </p>
            </div>
        </div>
    </div>
    `;
};

const sendMail = async (emailContent, emailSubject, emailToSent) => {
    const mailOptions = {
        from: '"AVIRA system" <appavira@gmail.com>',
        to: emailToSent,
        subject: emailSubject,
        text: emailContent,
        html: generateStyledHtml(emailSubject, emailContent),
        attachments: [
            {
                filename: 'logo1.png',
                path: path.join(__dirname, 'models', 'logo.png'),
                cid: 'logo1'
            },
            {
                filename: 'logo2.png',
                path: path.join(__dirname, 'models', 'background.png'),
                cid: 'logo2'
            }
        ]
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ email sent successfully!');
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        throw error;
    }
};

module.exports = { sendMail };