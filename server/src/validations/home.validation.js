import Joi from 'joi';

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required()
});

export const limitQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(20).default(5)
});

export const validatePagination = (req, res, next) => {
  const { error, value } = paginationSchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  req.query = value;
  next();
};

export const validateIdParam = (req, res, next) => {
  const { error, value } = idParamSchema.validate(req.params);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  req.params = value;
  next();
};

export const validateLimitQuery = (req, res, next) => {
  const { error, value } = limitQuerySchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  req.query = value;
  next();
};