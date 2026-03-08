import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(8000),
  JWT_ACCESS_SECRET: Joi.string().min(64).required(),
  JWT_REFRESH_SECRET: Joi.string().min(64).required(),
  ACCESS_TOKEN_TTL: Joi.string().default('15m'),
  REFRESH_TOKEN_TTL: Joi.string().default('7d'),
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  SESSION_PREFIX: Joi.string().default('sid:'),
  SESSION_EXPIRY: Joi.number().default(604800),
  SLA_HIGH_PRIORITY_HOURS: Joi.number().integer().positive().default(24),
  SLA_MEDIUM_PRIORITY_HOURS: Joi.number().integer().positive().default(48),
  SLA_LOW_PRIORITY_HOURS: Joi.number().integer().positive().default(72),
  SLA_AT_RISK_WINDOW_HOURS: Joi.number().integer().positive().default(6),
  COOKIE_SECRET: Joi.string().min(64).required(),
  CORS_ORIGIN: Joi.string().uri().required(),
});

export const configuration = () => ({
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenTTL: process.env.ACCESS_TOKEN_TTL,
    refreshTokenTTL: process.env.REFRESH_TOKEN_TTL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
      ? parseInt(process.env.REDIS_PORT, 10)
      : undefined,
    url: process.env.REDIS_URL,
  },
  session: {
    prefix: process.env.SESSION_PREFIX,
    expiry: process.env.SESSION_EXPIRY
      ? parseInt(process.env.SESSION_EXPIRY, 10)
      : undefined,
  },
  sla: {
    highPriorityHours: process.env.SLA_HIGH_PRIORITY_HOURS
      ? parseInt(process.env.SLA_HIGH_PRIORITY_HOURS, 10)
      : undefined,
    mediumPriorityHours: process.env.SLA_MEDIUM_PRIORITY_HOURS
      ? parseInt(process.env.SLA_MEDIUM_PRIORITY_HOURS, 10)
      : undefined,
    lowPriorityHours: process.env.SLA_LOW_PRIORITY_HOURS
      ? parseInt(process.env.SLA_LOW_PRIORITY_HOURS, 10)
      : undefined,
    atRiskWindowHours: process.env.SLA_AT_RISK_WINDOW_HOURS
      ? parseInt(process.env.SLA_AT_RISK_WINDOW_HOURS, 10)
      : undefined,
  },
  cookie: {
    secret: process.env.COOKIE_SECRET,
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
});
