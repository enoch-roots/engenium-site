/**
 * One-time setup script: creates the custom fields in GHL
 * for the Visibility Audit form.
 *
 * Usage:
 *   1. Make sure .env.local has GHL_PRIVATE_TOKEN and GHL_LOCATION_ID
 *   2. Run: npx tsx scripts/create-ghl-custom-fields.ts
 *
 * After running, copy the field IDs from the output into your
 * .env.local as GHL_CF_* values.
 */

import { config } from "dotenv";
import { resolve } from "path";

/* Load .env.local from project root */
config({ path: resolve(__dirname, "../.env.local") });

const GHL_API = "https://services.leadconnectorhq.com";
const TOKEN = process.env.GHL_PRIVATE_TOKEN;
const LOCATION_ID = process.env.GHL_LOCATION_ID;

if (!TOKEN || !LOCATION_ID) {
  console.error("Missing GHL_PRIVATE_TOKEN or GHL_LOCATION_ID in .env.local");
  process.exit(1);
}

/* ── Field definitions ── */
interface FieldDef {
  envKey: string;
  name: string;
  dataType: string;
  placeholder?: string;
  options?: string[];
}

const FIELDS: FieldDef[] = [
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

/* ── API helper ── */
async function ghlPost(path: string, body: Record<string, unknown>) {
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

  if (!res.ok) {
    throw new Error(`${res.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

/* ── Main ── */
async function main() {
  console.log("\nCreating GHL custom fields for Visibility Audit form...\n");
  console.log("─".repeat(60));

  const envLines: string[] = [];

  for (const field of FIELDS) {
    try {
      const payload: Record<string, unknown> = {
        name: field.name,
        dataType: field.dataType,
        model: "contact",
        locationId: LOCATION_ID,
      };

      if (field.placeholder) {
        payload.placeholder = field.placeholder;
      }

      if (field.options) {
        payload.options = field.options;
      }

      const result = await ghlPost(
        `/locations/${LOCATION_ID}/customFields`,
        payload
      );

      const fieldKey = result?.customField?.id || result?.id || "UNKNOWN";
      console.log(`  ✓  ${field.name}`);
      console.log(`     ID: ${fieldKey}`);
      console.log(`     Type: ${field.dataType}`);
      if (field.options) console.log(`     Options: ${field.options.join(", ")}`);
      console.log();

      envLines.push(`${field.envKey}=${fieldKey}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);

      /* GHL returns 422 if field already exists */
      if (msg.includes("422") || msg.includes("already exists") || msg.includes("duplicate")) {
        console.log(`  ⊘  ${field.name} — already exists, skipping`);
        console.log(`     (find the ID in GHL: Settings → Custom Fields → ${field.name})`);
        console.log();
        envLines.push(`# ${field.envKey}=  # already exists — grab ID from GHL UI`);
      } else {
        console.error(`  ✗  ${field.name} — FAILED`);
        console.error(`     ${msg}`);
        console.log();
        envLines.push(`# ${field.envKey}=  # FAILED — create manually`);
      }
    }
  }

  console.log("─".repeat(60));
  console.log("\nAdd these to your .env.local:\n");
  console.log(envLines.join("\n"));
  console.log();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
