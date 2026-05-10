const { Pool } = require("pg");

let pool;

const connectToDatabase = async () => {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const shouldUseSsl =
    process.env.PGSSL === "true" || process.env.PGSSL === "1" || process.env.NODE_ENV === "production";

  pool = new Pool({
    connectionString,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined
  });

  await pool.query("SELECT 1");
  return pool;
};

const query = async (text, params) => {
  if (!pool) {
    throw new Error("Database has not been initialized.");
  }
  return pool.query(text, params);
};

module.exports = {
  connectToDatabase,
  query
};
