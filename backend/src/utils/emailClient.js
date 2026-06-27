const { Resend } = require('resend');
const configClient = require('./configClient');
const path = require('path');
const fs = require('fs');

const resend = new Resend(configClient.getConfig('RESEND_API_KEY'));

// We no longer need the getBase64Image function.
// Instead, we reference the Content-ID (cid) we will define in the attachments.
const generateStyledHtml = (subject, verificationCode) => {
  return `
    <div style="font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f6f9; background-image: url('cid:background.png'); background-size: cover; background-position: center; background-repeat: no-repeat; padding: 60px 20px; direction: ltr; text-align: left;">
        
        <div style="max-width: 550px; margin: 0 auto; background-color: rgba(255, 255, 255, 0.96); border-radius: 30px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.15); border: 1px solid rgba(255, 255, 255, 0.8);">
            
            <div style="padding: 40px 40px 10px; text-align: center;">
                <!-- Replaced Base64 string with cid reference -->
                <img src="cid:logo.png" alt="Appavira Logo" style="width: 80px; height: 80px; object-fit: cover; object-position: center; border-radius: 50%; margin: 0 auto 20px; display: block; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                
                <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">${subject}</h1>
            </div>
            
            <div style="padding: 20px 40px 40px; color: #475569; line-height: 1.6; text-align: center;">
                <p style="font-size: 16px; margin-bottom: 15px; color: #334155;">Hello,</p>
                <p style="font-size: 15px; margin-bottom: 35px; color: #64748b;">
                    Please use the verification code below to complete your secure authentication process.
                </p>
                
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

  try {
    // Read files dynamically into buffers at send time
    const logoBuffer = fs.readFileSync(path.join(__dirname, '../sources/logo.png'));
    const backgroundBuffer = fs.readFileSync(path.join(__dirname, '../sources/background.png'));

    const data = await resend.emails.send({
      from: 'AVIRA System <onboarding@resend.dev>',
      to: emailToSent,
      subject: emailSubject,
      text: textFallback,
      html: generateStyledHtml(emailSubject, verificationCode),
      attachments: [
        {
          filename: 'logo.png',
          content: logoBuffer,
          content_id: 'logo.png', // This links to src="cid:logo.png"
        },
        {
          filename: 'background.png',
          content: backgroundBuffer,
          content_id: 'background.png', // This links to url('cid:background.png')
        },
      ],
    });

    if (data.error) {
      throw new Error(JSON.stringify(data.error));
    }

    console.log('Auth email sent successfully!', data);
    return data;
  } catch (error) {
    console.error('Error sending auth email:', error.message);
    throw error;
  }
};

module.exports = { sendMail };
