export const PASSWORD_RESET_REQUEST_TEMPLATE = otpCode => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 32px 0;">
    <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); padding: 32px;">
      <h2 style="color: #2d7ff9; margin-bottom: 18px; font-weight: 700; font-size: 28px; letter-spacing: 1px;">
        Password Reset Code
      </h2>
      <p style="color: #333; font-size: 16px; margin-bottom: 24px;">
        You have requested to reset your password. Use the 6-digit code below to continue.
      </p>
      <div style="background: #f0f4ff; color: #2d7ff9; font-size: 28px; font-weight: 700; padding: 16px 24px; border-radius: 12px; width: fit-content; margin: 0 auto 24px auto; letter-spacing: 6px; text-align: center;">
        ${otpCode}
      </div>
      <p style="color: #888; font-size: 14px; margin-top: 32px; text-align: center;">
        This code is valid for a limited time. If you did not request this, please ignore this email.
      </p>
    </div>
  </div>
`;
