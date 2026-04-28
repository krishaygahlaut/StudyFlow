const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const emailTemplates = {
  verification: (name, url) => ({
    subject: 'Verify your StudyFlow account',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><style>
        body { font-family: 'DM Sans', Arial, sans-serif; background: #050508; color: #fff; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #a855f7, #3b82f6); padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
        .body { padding: 32px; }
        .body p { color: rgba(255,255,255,0.7); line-height: 1.7; margin: 0 0 16px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #a855f7, #3b82f6); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; margin: 16px 0; }
        .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); font-size: 13px; }
        .expire { background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.2); border-radius: 8px; padding: 12px 16px; font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 16px; }
      </style></head>
      <body>
        <div class="container">
          <div class="header"><h1>⚡ StudyFlow</h1></div>
          <div class="body">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Welcome to StudyFlow! Please verify your email address to activate your account and start your productivity journey.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${url}" class="btn">Verify Email Address</a>
            </div>
            <div class="expire">⏰ This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</div>
          </div>
          <div class="footer">© 2024 StudyFlow. Built for students, by students.</div>
        </div>
      </body></html>
    `,
  }),

  passwordReset: (name, url) => ({
    subject: 'Reset your StudyFlow password',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><style>
        body { font-family: Arial, sans-serif; background: #050508; color: #fff; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #ef4444, #f97316); padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: #fff; }
        .body { padding: 32px; }
        .body p { color: rgba(255,255,255,0.7); line-height: 1.7; margin: 0 0 16px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #ef4444, #f97316); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; margin: 16px 0; }
        .warning { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; padding: 12px 16px; font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 16px; }
        .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); font-size: 13px; }
      </style></head>
      <body>
        <div class="container">
          <div class="header"><h1>🔐 Password Reset</h1></div>
          <div class="body">
            <p>Hi <strong>${name}</strong>,</p>
            <p>We received a request to reset your StudyFlow password. Click the button below to create a new password.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${url}" class="btn">Reset Password</a>
            </div>
            <div class="warning">⚠️ This link expires in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email — your account is safe.</div>
          </div>
          <div class="footer">© 2024 StudyFlow. If you need help, contact support@studyflow.app</div>
        </div>
      </body></html>
    `,
  }),

  welcomeFaculty: (name, tempPassword) => ({
    subject: 'Welcome to StudyFlow — Faculty Account Created',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><style>
        body { font-family: Arial, sans-serif; background: #050508; color: #fff; margin: 0; }
        .container { max-width: 560px; margin: 40px auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #06b6d4, #10b981); padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: #fff; }
        .body { padding: 32px; }
        .body p { color: rgba(255,255,255,0.7); line-height: 1.7; margin: 0 0 16px; }
        .creds { background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); border-radius: 12px; padding: 20px; margin: 20px 0; }
        .creds p { margin: 4px 0; font-family: monospace; font-size: 14px; }
        .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); font-size: 13px; }
      </style></head>
      <body>
        <div class="container">
          <div class="header"><h1>👨‍🏫 Faculty Welcome</h1></div>
          <div class="body">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your faculty account on StudyFlow has been created. You can now log in and start tracking your students' progress.</p>
            <div class="creds">
              <p><strong>Login URL:</strong> ${process.env.CLIENT_URL}/login</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p style="color:rgba(239,68,68,0.8);">⚠️ Please change your password immediately after logging in.</p>
          </div>
          <div class="footer">© 2024 StudyFlow</div>
        </div>
      </body></html>
    `,
  }),
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'StudyFlow'}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const template = emailTemplates.verification(user.name, url);
  return sendEmail({ to: user.email, ...template });
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const template = emailTemplates.passwordReset(user.name, url);
  return sendEmail({ to: user.email, ...template });
};

const sendFacultyWelcomeEmail = async (user, tempPassword) => {
  const template = emailTemplates.welcomeFaculty(user.name, tempPassword);
  return sendEmail({ to: user.email, ...template });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendFacultyWelcomeEmail };
