import fs from 'fs';
import path from 'path';
import { run, all } from './dbClient';

type MigrationRow = { filename: string };

export async function migrate(): Promise<void> {
    await run('PRAGMA foreign_keys = ON;');

    await run(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id INTEGER PRIMARY KEY,
            filename TEXT NOT NULL UNIQUE,
            appliedAt TEXT NOT NULL
        );
    `);

    const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
    const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => /^\d+_.+\.sql$/.test(f))
        .sort();

    const applied = await all<MigrationRow>('SELECT filename FROM schema_migrations;');
    const appliedSet = new Set(applied.map((x) => x.filename));

    for (const file of files) {
        if (appliedSet.has(file)) continue;

        const fullPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(fullPath, 'utf8').trim();

        if (!sql) continue;

        await run(sql);

        const now = new Date().toISOString();
        await run(`
            INSERT INTO schema_migrations (filename, appliedAt)
            VALUES ('${file.replace(/'/g, "''")}', '${now}');
        `);

        console.log(`Migration applied: ${file}`);
    }

    console.log('DB schema initialized');
}