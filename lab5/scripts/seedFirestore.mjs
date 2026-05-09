import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { URLSearchParams } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const appDataPath = path.join(rootDir, "public", "data", "appData.json");
const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(rootDir, "serviceAccountKey.json");

const raw = await readFile(appDataPath, "utf-8");
const { hackathons = [], participants = [] } = JSON.parse(raw);

const getParticipantId = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");

const serviceAccountRaw = await readFile(serviceAccountPath, "utf-8");
const serviceAccount = JSON.parse(serviceAccountRaw);

const base64Url = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const createJwt = () => {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const claimSet = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedClaimSet = base64Url(JSON.stringify(claimSet));
  const unsigned = `${encodedHeader}.${encodedClaimSet}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();

  const signature = signer
    .sign(serviceAccount.private_key, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsigned}.${signature}`;
};

const toFirestoreValue = (value) => {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => toFirestoreValue(item)),
      },
    };
  }

  const valueType = typeof value;

  if (valueType === "string") {
    return { stringValue: value };
  }

  if (valueType === "boolean") {
    return { booleanValue: value };
  }

  if (valueType === "number") {
    if (Number.isInteger(value)) {
      return { integerValue: String(value) };
    }
    return { doubleValue: value };
  }

  if (valueType === "object") {
    const fields = Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, toFirestoreValue(nestedValue)]),
    );
    return {
      mapValue: {
        fields,
      },
    };
  }

  throw new Error(`Unsupported value type: ${valueType}`);
};

const toFirestoreFields = (objectValue) =>
  Object.fromEntries(
    Object.entries(objectValue).map(([key, value]) => [key, toFirestoreValue(value)]),
  );

const getAccessToken = async () => {
  const params = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: createJwt(),
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Token request failed: ${response.status} ${details}`);
  }

  const data = await response.json();
  return data.access_token;
};

const writeDocument = async (accessToken, collectionName, documentId, payload) => {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)/documents/${collectionName}/${encodeURIComponent(documentId)}`;

  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: toFirestoreFields(payload),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Write failed for ${collectionName}/${documentId}: ${response.status} ${details}`);
  }
};

const accessToken = await getAccessToken();

for (const hackathon of hackathons) {
  if (!hackathon?.slug) {
    throw new Error("Each hackathon item must contain a slug field");
  }
  await writeDocument(accessToken, "hackathons", hackathon.slug, hackathon);
}

for (const participant of participants) {
  const participantId = getParticipantId(participant.name);
  if (!participantId) {
    throw new Error("Participant name cannot be converted to a valid document id");
  }
  await writeDocument(accessToken, "participants", participantId, participant);
}

console.log(
  `Seed completed via service account: hackathons=${hackathons.length}, participants=${participants.length}`,
);
