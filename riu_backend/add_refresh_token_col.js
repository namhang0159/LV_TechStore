const sequelize = require('./src/config/database');

async function run() {
  try {
    await sequelize.query('ALTER TABLE users ADD COLUMN refresh_token VARCHAR(255);');
    console.log('Added refresh_token to users table');
  } catch (err) {
    console.error('Error users table:', err);
  }

  try {
    await sequelize.query('ALTER TABLE admins ADD COLUMN refresh_token VARCHAR(255);');
    console.log('Added refresh_token to admins table');
  } catch (err) {
    console.error('Error admins table:', err);
  }

  
  process.exit();
}

run();
