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
  COOKIE_DOMAIN: Joi.string().optional(),
  COOKIE_SECURE: Joi.boolean().default(false),
  COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').default('lax'),
  CORS_ORIGIN: Joi.string().uri().required(),
  PASSWORD_RESET_TTL_SECONDS: Joi.number().integer().positive().default(1800),
  PASSWORD_RESET_PATH: Joi.string().default('/reset-password'),
  PASSWORD_RESET_FRONTEND_BASE_URL: Joi.string().uri().optional(),
  MODERATOR_EMAIL: Joi.string().email().optional(),
  MODERATOR_PASSWORD: Joi.string().min(8).optional(),
  MODERATOR_NAME: Joi.string().min(1).default('System Moderator'),
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
  mailjet: {
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_API_SECRET,
    from: process.env.MAILJET_FROM_EMAIL,
    senderName: process.env.MAILJET_FROM_NAME,
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
    domain: process.env.COOKIE_DOMAIN,
    secure:
      process.env.COOKIE_SECURE !== undefined
        ? process.env.COOKIE_SECURE === 'true'
        : undefined,
    sameSite: process.env.COOKIE_SAME_SITE,
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
  passwordReset: {
    ttlSeconds: process.env.PASSWORD_RESET_TTL_SECONDS
      ? parseInt(process.env.PASSWORD_RESET_TTL_SECONDS, 10)
      : undefined,
    path: process.env.PASSWORD_RESET_PATH,
    frontendBaseUrl: process.env.PASSWORD_RESET_FRONTEND_BASE_URL,
  },
  moderator: {
    email: process.env.MODERATOR_EMAIL,
    password: process.env.MODERATOR_PASSWORD,
    name: process.env.MODERATOR_NAME,
  },
});
