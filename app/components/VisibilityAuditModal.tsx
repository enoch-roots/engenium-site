"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./VisibilityAuditModal.css";

/* ═══════════════════════════════════════
   SANITIZATION & VALIDATION
   ═══════════════════════════════════════ */

/** Strip HTML tags, trim, and collapse whitespace */
function sanitize(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")          // strip HTML
    .replace(/[<>"'`;]/g, "")         // strip dangerous chars
    .trim()
    .replace(/\s{2,}/g, " ");         // collapse whitespace
}

/** Sanitize but preserve newlines (for textareas) */
function sanitizeMultiline(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`;]/g, "")
    .trim();
}

/* RFC 5322 simplified — covers real-world addresses without being overly strict */
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/* Accepts bare domains (mybusiness.com) or full URLs (https://mybusiness.com/page) */
const DOMAIN_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:[/?#].*)?$/;
const FULL_URL_RE = /^https?:\/\/.+/;

function isValidEmail(v: string): boolean { return EMAIL_RE.test(v); }

/** Accept bare domains or full URLs — anything that looks like a real web address */
function isValidUrl(v: string): boolean {
  if (FULL_URL_RE.test(v)) {
    const withoutProto = v.replace(/^https?:\/\//, "");
    return DOMAIN_RE.test(withoutProto);
  }
  return DOMAIN_RE.test(v);
}

/** Normalize: if they typed a bare domain, prepend https:// */
function normalizeUrl(v: string): string {
  const trimmed = v.trim();
  if (!trimmed) return "";
  if (FULL_URL_RE.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/* ── Types ── */
interface StepOneData {
  firstName: string;
  email: string;
  website: string;
  noWebsite: boolean;
  noWebsiteInfo: string;
}

interface StepTwoData {
  businessName: string;
  socialUrl: string;
  referralSource: string;
}

interface FieldErrors {
  [key: string]: string | undefined;
}

type FormStep = 1 | 2 | "success";

/* ── Close icon ── */
function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="3" x2="13" y2="13" />
      <line x1="13" y1="3" x2="3" y2="13" />
    </svg>
  );
}

/* ── Check icon (success) ── */
function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,12 9,17 18,6" />
    </svg>
  );
}

/* ── Referral sources ── */
const REFERRAL_OPTIONS = [
  "Google search",
  "Social media",
  "Referral from someone",
  "Online directory",
  "Other",
];

/* ═══════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════ */

interface VisibilityAuditModalProps {
  open: boolean;
  onClose: () => void;
}

export default function VisibilityAuditModal({ open, onClose }: VisibilityAuditModalProps) {
  const [step, setStep] = useState<FormStep>(1);
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ── Step 1 state ── */
  const [stepOne, setStepOne] = useState<StepOneData>({
    firstName: "",
    email: "",
    website: "",
    noWebsite: false,
    noWebsiteInfo: "",
  });

  /* ── Step 2 state ── */
  const [stepTwo, setStepTwo] = useState<StepTwoData>({
    businessName: "",
    socialUrl: "",
    referralSource: "",
  });

  /* ── Error tracking ── */
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* ── Stored email for success screen ── */
  const [submittedEmail, setSubmittedEmail] = useState("");

  /* ── Reset on close ── */
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(1);
        setSubmitting(false);
        setSubmitError("");
        setTouched({});
        setStepOne({ firstName: "", email: "", website: "", noWebsite: false, noWebsiteInfo: "" });
        setStepTwo({ businessName: "", socialUrl: "", referralSource: "" });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* ── Close on Escape ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  /* ── Lock body scroll ── */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  /* ── Focus first field on step change ── */
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
  }, [open, step]);

  /* ═══════════════════════════════════════
     VALIDATION
     ═══════════════════════════════════════ */

  function validateStepOne(): FieldErrors {
    const e: FieldErrors = {};
    const name = sanitize(stepOne.firstName);
    const email = sanitize(stepOne.email);
    const website = sanitize(stepOne.website);

    if (!name) e.firstName = "First name is required";
    else if (name.length > 50) e.firstName = "50 characters max";

    if (!email) e.email = "Email is required";
    else if (!isValidEmail(email)) e.email = "Enter a valid email address";

    if (!stepOne.noWebsite) {
      if (!website) e.website = "Website is required";
      else if (!isValidUrl(website)) e.website = "Enter a valid web address (e.g. mybusiness.com)";
    }

    return e;
  }

  function validateStepTwo(): FieldErrors {
    const e: FieldErrors = {};
    const biz = sanitize(stepTwo.businessName);
    const social = sanitize(stepTwo.socialUrl);

    if (!biz) e.businessName = "Business name is required";
    else if (biz.length > 100) e.businessName = "100 characters max";

    if (social && !isValidUrl(social)) e.socialUrl = "Enter a valid web address (e.g. mybusiness.com)";

    return e;
  }

  const stepOneErrors = validateStepOne();
  const stepTwoErrors = validateStepTwo();
  const stepOneValid = Object.keys(stepOneErrors).length === 0;
  const stepTwoValid = Object.keys(stepTwoErrors).length === 0;

  /** Mark a field as touched on blur so errors only show after interaction */
  function handleBlur(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  /** Show error only if field has been touched */
  function fieldError(field: string, pool: FieldErrors): string | undefined {
    return touched[field] ? pool[field] : undefined;
  }

  /* ═══════════════════════════════════════
     SUBMIT HANDLERS
     ═══════════════════════════════════════ */

  /* ── API helper ── */
  async function submitToApi(payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch("/api/audit-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || "Something went wrong" };
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error — please try again" };
    }
  }

  /* ── Submit error state ── */
  const [submitError, setSubmitError] = useState("");

  function handleStepOneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    /* Touch all step-1 fields to surface remaining errors */
    setTouched((t) => ({ ...t, firstName: true, email: true, website: true }));

    if (!stepOneValid) return;

    /* Sanitize + normalize */
    const clean: StepOneData = {
      firstName: sanitize(stepOne.firstName),
      email: sanitize(stepOne.email),
      website: stepOne.noWebsite ? "" : normalizeUrl(sanitize(stepOne.website)),
      noWebsite: stepOne.noWebsite,
      noWebsiteInfo: sanitizeMultiline(stepOne.noWebsiteInfo).slice(0, 500),
    };

    setSubmitting(true);
    setSubmittedEmail(clean.email);

    submitToApi({ step: 1, data: clean }).then((result) => {
      setSubmitting(false);
      if (result.ok) {
        setTouched({});
        setStep(2);
      } else {
        setSubmitError(result.error || "Something went wrong");
      }
    });
  }

  function handleStepTwoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    setTouched((t) => ({ ...t, businessName: true, socialUrl: true }));

    if (!stepTwoValid) return;

    const clean: StepTwoData = {
      businessName: sanitize(stepTwo.businessName),
      socialUrl: normalizeUrl(sanitize(stepTwo.socialUrl)),
      referralSource: sanitize(stepTwo.referralSource),
    };

    setSubmitting(true);

    submitToApi({ step: 2, data: clean, email: submittedEmail }).then((result) => {
      setSubmitting(false);
      if (result.ok) {
        setStep("success");
      } else {
        setSubmitError(result.error || "Something went wrong");
      }
    });
  }

  function handleSkip() {
    setStep("success");
  }

  /* ── Step indicator ── */
  function StepIndicator() {
    const isStepTwo = step === 2;
    const isDone = step === "success";
    return (
      <div className="vam__steps">
        <div className={`vam__step-dot ${isDone ? "vam__step-dot--done" : step === 1 ? "vam__step-dot--active" : "vam__step-dot--done"}`} />
        <div className={`vam__step-line ${isStepTwo || isDone ? "vam__step-line--done" : ""}`} />
        <div className={`vam__step-dot ${isDone ? "vam__step-dot--done" : isStepTwo ? "vam__step-dot--active" : ""}`} />
      </div>
    );
  }

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */

  return (
    <div className={`vam ${open ? "vam--open" : ""}`} role="dialog" aria-modal="true" aria-label="Free Visibility Audit">
      <div className="vam__backdrop" onClick={onClose} />

      <div className="vam__panel" ref={panelRef}>
        <button className="vam__close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        {/* ── STEP 1: Who are you + where are you online ── */}
        {step === 1 && (
          <div className="vam__step-content" key="step1">
            <StepIndicator />
            <div className="vam__label">Free Visibility Audit</div>
            <h2 className="vam__title">How visible is your business?</h2>
            <p className="vam__subtitle">
              Tell us who you are and where to find you online.
              We&rsquo;ll audit how visible your business is across search, AI, and social.
            </p>

            <form onSubmit={handleStepOneSubmit} noValidate>
              {/* First name */}
              <div className="vam__field">
                <label className="vam__field-label" htmlFor="vam-first-name">First name</label>
                <input
                  id="vam-first-name"
                  className={`vam__input ${fieldError("firstName", stepOneErrors) ? "vam__input--error" : ""}`}
                  type="text"
                  placeholder="First name"
                  autoComplete="given-name"
                  maxLength={50}
                  value={stepOne.firstName}
                  onChange={(e) => setStepOne((s) => ({ ...s, firstName: e.target.value }))}
                  onBlur={() => handleBlur("firstName")}
                />
                {fieldError("firstName", stepOneErrors) && (
                  <span className="vam__error">{fieldError("firstName", stepOneErrors)}</span>
                )}
              </div>

              {/* Email */}
              <div className="vam__field">
                <label className="vam__field-label" htmlFor="vam-email">Email</label>
                <input
                  id="vam-email"
                  className={`vam__input ${fieldError("email", stepOneErrors) ? "vam__input--error" : ""}`}
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  maxLength={254}
                  value={stepOne.email}
                  onChange={(e) => setStepOne((s) => ({ ...s, email: e.target.value }))}
                  onBlur={() => handleBlur("email")}
                />
                {fieldError("email", stepOneErrors) && (
                  <span className="vam__error">{fieldError("email", stepOneErrors)}</span>
                )}
              </div>

              {/* Website */}
              {!stepOne.noWebsite && (
                <div className="vam__field">
                  <label className="vam__field-label" htmlFor="vam-website">Website</label>
                  <input
                    id="vam-website"
                    className={`vam__input ${fieldError("website", stepOneErrors) ? "vam__input--error" : ""}`}
                    type="url"
                    placeholder="yourbusiness.com"
                    autoComplete="url"
                    maxLength={200}
                    value={stepOne.website}
                    onChange={(e) => setStepOne((s) => ({ ...s, website: e.target.value }))}
                    onBlur={() => handleBlur("website")}
                  />
                  {fieldError("website", stepOneErrors) && (
                    <span className="vam__error">{fieldError("website", stepOneErrors)}</span>
                  )}
                </div>
              )}

              {/* No website checkbox */}
              <label className="vam__checkbox-row">
                <input
                  className="vam__checkbox"
                  type="checkbox"
                  checked={stepOne.noWebsite}
                  onChange={(e) =>
                    setStepOne((s) => ({
                      ...s,
                      noWebsite: e.target.checked,
                      website: e.target.checked ? "" : s.website,
                    }))
                  }
                />
                <span className="vam__checkbox-label">I don&rsquo;t have a website yet</span>
              </label>

              {/* No-website context field */}
              {stepOne.noWebsite && (
                <div className="vam__field">
                  <label className="vam__field-label" htmlFor="vam-no-website-info">
                    Where do people find you today?
                  </label>
                  <textarea
                    id="vam-no-website-info"
                    className="vam__input vam__textarea"
                    placeholder="Social media, Google Business listing, word of mouth, etc."
                    maxLength={500}
                    value={stepOne.noWebsiteInfo}
                    onChange={(e) => setStepOne((s) => ({ ...s, noWebsiteInfo: e.target.value }))}
                  />
                </div>
              )}

              {submitError && <div className="vam__submit-error">{submitError}</div>}

              <button
                className={`vam__submit ${stepOneValid && !submitting ? "vam__submit--ready" : ""} ${submitting ? "vam__submit--busy" : ""}`}
                type="submit"
              >
                {submitting ? "Sending\u2026" : "Get my audit"}
                {!submitting && <span className="vam__submit-arrow">&rarr;</span>}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Help us make it specific ── */}
        {step === 2 && (
          <div className="vam__step-content" key="step2">
            <StepIndicator />
            <div className="vam__label">One more thing</div>
            <h2 className="vam__title">Help us make it specific.</h2>
            <p className="vam__subtitle">
              With your business name we can check your listings, citations, and
              AI search mentions. Everything else is optional.
            </p>

            <form onSubmit={handleStepTwoSubmit} noValidate>
              {/* Business name */}
              <div className="vam__field">
                <label className="vam__field-label" htmlFor="vam-biz-name">Business name</label>
                <input
                  id="vam-biz-name"
                  className={`vam__input ${fieldError("businessName", stepTwoErrors) ? "vam__input--error" : ""}`}
                  type="text"
                  placeholder="Acme Design Co."
                  autoComplete="organization"
                  maxLength={100}
                  value={stepTwo.businessName}
                  onChange={(e) => setStepTwo((s) => ({ ...s, businessName: e.target.value }))}
                  onBlur={() => handleBlur("businessName")}
                />
                {fieldError("businessName", stepTwoErrors) && (
                  <span className="vam__error">{fieldError("businessName", stepTwoErrors)}</span>
                )}
              </div>

              {/* Primary social */}
              <div className="vam__field">
                <label className="vam__field-label" htmlFor="vam-social">
                  Primary social profile <span className="vam__optional">optional</span>
                </label>
                <input
                  id="vam-social"
                  className={`vam__input ${fieldError("socialUrl", stepTwoErrors) ? "vam__input--error" : ""}`}
                  type="url"
                  placeholder="instagram.com/yourbusiness"
                  maxLength={200}
                  value={stepTwo.socialUrl}
                  onChange={(e) => setStepTwo((s) => ({ ...s, socialUrl: e.target.value }))}
                  onBlur={() => handleBlur("socialUrl")}
                />
                {fieldError("socialUrl", stepTwoErrors) && (
                  <span className="vam__error">{fieldError("socialUrl", stepTwoErrors)}</span>
                )}
              </div>

              {/* Referral source */}
              <div className="vam__field">
                <label className="vam__field-label" htmlFor="vam-referral">
                  How did you hear about us? <span className="vam__optional">optional</span>
                </label>
                <select
                  id="vam-referral"
                  className="vam__select"
                  value={stepTwo.referralSource}
                  onChange={(e) => setStepTwo((s) => ({ ...s, referralSource: e.target.value }))}
                >
                  <option value="" disabled>Select one</option>
                  {REFERRAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {submitError && <div className="vam__submit-error">{submitError}</div>}

              <button
                className={`vam__submit ${stepTwoValid && !submitting ? "vam__submit--ready" : ""} ${submitting ? "vam__submit--busy" : ""}`}
                type="submit"
              >
                {submitting ? "Sending\u2026" : "Submit details"}
                {!submitting && <span className="vam__submit-arrow">&rarr;</span>}
              </button>
            </form>

            <button className="vam__skip" onClick={handleSkip} type="button">
              Skip &mdash; just send the basic audit
            </button>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === "success" && (
          <div className="vam__step-content" key="success">
            <StepIndicator />
            <div className="vam__success">
              <div className="vam__success-icon">
                <CheckIcon />
              </div>
              <h2 className="vam__success-title">You&rsquo;re in.</h2>
              <p className="vam__success-body">
                We&rsquo;ll send your visibility audit to{" "}
                <span className="vam__success-email">{submittedEmail}</span> within
                48 hours. Keep an eye on your inbox.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
