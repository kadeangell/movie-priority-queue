import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	console.error("DATABASE_URL environment variable is required");
	process.exit(1);
}

const sql = postgres(connectionString);

async function migrate() {
	// Create migrations tracking table if it doesn't exist
	await sql`
		CREATE TABLE IF NOT EXISTS _migrations (
			name TEXT PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)
	`;

	const migrationsDir = join(import.meta.dirname, "../migrations");
	const files = await readdir(migrationsDir);
	const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();

	const applied = await sql<{ name: string }[]>`
		SELECT name FROM _migrations ORDER BY name
	`;
	const appliedSet = new Set(applied.map((r) => r.name));

	for (const file of sqlFiles) {
		if (appliedSet.has(file)) {
			console.log(`  skip: ${file} (already applied)`);
			continue;
		}

		const content = await readFile(join(migrationsDir, file), "utf-8");
		console.log(`  apply: ${file}`);

		await sql.begin(async (tx: postgres.TransactionSql) => {
			await tx.unsafe(content);
			await tx`INSERT INTO _migrations (name) VALUES (${file})`;
		});
	}

	console.log("Migrations complete.");
	await sql.end();
}

migrate().catch((err) => {
	console.error("Migration failed:", err);
	process.exit(1);
});
