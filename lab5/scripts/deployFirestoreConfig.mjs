import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { URLSearchParams, fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(rootDir, "serviceAccountKey.json");

const rulesPath = path.join(rootDir, "firestore.rules");

const serviceAccountRaw = await readFile(serviceAccountPath, "utf-8");
const serviceAccount = JSON.parse(serviceAccountRaw);
const rulesContent = await readFile(rulesPath, "utf-8");

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
    scope: "https://www.googleapis.com/auth/cloud-platform",
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

const authedJsonFetch = async (url, accessToken, init = {}) => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = json?.error?.message || text;
    const error = new Error(`Request failed: ${response.status} ${message}`);
    error.status = response.status;
    error.details = json;
    throw error;
  }

  return json;
};

const deployRules = async (accessToken) => {
  const projectId = serviceAccount.project_id;

  const ruleset = await authedJsonFetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        source: {
          files: [
            {
              name: "firestore.rules",
              content: rulesContent,
            },
          ],
        },
      }),
    },
  );

  const releaseName = `projects/${projectId}/releases/cloud.firestore`;

  try {
    await authedJsonFetch(
      `https://firebaserules.googleapis.com/v1/${releaseName}`,
      accessToken,
      {
        method: "PATCH",
        body: JSON.stringify({
          release: {
            name: releaseName,
            rulesetName: ruleset.name,
          },
          updateMask: "rulesetName",
        }),
      },
    );
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }

    await authedJsonFetch(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          name: releaseName,
          rulesetName: ruleset.name,
        }),
      },
    );
  }

  return ruleset.name;
};

const ensureApplicationsIndex = async (accessToken) => {
  const projectId = serviceAccount.project_id;
  const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/applications/indexes`;

  try {
    const operation = await authedJsonFetch(endpoint, accessToken, {
      method: "POST",
      body: JSON.stringify({
        queryScope: "COLLECTION",
        fields: [
          { fieldPath: "userId", order: "ASCENDING" },
          { fieldPath: "createdAt", order: "DESCENDING" },
          { fieldPath: "__name__", order: "DESCENDING" },
        ],
      }),
    });

    return {
      status: "created",
      operation: operation?.name || "(unknown operation)",
    };
  } catch (error) {
    const details = error.details?.error?.details || [];
    const alreadyExists =
      error.status === 409 ||
      details.some((item) => String(item?.reason || "").includes("INDEX_ALREADY_EXISTS"));

    if (alreadyExists) {
      return { status: "exists" };
    }

    throw error;
  }
};

const accessToken = await getAccessToken();
const rulesetName = await deployRules(accessToken);
const indexResult = await ensureApplicationsIndex(accessToken);

console.log(`Firestore rules deployed: ${rulesetName}`);
if (indexResult.status === "created") {
  console.log(`Applications index creation started: ${indexResult.operation}`);
} else {
  console.log("Applications index already exists.");
}