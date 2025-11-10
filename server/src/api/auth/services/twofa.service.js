import speakeasy from 'speakeasy';

import Users from '../../../models/Auth.js';
import Tokens from '../../../config/jwt.js';
import Payload from '../../../utils/payload.js';
import createError from '../../../utils/create-error.js';

export default class TwoFactorService {

    // Generate secret & otpauth URL
    static async generate2FASecret(userId) {
        const user = await Users.findById(userId);
        if (!user) throw createError('User not found', 404);

        const secret = speakeasy.generateSecret({
            length: 20,
            name: `Arbitrage (${user.email})`
        });

        await Users.saveTwoFaSecret(userId, secret.base32);

        return { otpauth_url: secret.otpauth_url, secret: secret.base32 };
    }

    // Activate 2FA after user submits code
    static async activate2FA(userId, code) {
        const user = await Users.findById(userId);

        if (!user || !user.twofa_code) throw createError('2FA setup not found', 404);

        const verified = speakeasy.totp.verify({
            secret: user.twofa_code,
            encoding: 'base32',
            code,
            window: 1
        });

        if (!verified) throw createError('Invalid 2FA code', 400);

        await Users.turn2FaTrue(userId);

        return { message: '2FA enabled successfully' };
    }

    // Verify 2FA during login
    static async verify2FA(userId, code) {
        const user = await Users.findById(userId);
        if (!user || !user.twofa_code) throw createError('2FA not configured', 404);

        const verified = speakeasy.totp.verify({
            secret: user.twofa_code,
            encoding: 'base32',
            code,
            window: 1
        });

        if (!verified) throw createError('Invalid 2FA code', 400);

        const payload = new Payload(user);
        const tokens = Tokens.generateTokens({ ...payload });

        return { ...tokens, user: payload };
    }

    // Disable 2FA
    static async disable2FA(userId) {
        const user = await Users.findById(userId);
        if (!user) throw createError('User not found', 404);
        if (!user.is_twofa) throw createError('2FA is not enabled', 400);

        await Users.disableTwoFa(userId);

        return { message: '2FA disabled successfully' };
    }
}
