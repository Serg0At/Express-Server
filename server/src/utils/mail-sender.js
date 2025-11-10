// NPM Modules
import nodemailer from 'nodemailer';

// Local Modules
import { VERIFICATION_EMAIL_TEMPLATE } from '../templates/verifyEmail-template.js';
import { PASSWORD_RESET_REQUEST_TEMPLATE } from '../templates/resetPassword-template.js';

export default class MailSender {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendSecurityAlertEmail(to, newIp, oldIp) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: to,
        subject: 'Security Alert - New Login Location',
        html: `
                    <h2>Security Alert</h2>
                    <p>We detected a login to your account from a new location:</p>
                    <p><strong>New IP:</strong> ${newIp}</p>
                    <p><strong>Previous IP:</strong> ${oldIp}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p>If this was you, you can ignore this message. If not, please reset your password immediately.</p>
                `,
      });
    } catch (error) {
      console.error('Security alert email failed:', error);
      throw new Error('Failed to send security alert email');
    }
  }

  async sendVerificationEmail(to, otpCode) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: to,
        subject: 'Email Activation on ' + process.env.API_URL,
        text: '',
        html: VERIFICATION_EMAIL_TEMPLATE(otpCode),
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetRequestEmail(to, otpCode) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: to,
      subject: 'Password Reset Request on ' + process.env.API_URL,
      text: '',
      html: PASSWORD_RESET_REQUEST_TEMPLATE(otpCode),
    });
  }

  async sendPromoCodeEmail(to, name, promoCode) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: to,
        subject: "Congratulations! You've Earned a Promo Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50;">🎉 Congratulations ${name || 'Friend'}!</h2>
            <p>Great news! Someone you referred has just purchased a subscription plan.</p>
            <p>As a thank you for spreading the word about our service, we're excited to give you this exclusive promo code:</p>
            
            <div style="background-color: #f8f9fa; border: 2px dashed #4CAF50; padding: 20px; text-align: center; margin: 20px 0;">
              <h3 style="color: #4CAF50; margin: 0; font-size: 24px; letter-spacing: 2px;">${promoCode}</h3>
            </div>
            
            <p>You can use this promo code to get a discount on your next subscription or service upgrade.</p>
            
            <p style="margin-top: 30px;">
              <strong>How to use your promo code:</strong><br>
              1. Log in to your account<br>
              2. Go to the subscription page<br>
              3. Enter the promo code during checkout<br>
              4. Enjoy your discount!
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This promo code is exclusively for you and can be used once. Thank you for being part of our community!
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Promo code email failed:', error);
      throw new Error('Failed to send promo code email');
    }
  }
}
