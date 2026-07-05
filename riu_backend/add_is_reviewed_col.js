const db = require('./src/models');

const run = async () => {
    try {
        await db.sequelize.query('ALTER TABLE order_items ADD COLUMN is_reviewed BOOLEAN DEFAULT FALSE;');
        console.log("Column added successfully.");
    } catch (e) {
        if (e.message.includes('Duplicate column name')) {
            console.log("Column already exists.");
        } else {
            console.log("Error:", e.message);
        }
    }
    process.exit();
}
run();
