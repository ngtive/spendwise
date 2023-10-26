export const connection = {
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT ? process.env.REDIS_PORT : '6379'),
}