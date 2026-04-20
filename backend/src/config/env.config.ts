export default () => ({
  port: Number(process.env.PORT ?? 3000),
  jwtSecret:
    process.env.JWT_SECRET ?? 'dev-secret-change-this-before-production',
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 28800),
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true',
  },
});
