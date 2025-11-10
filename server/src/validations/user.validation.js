import Joi from 'joi';

export const validateOtpCodeValidation = data => {
  const schema = Joi.object({
    otpCode: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.empty': 'Verification code is required',
        'string.length': 'Verification code must be exactly 6 digits',
        'string.pattern.base': 'Verification code must contain only numbers',
        'any.required': 'Verification code is required'
      })
  });

  return schema.validate(data);
};

export const changeNameValidation = data => {
  const schema = Joi.object({
    newName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name must be less than 50 characters',
        'string.pattern.base': 'Name can only contain letters and spaces',
        'any.required': 'Name is required'
      })
  });

  return schema.validate(data);
};

export const changeEmailValidation = data => {
  const schema = Joi.object({
    newEmail: Joi.string()
      .email({ tlds: { allow: false } })
      .min(5)
      .max(254)
      .required()
      .lowercase()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
        'string.min': 'Email must be at least 5 characters long',
        'string.max': 'Email must be less than 254 characters',
        'any.required': 'Email is required'
      })
  });

  return schema.validate(data);
};

export const changePasswordValidation = data => {
  const schema = Joi.object({
    oldPassword: Joi.string()
      .min(1)
      .max(128)
      .required()
      .messages({
        'string.empty': 'Current password is required',
        'string.max': 'Current password must be less than 128 characters',
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
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
        'string.empty': 'New password is required',
        'string.min': 'New password must be at least 8 characters long',
        'string.max': 'New password must be less than 128 characters',
        'string.weak': 'New password is too weak',
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Password confirmation does not match new password',
        'any.required': 'Password confirmation is required'
      })
  });

  return schema.validate(data);
};