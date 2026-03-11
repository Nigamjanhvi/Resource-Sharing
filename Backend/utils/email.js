const nodemailer = require('nodemailer');

/**
 * Create a Nodemailer transporter using environment variables
 * Supports Gmail, SendGrid SMTP, Mailtrap (for dev), etc.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,       // e.g. smtp.gmail.com or smtp.mailtrap.io
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT == 465, // true for port 465, false for others
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Generate a clean HTML email template for verification
 * @param {string} firstName - User's first name
 * @param {string} verificationLink - Full verification URL
 * @returns {string} HTML string
 */
const getVerificationTemplate = (firstName, verificationLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Verify Your Email</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f1f5f9; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#ffffff; border-radius:12px; overflow:hidden;
                     box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0ea5e9, #6366f1);
                            padding: 36px 40px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800;
                              letter-spacing:-0.5px;">
                    🎓 UniShare
                  </h1>
                  <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">
                    Student Resource Sharing Platform
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px 40px 20px;">
                  <h2 style="margin:0 0 12px; color:#1e293b; font-size:22px;">
                    Welcome, ${firstName}! 👋
                  </h2>
                  <p style="margin:0 0 20px; color:#475569; font-size:15px; line-height:1.7;">
                    Thanks for joining UniShare. You're one step away from connecting
                    with students at your university to share books, notes, and
                    academic resources.
                  </p>
                  <p style="margin:0 0 28px; color:#475569; font-size:15px; line-height:1.7;">
                    Please verify your email address by clicking the button below.
                    This link expires in <strong>24 hours</strong>.
                  </p>

                  <!-- Verification Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 32px;">
                        <a href="${verificationLink}"
                           style="background: linear-gradient(135deg, #0ea5e9, #6366f1);
                                  color: #ffffff; text-decoration: none;
                                  padding: 14px 36px; border-radius: 8px;
                                  font-size: 15px; font-weight: 700;
                                  display: inline-block; letter-spacing: 0.3px;">
                          ✅ Verify My Email
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Fallback link -->
                  <p style="margin:0 0 8px; color:#94a3b8; font-size:13px;">
                    Button not working? Copy and paste this link into your browser:
                  </p>
                  <p style="margin:0 0 32px; word-break:break-all;">
                    <a href="${verificationLink}"
                       style="color:#0ea5e9; font-size:13px;">
                      ${verificationLink}
                    </a>
                  </p>

                  <!-- Warning -->
                  <div style="background:#fef9ec; border:1px solid #fde68a;
                              border-radius:8px; padding:14px 18px; margin-bottom:24px;">
                    <p style="margin:0; color:#92400e; font-size:13px;">
                      ⚠️ If you didn't create a UniShare account, you can safely
                      ignore this email.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc; padding:24px 40px;
                            border-top:1px solid #e2e8f0; text-align:center;">
                  <p style="margin:0; color:#94a3b8; font-size:12px;">
                    © ${new Date().getFullYear()} UniShare. All rights reserved.
                  </p>
                  <p style="margin:6px 0 0; color:#94a3b8; font-size:12px;">
                    This is an automated email — please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Send a verification email to a newly registered user
 * @param {string} email - Recipient email address
 * @param {string} firstName - User's first name (used in greeting)
 * @param {string} token - Raw verification token (not hashed)
 */
const sendVerificationEmail = async (email, firstName, token) => {
  try {
    const transporter = createTransporter();

    // Build the verification URL pointing to the frontend
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const verificationLink = `${clientUrl}/verify-email/${token}`;

    const mailOptions = {
      from: `"UniShare 🎓" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your UniShare email address',
      html: getVerificationTemplate(firstName, verificationLink),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email} — ID: ${info.messageId}`);
    return info;

  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error.message);
    throw error; // Let the caller decide whether to fail or continue
  }
};

module.exports = { sendVerificationEmail };