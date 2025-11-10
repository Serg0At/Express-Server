import { 
    registerValidation, 
    loginValidation, 
    forgotPasswordValidation, 
    resetPasswordValidation,
    validatePasswordSecurity
} from '../../../validations/auth.vaildation.js';

export default class AuthValidation {
    
    static async registration(req, res, next) {
        try {
            // Validate input
            const { error, value } = registerValidation(req.body);
            if (error) {
                return res.status(400).json({ 
                    error: 'Validation failed',
                    details: error.details.map(detail => detail.message)
                });
            }

            // Additional password security check
            await validatePasswordSecurity(value.password);

            // Set validated data back to req.body
            req.body = value;
            next();
        } catch (error) {
            return res.status(400).json({ 
                error: error.message || 'Validation failed'
            });
        }
    }

    static async login(req, res, next) {
        try {
            const { error, value } = loginValidation(req.body);
            if (error) {
                return res.status(400).json({ 
                    error: 'Validation failed',
                    details: error.details.map(detail => detail.message)
                });
            }

            req.body = value;
            next();
        } catch (error) {
            return res.status(400).json({ 
                error: error.message || 'Validation failed'
            });
        }
    }

    static async forgotPassword(req, res, next) {
        try {
            const { error, value } = forgotPasswordValidation(req.body);
            if (error) {
                return res.status(400).json({ 
                    error: 'Validation failed',
                    details: error.details.map(detail => detail.message)
                });
            }

            req.body = value;
            next();
        } catch (error) {
            return res.status(400).json({ 
                error: error.message || 'Validation failed'
            });
        }
    }

    static async resetPassword(req, res, next) {
        try {
            // Normalize possible alternative client field names and types
            const payload = { ...req.body };
            if (payload && typeof payload === 'object') {
                if (payload.newPassword === undefined && payload.password !== undefined) {
                    payload.newPassword = payload.password;
                }
                if (payload.newPassword === undefined && payload.new_password !== undefined) {
                    payload.newPassword = payload.new_password;
                }
                if (payload.confirmNewPassword === undefined && payload.confirmPassword !== undefined) {
                    payload.confirmNewPassword = payload.confirmPassword;
                }
                if (payload.confirmNewPassword === undefined && payload.confirm_password !== undefined) {
                    payload.confirmNewPassword = payload.confirm_password;
                }
                if (payload.confirmNewPassword === undefined && payload.confirm_new_password !== undefined) {
                    payload.confirmNewPassword = payload.confirm_new_password;
                }
                if (payload.resetToken !== undefined && typeof payload.resetToken !== 'string') {
                    payload.resetToken = String(payload.resetToken);
                }
                if (payload.newPassword !== undefined && typeof payload.newPassword !== 'string') {
                    payload.newPassword = String(payload.newPassword);
                }
                if (payload.confirmNewPassword !== undefined && typeof payload.confirmNewPassword !== 'string') {
                    payload.confirmNewPassword = String(payload.confirmNewPassword);
                }
                if (typeof payload.resetToken === 'string') payload.resetToken = payload.resetToken.trim();
                if (typeof payload.newPassword === 'string') payload.newPassword = payload.newPassword.trim();
                if (typeof payload.confirmNewPassword === 'string') payload.confirmNewPassword = payload.confirmNewPassword.trim();
            }

            const { error, value } = resetPasswordValidation(payload);
            if (error) {
                return res.status(400).json({ 
                    error: 'Validation failed',
                    details: error.details.map(detail => detail.message)
                });
            }

            // Additional password security check
            await validatePasswordSecurity(value.newPassword);

            req.body = value;
            next();
        } catch (error) {
            return res.status(400).json({ 
                error: error.message || 'Validation failed'
            });
        }
    }
}
