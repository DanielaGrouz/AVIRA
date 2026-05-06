const nodemailer = require('nodemailer');
const configClient = require("./configClient");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'appavira@gmail.com',
        pass: configClient.getConfig("GMAIL_PASSWORD")
    },
    tls: {
        rejectUnauthorized: false
    }
});



// const generateStyledHtml = (subject, content) => {
//     return `
//     <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; padding: 40px 20px; direction: ltr; text-align: left;">
//         <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
//
//             <div style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
//                 <img src="cid:logo1" alt="Appavira Logo" style="width: 80px; height: auto; margin-bottom: 20px;">
//                 <h1 style="margin: 0; color: #2c3e50; font-size: 22px; font-weight: 600; letter-spacing: -0.5px;">${subject}</h1>
//             </div>
//
//             <div style="padding: 40px; color: #4a5568; line-height: 1.6;">
//                 <p style="font-size: 16px; margin-bottom: 25px; color: #2d3748;">Hello,</p>
//
//                 <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 30px 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
//                     <p style="margin: 0; font-size: 18px; color: #1e293b; font-weight: 500; letter-spacing: 0.5px;">${content}</p>
//                 </div>
//
//                 <p style="font-size: 15px; color: #718096; margin-top: 40px;">
//                     Best regards,<br>
//                     <strong style="color: #2c3e50;">AVIRA Team</strong>
//                 </p>
//             </div>
//
//             <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #edf2f7;">
//                 <img src="cid:logo2" alt="Appavira Icon" style="width: 32px; height: auto; margin-bottom: 15px; opacity: 0.6; filter: grayscale(100%);">
//                 <p style="margin: 0; font-size: 12px; color: #a0aec0; letter-spacing: 0.5px; text-transform: uppercase;">
//                     © ${new Date().getFullYear()} AVIRA SYSTEM • AUTOMATED NOTIFICATION
//                 </p>
//             </div>
//         </div>
//     </div>
//     `;
// };

const generateStyledHtml = (subject, verificationCode) => {
    return `
    <!-- Outer Wrapper with the Real Background Image -->
    <div style="font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f6f9; background-image: url('cid:logo2'); background-size: cover; background-position: center; background-repeat: no-repeat; padding: 60px 20px; direction: ltr; text-align: left;">
        
        <!-- Main Card Container (Slightly transparent white to let the background subtly peek through, but keep text readable) -->
        <div style="max-width: 550px; margin: 0 auto; background-color: rgba(255, 255, 255, 0.96); border-radius: 30px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.15); border: 1px solid rgba(255, 255, 255, 0.8);">
            
            <!-- Header Section -->
            <div style="padding: 40px 40px 10px; text-align: center;">
                <!-- Fixed Logo: Forced square dimensions, object-fit to center the inner circle, and block display -->
                <img src="cid:logo1" alt="Appavira Logo" style="width: 80px; height: 80px; object-fit: cover; object-position: center; border-radius: 50%; margin: 0 auto 20px; display: block; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                
                <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">${subject}</h1>
            </div>
            
            <!-- Body Section -->
            <div style="padding: 20px 40px 40px; color: #475569; line-height: 1.6; text-align: center;">
                <p style="font-size: 16px; margin-bottom: 15px; color: #334155;">Hello,</p>
                <p style="font-size: 15px; margin-bottom: 35px; color: #64748b;">
                    Please use the verification code below to complete your secure authentication process.
                </p>
                
                <!-- The "Round" Verification Code Box -->
                <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px 15px; border-radius: 50px; margin: 0 auto 35px; max-width: 320px; border: 1px solid #bfdbfe; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);">
                    <p style="margin: 0; font-size: 38px; color: #1d4ed8; font-weight: 800; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; text-align: center; padding-left: 10px;">
                        ${verificationCode}
                    </p>
                </div>
                
                <p style="font-size: 14px; color: #94a3b8; margin-bottom: 0; line-height: 1.5;">
                    This code is valid for a limited time. If you didn't request this code, you can safely ignore this email.
                </p>
                
                <p style="font-size: 15px; color: #64748b; margin-top: 40px;">
                    Best regards,<br>
                    <strong style="color: #1e293b;">The AVIRA Team</strong>
                </p>
            </div>
            
            <!-- Footer Section -->
            <div style="background-color: rgba(248, 250, 252, 0.8); padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600;">
                    © ${new Date().getFullYear()} AVIRA SYSTEM • SECURE AUTHENTICATION
                </p>
            </div>
        </div>
    </div>
    `;
};

const sendMail = async (emailSubject, verificationCode, emailToSent) => {
    const textFallback = `${emailSubject}\n\nHello,\n\nYour verification code is: ${verificationCode}\n\nBest regards,\nAVIRA Team`;

    const mailOptions = {
        from: '"AVIRA system" <appavira@gmail.com>',
        to: emailToSent,
        subject: emailSubject,
        text: textFallback,
        html: generateStyledHtml(emailSubject, verificationCode),
        attachments: [
            {
                filename: 'logo1.png',
                path: './sources/logo.png',
                cid: 'logo1'
            },
            {
                filename: 'logo2.png',
                path: './sources/background.png',
                cid: 'logo2' // This CID is now feeding the CSS background-image
            }
        ]
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Auth email sent successfully!');
        return info;
    } catch (error) {
        console.error('❌ Error sending auth email:', error.message);
        throw error;
    }
};

sendMail("verification code", "123456", "danielagrouz@gmail.com")
module.exports = { sendMail };