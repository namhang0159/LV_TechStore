const sequelize = require('./src/config/database');

async function run() {
  try {
    const [results, metadata] = await sequelize.query('SHOW COLUMNS FROM warranties;');
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

run();
