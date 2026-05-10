import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const appDataPath = path.join(rootDir, "public", "data", "appData.json");

const raw = await readFile(appDataPath, "utf-8");
const { hackathons = [], participants = [] } = JSON.parse(raw);

const getParticipantId = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const shouldUseSsl =
  process.env.PGSSL === "true" || process.env.PGSSL === "1" || process.env.NODE_ENV === "production";

const client = new Client({
  connectionString,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined
});

await client.connect();

try {
  await client.query("BEGIN");

  for (const hackathon of hackathons) {
    if (!hackathon?.slug) {
      throw new Error("Each hackathon item must contain a slug field");
    }

    const payload = { ...hackathon, slug: hackathon.slug };

    await client.query(
      "INSERT INTO hackathons (slug, data) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data",
      [hackathon.slug, JSON.stringify(payload)]
    );
  }

  for (const participant of participants) {
    const participantId = getParticipantId(participant?.name || "");
    if (!participantId) {
      throw new Error("Participant name cannot be converted to a valid document id");
    }

    const payload = { ...participant, id: participantId };
    const points = Number.isFinite(Number(participant?.points)) ? Number(participant.points) : 0;

    await client.query(
      "INSERT INTO participants (id, points, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET points = EXCLUDED.points, data = EXCLUDED.data",
      [participantId, points, JSON.stringify(payload)]
    );
  }

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}

console.log(
  `Seed completed: hackathons=${hackathons.length}, participants=${participants.length}`
);
