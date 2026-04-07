import { NextRequest, NextResponse } from "next/server";

/* ═══════════════════════════════════════
   POST /api/audit-submit
   Receives the visibility audit form data,
   validates + sanitizes server-side, then
   creates or updates a contact in GHL.
   ═══════════════════════════════════════ */

/* ── In-memory rate limiter ── */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

// Periodically clean up stale entries to prevent memory leaks
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of ipRequestMap) {
      if (now > entry.resetAt) ipRequestMap.delete(ip);
    }
  }, CLEANUP_INTERVAL).unref?.();
}

const GHL_API = "https://services.leadconnectorhq.com";

/* ── Environment ── */
function getEnv() {
  const token = process.env.GHL_PRIVATE_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!token || !locationId) {
    throw new Error("Missing GHL_PRIVATE_TOKEN or GHL_LOCATION_ID env vars");
  }
  return { token, locationId };
}

/* ── Sanitization (mirrors client-side, but we never trust the client) ── */
function sanitize(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`;]/g, "")
    .trim()
    .replace(/\s{2,}/g, " ");
}

function sanitizeMultiline(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`;]/g, "")
    .trim();
}

/* ── Validation ── */
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const DOMAIN_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:[/?#].*)?$/;

function isValidUrl(v: string): boolean {
  const stripped = v.replace(/^https?:\/\//, "");
  return DOMAIN_RE.test(stripped);
}

function normalizeUrl(v: string): string {
  if (!v) return "";
  if (/^https?:\/\//.test(v)) return v;
  return `https://${v}`;
}

/* ── Payload types ── */
interface StepOnePayload {
  firstName: string;
  email: string;
  website: string;
  noWebsite: boolean;
  noWebsiteInfo: string;
}

interface StepTwoPayload {
  businessName: string;
  socialUrl: string;
  referralSource: string;
}

type AuditPayload =
  | { step: 1; data: StepOnePayload }
  | { step: 2; data: StepTwoPayload; email: string };

/* ── Custom field keys — replace these with your actual GHL field IDs ── */
const CUSTOM_FIELDS = {
  noWebsite: process.env.GHL_CF_NO_WEBSITE || "no_website",
  currentPresence: process.env.GHL_CF_CURRENT_PRESENCE || "current_presence",
  primarySocial: process.env.GHL_CF_PRIMARY_SOCIAL || "primary_social",
  referralSource: process.env.GHL_CF_REFERRAL_SOURCE || "referral_source",
  leadSource: process.env.GHL_CF_LEAD_SOURCE || "lead_source",
};

/* ── GHL API helpers ── */
async function ghlFetch(
  path: string,
  token: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${GHL_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("[GHL API Error]", res.status, body);
    throw new Error(`GHL API ${res.status}: ${JSON.stringify(body)}`);
  }

  return body;
}

/** Search for existing contact by email */
async function findContactByEmail(
  email: string,
  locationId: string,
  token: string
): Promise<string | null> {
  try {
    const result = await ghlFetch(
      `/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(email)}`,
      token
    );
    return result?.contact?.id || null;
  } catch {
    return null;
  }
}

/** Create a new contact */
async function createContact(
  payload: Record<string, unknown>,
  token: string
) {
  return ghlFetch("/contacts/", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Update an existing contact */
async function updateContact(
  contactId: string,
  payload: Record<string, unknown>,
  token: string
) {
  return ghlFetch(`/contacts/${contactId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* ═══════════════════════════════════════
   ROUTE HANDLER
   ═══════════════════════════════════════ */

export async function POST(req: NextRequest) {
  try {
    /* ── Rate limit by IP ── */
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { token, locationId } = getEnv();
    const body = (await req.json()) as AuditPayload;

    /* ── STEP 1: Create or update contact with core info ── */
    if (body.step === 1) {
      const d = body.data;

      /* Validate */
      const firstName = sanitize(d.firstName).slice(0, 50);
      const email = sanitize(d.email).slice(0, 254);
      const noWebsite = Boolean(d.noWebsite);
      const website = noWebsite ? "" : normalizeUrl(sanitize(d.website).slice(0, 200));
      const noWebsiteInfo = sanitizeMultiline(d.noWebsiteInfo).slice(0, 500);

      if (!firstName || !email || !EMAIL_RE.test(email)) {
        return NextResponse.json(
          { error: "Invalid name or email" },
          { status: 400 }
        );
      }

      if (!noWebsite && website && !isValidUrl(website)) {
        return NextResponse.json(
          { error: "Invalid website URL" },
          { status: 400 }
        );
      }

      /* Build GHL payload */
      const contactPayload: Record<string, unknown> = {
        locationId,
        firstName,
        email,
        website: website || undefined,
        tags: ["visibility-audit", "website-lead"],
        source: "Visibility Audit Form",
        customFields: [
          { id: CUSTOM_FIELDS.leadSource, value: "Visibility Audit Form" },
          { id: CUSTOM_FIELDS.noWebsite, value: noWebsite ? "Yes" : "No" },
          ...(noWebsite && noWebsiteInfo
            ? [{ id: CUSTOM_FIELDS.currentPresence, value: noWebsiteInfo }]
            : []),
        ],
      };

      /* Check for existing contact */
      const existingId = await findContactByEmail(email, locationId, token);

      let contact;
      if (existingId) {
        contact = await updateContact(existingId, contactPayload, token);
      } else {
        contact = await createContact(contactPayload, token);
      }

      return NextResponse.json({
        ok: true,
        contactId: contact?.contact?.id || existingId,
      });
    }

    /* ── STEP 2: Enrich existing contact with business details ── */
    if (body.step === 2) {
      const d = body.data;
      const email = sanitize(body.email).slice(0, 254);

      /* Validate */
      const businessName = sanitize(d.businessName).slice(0, 100);
      const socialUrl = normalizeUrl(sanitize(d.socialUrl).slice(0, 200));
      const referralSource = sanitize(d.referralSource).slice(0, 50);

      if (!businessName) {
        return NextResponse.json(
          { error: "Business name is required" },
          { status: 400 }
        );
      }

      if (socialUrl && !isValidUrl(socialUrl)) {
        return NextResponse.json(
          { error: "Invalid social URL" },
          { status: 400 }
        );
      }

      /* Find the contact created in step 1 */
      const contactId = await findContactByEmail(email, locationId, token);

      if (!contactId) {
        return NextResponse.json(
          { error: "Contact not found — complete step 1 first" },
          { status: 404 }
        );
      }

      /* Build enrichment payload */
      const enrichPayload: Record<string, unknown> = {
        companyName: businessName,
        customFields: [
          ...(socialUrl
            ? [{ id: CUSTOM_FIELDS.primarySocial, value: socialUrl }]
            : []),
          ...(referralSource
            ? [{ id: CUSTOM_FIELDS.referralSource, value: referralSource }]
            : []),
        ],
      };

      await updateContact(contactId, enrichPayload, token);

      return NextResponse.json({ ok: true, contactId });
    }

    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  } catch (err) {
    console.error("[audit-submit]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
