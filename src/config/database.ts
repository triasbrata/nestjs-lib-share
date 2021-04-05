export default () => ({
  database: {
    host: process.env['DB_HOST'],
    port: process.env['DB_PORT'],
    username: process.env['DB_USER'],
    password: process.env['DB_PASS'],
    database: process.env['DB_NAME'],
  },
  sonar_media: {
    host: process.env['DB_SM_HOST'],
    port: process.env['DB_SM_PORT'],
    username: process.env['DB_SM_USER'],
    password: process.env['DB_SM_PASS'],
    database: process.env['DB_SM_NAME'],
  },
  sonar_marketplace: {
    host: process.env['DB_SMP_HOST'],
    port: process.env['DB_SMP_PORT'],
    username: process.env['DB_SMP_USER'],
    password: process.env['DB_SMP_PASS'],
    database: process.env['DB_SMP_NAME'],
  },
});
