const sequelize = require('./src/config/database');

async function run() {
  try {
    await sequelize.query('ALTER TABLE orders ADD COLUMN delivery_method VARCHAR(255);');
    console.log('Column added successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

run();
