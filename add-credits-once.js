require('dotenv').config();
const db = require('./src/database/db');

async function addCredits() {
    const email = 'saividesh4@gmail.com';
    const creditsToAdd = 200;

    console.log(`\nAdding ${creditsToAdd} credits to: ${email}`);

    const result = await db.query(
        `UPDATE users
         SET credits = credits + $1
         WHERE email = $2
         RETURNING email, credits`,
        [creditsToAdd, email]
    );

    if (result.rows.length === 0) {
        console.error(`❌ User not found: ${email}`);
    } else {
        console.log(`✅ Done! ${result.rows[0].email} now has ${result.rows[0].credits} credits.`);
    }

    await db.pool.end();
}

addCredits().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
