import Joi from 'joi';

export const registerValidation = data => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .max(254)
      .required()
      .trim()
      .lowercase()
      .custom((value, helpers) => {
        if (
          value.includes('<script') ||
          value.includes('javascript:') ||
          value.includes('data:')
        ) {
          return helpers.error('string.malicious');
        }
        return value;
      })
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
        'string.max': 'Email must be less than 254 characters',
        'string.malicious': 'Email contains invalid content',
      }),
    password: Joi.string()
      .min(8)
      .max(128)
      .required()
      .custom((value, helpers) => {
        if (/^(.)\1{7,}$/.test(value)) {
          return helpers.error('string.weak');
        }
        if (value.toLowerCase().includes('password')) {
          return helpers.error('string.weak');
        }
        return value;
      })
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must be less than 128 characters',
        'string.weak': 'Password is too weak',
      }),
  });

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const loginValidation = data => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .max(254)
      .optional()
      .trim()
      .lowercase()
      .messages({
        'string.email': 'Email must be a valid email address',
        'string.max': 'Email must be less than 254 characters',
      }),
    password: Joi.string().min(1).max(128).required().messages({
      'string.empty': 'Password is required',
      'string.max': 'Password must be less than 128 characters',
    }),
  });

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const forgotPasswordValidation = data => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .max(254)
      .required()
      .trim()
      .lowercase()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
        'string.max': 'Email must be less than 254 characters',
      }),
  });

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const resetPasswordValidation = data => {
  const schema = Joi.object({
    resetToken: Joi.string().min(1).max(500).required().trim().messages({
      'string.empty': 'Reset token is required',
      'string.min': 'Reset token is required',
      'string.max': 'Reset token is invalid',
    }),
    newPassword: Joi.string().trim().min(8).max(128).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password must be less than 128 characters',
    }),
    confirmNewPassword: Joi.string()
      .trim()
      .optional()
      .valid(Joi.ref('newPassword'))
      .messages({
        'any.only': 'Passwords do not match',
      }),
  });

  return schema.validate(data, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });
};

export const validatePasswordSecurity = async password => {
  const commonPasswords = [
    'password',
    '123456',
    'password123',
    'admin',
    'qwerty',
    'letmein',
    'welcome',
    'monkey',
    '1234567890',
    '12345678',
    'welcome123',
    'Password1',
    'login',
    'root',
    'toor',
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    throw new Error('Password is too common');
  }

  return true;
};
