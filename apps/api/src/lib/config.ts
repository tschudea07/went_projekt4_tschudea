import 'dotenv/config';

export const webAppUrl =
  process.env.WEB_APP_URL ??
  process.env.FRONTEND_URL ??
  'http://localhost:4200';

export const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? webAppUrl)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
