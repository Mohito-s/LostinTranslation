import pino from 'pino';

// Structured JSON logging. Pretty-printed in development, raw JSON in
// production (Cloud Run / AI Studio), and fully silent during tests.
const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
  enabled: !isTest,
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'lost-in-translation' },
  ...(isDev && !isTest
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}),
});

export default logger;