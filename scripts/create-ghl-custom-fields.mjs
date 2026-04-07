/**
 * One-time setup script: creates the custom fields in GHL
 * for the Visibility Audit form, or fetches IDs of existing ones.
 *
 * Usage:
 *   1. Make sure .env.local has GHL_PRIVATE_TOKEN and GHL_LOCATION_ID
 *   2. Run: node scripts/create-ghl-custom-fields.mjs
 *
 * After running, copy the field IDs from the output into .env.local.
 * No extra dependencies needed — uses Node 18+ built-in fetch.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/* ── Load .env.local manually (no dotenv needed) ── */
function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    console.error("Could not read .env.local — make sure it exists.");
    process.exit(1);
  }
}

loadEnv();

const GHL_API = "https://services.leadconnectorhq.com";
const TOKEN = process.env.GHL_PRIVATE_TOKEN;
const LOCATION_ID = process.env.GHL_LOCATION_ID;

if (!TOKEN || !LOCATION_ID) {
  console.error("\nMissing GHL_PRIVATE_TOKEN or GHL_LOCATION_ID in .env.local\n");
  process.exit(1);
}

/* ── Field definitions ── */
const FIELDS = [
  {
    envKey: "GHL_CF_NO_WEBSITE",
    name: "No Website",
    dataType: "SINGLE_OPTIONS",
    options: ["Yes", "No"],
  },
  {
    envKey: "GHL_CF_CURRENT_PRESENCE",
    name: "Current Presence",
    dataType: "LARGE_TEXT",
    placeholder: "Where people find them today",
  },
  {
    envKey: "GHL_CF_PRIMARY_SOCIAL",
    name: "Primary Social",
    dataType: "TEXT",
    placeholder: "https://instagram.com/business",
  },
  {
    envKey: "GHL_CF_REFERRAL_SOURCE",
    name: "Referral Source",
    dataType: "SINGLE_OPTIONS",
    options: [
      "Google search",
      "Social media",
      "Referral from someone",
      "Online directory",
      "Other",
    ],
  },
  {
    envKey: "GHL_CF_LEAD_SOURCE",
    name: "Lead Source",
    dataType: "TEXT",
    placeholder: "e.g. Visibility Audit Form",
  },
];

/* ── API helpers ── */
async function ghlGet(path) {
  const res = await fetch(`${GHL_API}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function ghlPost(path, body) {
  const res = await fetch(`${GHL_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data)}`);
  return data;
}

/* ── Fetch all existing custom fields ── */
async function getExistingFields() {
  try {
    const result = await ghlGet(
      `/locations/${LOCATION_ID}/customFields?model=contact`
    );
    return result?.customFields || [];
  } catch (err) {
    console.error("  Could not fetch existing fields:", err.message);
    return [];
  }
}

/* ── Main ── */
async function main() {
  console.log("\n  Visibility Audit — GHL Custom Field Setup\n");
  console.log("  " + "─".repeat(56));

  /* First, fetch existing fields so we can match by name */
  console.log("  Fetching existing custom fields...");
  const existing = await getExistingFields();
  console.log(`  Found ${existing.length} existing contact field(s)\n`);

  const envLines = [];

  for (const field of FIELDS) {
    /* Check if it already exists by name */
    const match = existing.find(
      (f) => f.name?.toLowerCase() === field.name.toLowerCase()
    );

    if (match) {
      const id = match.id || match.fieldKey || "UNKNOWN";
      console.log(`    ✓  ${field.name} — found existing`);
      console.log(`       ID: ${id}`);
      console.log();
      envLines.push(`${field.envKey}=${id}`);
      continue;
    }

    /* Doesn't exist yet — create it */
    try {
      const payload = {
        name: field.name,
        dataType: field.dataType,
        model: "contact",
      };

      if (field.placeholder) payload.placeholder = field.placeholder;
      if (field.options) payload.options = field.options;

      const result = await ghlPost(
        `/locations/${LOCATION_ID}/customFields`,
        payload
      );

      const fieldKey = result?.customField?.id || result?.id || "UNKNOWN";
      console.log(`    ✓  ${field.name} — created`);
      console.log(`       ID: ${fieldKey}`);
      console.log();
      envLines.push(`${field.envKey}=${fieldKey}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`    ✗  ${field.name} — FAILED`);
      console.error(`       ${msg}`);
      console.log();
      envLines.push(`# ${field.envKey}=  # FAILED — create manually in GHL UI`);
    }
  }

  console.log("  " + "─".repeat(56));
  console.log("\n  Add these to your .env.local:\n");
  for (const line of envLines) {
    console.log(`    ${line}`);
  }
  console.log();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
