import db from './db';

export function all<T = unknown>(sql: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => (err ? reject(err) : resolve(rows as T[])));
    });
}

export function get<T = unknown>(sql: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        db.get(sql, (err, row) => (err ? reject(err) : resolve(row as T)));
    });
}

export function run(sql: string): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
        db.run(sql, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}