export const VERIFICATION_EMAIL_TEMPLATE = otpCode => `
  <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(135deg, #e0e7ff 0%, #f4f4f4 100%);
          margin: 0;
          padding: 0;
        }
        .container {
          background: #fff;
          max-width: 480px;
          margin: 48px auto;
          padding: 40px 36px 32px 36px;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(45,127,249,0.10), 0 1.5px 6px rgba(0,0,0,0.04);
          border: 1.5px solid #e3e8f0;
        }
        h2 {
          color: #2d7ff9;
          margin-bottom: 18px;
          font-weight: 700;
          font-size: 28px;
          letter-spacing: 1px;
          text-align: center;
        }
        p {
          color: #333;
          font-size: 16px;
          margin-bottom: 22px;
          text-align: center;
        }
        .otp-box {
          background: #f0f4ff;
          color: #2d7ff9;
          font-size: 28px;
          font-weight: 700;
          padding: 16px 24px;
          border-radius: 12px;
          width: fit-content;
          margin: 0 auto 24px auto;
          letter-spacing: 6px;
          text-align: center;
        }
        .info {
          color: #888;
          font-size: 14px;
          margin-top: 18px;
          text-align: center;
        }
        .footer {
          margin-top: 36px;
          font-size: 13px;
          color: #b0b8c9;
          text-align: center;
          border-top: 1px solid #f0f2f7;
          padding-top: 18px;
          letter-spacing: 0.5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Email Verification Code</h2>
        <p>
          Welcome to <b>CodureTrade</b>!<br>
          Use the 6-digit code below to verify your email address.
        </p>
        <div class="otp-box">${otpCode}</div>
        <div class="info">
          This code is valid for a limited time.<br>
          If you did not request this, you can safely ignore this email.
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} CodureTrade &mdash; All rights reserved.
        </div>
      </div>
    </body>
  </html>
`;
