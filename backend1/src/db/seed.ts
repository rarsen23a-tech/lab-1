import { migrate } from './migrate';
import { run } from './dbClient';

async function seed() {
    await migrate();

    const now = new Date().toISOString();

    await run(`INSERT OR IGNORE INTO Users (name, createdAt) VALUES ('Alice', '${now}');`);
    await run(`INSERT OR IGNORE INTO Users (name, createdAt) VALUES ('Bob', '${now}');`);
    await run(`INSERT OR IGNORE INTO Users (name, createdAt) VALUES ('Charlie', '${now}');`);

    await run(`INSERT OR IGNORE INTO Posts (userId, title, content, createdAt) VALUES (1, 'First Post', 'Hello from Alice!', '${now}');`);
    await run(`INSERT OR IGNORE INTO Posts (userId, title, content, createdAt) VALUES (2, 'Second Post', 'Hello from Bob!', '${now}');`);
    await run(`INSERT OR IGNORE INTO Posts (userId, title, content, createdAt) VALUES (1, 'Third Post', 'Alice again!', '${now}');`);

    await run(`INSERT OR IGNORE INTO Comments (postId, userId, text, createdAt) VALUES (1, 2, 'Nice post Alice!', '${now}');`);
    await run(`INSERT OR IGNORE INTO Comments (postId, userId, text, createdAt) VALUES (1, 3, 'Great content!', '${now}');`);
    await run(`INSERT OR IGNORE INTO Comments (postId, userId, text, createdAt) VALUES (2, 1, 'Thanks Bob!', '${now}');`);

    console.log('Seed completed');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});