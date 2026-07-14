# Centre Owner Onboarding & Document Handling
### Study Centre Booking Platform — India (Bengaluru-first)

> **Sensitivity Notice:** This document contains processes for handling personally identifiable information (PII) and business documents of centre owners. Access to this document and the systems it describes must be restricted to authorised platform staff only. All processes described here are designed in compliance with India's **Digital Personal Data Protection Act, 2023 (DPDPA)** and **Information Technology Act, 2000**.

---

## Table of Contents

1. [Overview & Principles](#1-overview--principles)
2. [Onboarding Stages](#2-onboarding-stages)
3. [Step-by-Step Owner Journey](#3-step-by-step-owner-journey)
4. [Documents Required](#4-documents-required)
5. [Document Handling & Storage Rules](#5-document-handling--storage-rules)
6. [KYC & Automated Verification](#6-kyc--automated-verification)
7. [Physical Verification Process](#7-physical-verification-process)
8. [Bengaluru-Specific Compliance](#8-bengaluru-specific-compliance)
9. [Verification State Machine](#9-verification-state-machine)
10. [Data Model for Onboarding](#10-data-model-for-onboarding)
11. [Sensitive Data Handling Rules](#11-sensitive-data-handling-rules)
12. [Owner Privacy Rights](#12-owner-privacy-rights)
13. [Staff Access Controls](#13-staff-access-controls)
14. [Incident Response](#14-incident-response)
15. [Onboarding Checklist — Owner-facing](#15-onboarding-checklist--owner-facing)
16. [Onboarding Checklist — Internal Team](#16-onboarding-checklist--internal-team)

---

## 1. Overview & Principles

### Goal
Get a legitimate study centre in Bengaluru onboarded, verified, and live for student bookings — in under 5 working days — while protecting the owner's sensitive documents at every step.

### Core Principles

| Principle | What it means in practice |
|-----------|--------------------------|
| **Minimum collection** | Collect only the documents genuinely needed for verification. Never ask for more than required. |
| **Purpose limitation** | Documents collected for onboarding are used only for verification — never for marketing, profiling, or sharing with third parties. |
| **Data minimisation in storage** | After verification is complete, raw document images are deleted. Only the verification outcome and masked identifiers are retained. |
| **Consent-first** | Owner explicitly consents to document collection before uploading anything. Consent is granular — for each document type. |
| **Transparency** | Owner is told exactly what is being collected, why, how long it is stored, and who can see it. |
| **Security by default** | All documents are encrypted in transit (TLS 1.3) and at rest (AES-256). Access is role-restricted and fully logged. |
| **Right to withdraw** | Owner can withdraw their application and request deletion of all documents at any stage before going live. |

---

## 2. Onboarding Stages

```
STAGE 0 — Expression of Interest
  Owner submits name, phone, centre name, area in Bengaluru
  No documents yet. Zero commitment from either side.
  ↓
STAGE 1 — Account Creation
  Phone OTP verified. Basic profile created.
  Onboarding dashboard unlocked.
  ↓
STAGE 2 — Centre Information
  Centre details filled in — address, photos, hours, seats, shifts, pricing.
  Still no sensitive documents.
  ↓
STAGE 3 — Document Submission
  Owner uploads required documents inside encrypted uploader.
  Explicit consent obtained per document type.
  ↓
STAGE 4 — Automated KYC Verification
  Documents verified via KYC API (Aadhaar OTP, PAN, bank penny-drop).
  24–72 hours. Owner sees live status in dashboard.
  ↓
STAGE 5 — Physical Verification
  Video call or field agent visit. Checklist completed. Evidence stored.
  ↓
STAGE 6 — Admin Review & Approval
  Internal team reviews KYC result + physical verification outcome.
  Final approval or rejection with reason.
  ↓
STAGE 7 — Agreement & Go-Live
  Owner digitally signs the Partner Agreement.
  Admin panel training walkthrough completed.
  Centre page goes LIVE. Verified badge applied.
  ↓
STAGE 8 — Post-Onboarding
  Document images deleted after 30-day retention window.
  Annual re-verification reminder scheduled.
```

---

## 3. Step-by-Step Owner Journey

### Stage 0 — Expression of Interest

Owner reaches out via:
- WhatsApp link shared by you directly (Bengaluru outreach)
- "List your centre" button on the platform website

What they fill in at this stage — only:
- Your name
- Mobile number
- Centre name
- Area in Bengaluru (dropdown: Koramangala, Jayanagar, HSR, Indiranagar, etc.)
- Approximate number of seats

**No documents. No payment. No obligation.**

They receive an OTP to verify their phone. Once verified, they get access to the onboarding dashboard.

---

### Stage 1 — Account Creation

- Phone OTP login creates their `centre_admin` account
- Role is set to `pending_onboarding` — they cannot access the live admin panel yet
- They see a progress bar: 7 steps to go live
- They receive a WhatsApp message: "Welcome to [Platform]. Your onboarding dashboard is ready. Complete your profile to get your centre listed in Bengaluru."

---

### Stage 2 — Centre Information (No Sensitive Data)

Owner fills in their centre details — this is all public-facing information:

```
Section A — Basic Info
  Centre name (as it will appear to students)
  Full address with pin code
  Google Maps link or drop a pin
  Landmark (e.g., "Next to Koramangala BDA complex")
  Contact number for students (can differ from owner's number)

Section B — Photos
  Minimum 3 photos required:
    1. Entrance / exterior
    2. Main hall / seating area
    3. Facilities (AC, power sockets, WiFi router visible)
  Maximum 10 photos
  Each photo must be under 5MB, JPG or PNG

Section C — Operating Hours
  Open days (checkboxes: Mon–Sun)
  Open time and close time
  Closure dates (optional — festivals, maintenance)

Section D — Seat Configuration
  Total seats
  Seat layout (rows × columns, or just numbered)
  Any seats to be blocked permanently (gender zones, staff)

Section E — Shifts & Pricing
  Number of shifts (1, 2, or 3)
  For each shift: name, start time, end time
  Pricing per shift, full day, monthly (if offered)
  Cancellation policy (hours before shift for free cancellation)

Section F — Amenities
  Checkboxes: AC / WiFi / Printing / Lockers / CCTV / Drinking Water /
  Charging Points / Restrooms / Cafeteria nearby
```

**This information is saved in draft. Nothing is public yet.**

---

### Stage 3 — Document Submission

This stage opens only after Stage 2 is complete.

Before the upload screen appears, the owner sees a **consent screen**:

```
─────────────────────────────────────────────────────
  Why we collect your documents

  We collect the following documents to:
  ✓ Verify your identity as the centre owner
  ✓ Confirm the centre exists at the address you provided
  ✓ Set up your payout account for receiving payments

  Your documents are:
  • Encrypted when uploaded (TLS 1.3)
  • Stored in encrypted cloud storage (AES-256)
  • Accessible only to our verification team (2 people)
  • Deleted within 30 days after verification is complete
  • Never shared with third parties or used for marketing

  You have the right to withdraw your application and
  request deletion of your documents at any time before
  your centre goes live.

  [ I understand and agree to proceed ] [ Cancel ]
─────────────────────────────────────────────────────
```

Only after clicking "I understand and agree" does the upload interface appear.

Each document has its own upload slot with:
- What it is and why it is needed (one line explanation)
- Accepted formats (PDF, JPG, PNG)
- Maximum file size (5MB)
- Whether it is required or optional

---

### Stage 4 — Automated KYC (Internal, Owner Sees Status Only)

Owner sees:
```
Document verification in progress
Expected time: 24–72 hours
We will notify you on WhatsApp when complete.

Current status:
  Aadhaar verification     ✅ Complete
  PAN verification         ⏳ In progress
  Bank account check       ⏳ Pending
  Address document check   ⏳ Pending
```

If any document fails:
```
Action needed: Your electricity bill could not be verified.
Reason: Address on bill does not match the centre address you entered.
Please re-upload a bill for the centre's registered address.
[ Re-upload document ]
```

Owner has 3 chances to re-upload a failed document before the application is paused and escalated to manual review.

---

### Stage 5 — Physical Verification

After KYC passes, the owner is contacted within 24 hours to schedule physical verification.

**Bengaluru v1 approach:** Video call verification (see Section 7 for full process).

Owner receives WhatsApp:
```
Your documents have been verified ✅
Next step: A 10-minute video call to verify your centre.
Please click below to schedule a time convenient for you.
[ Schedule Video Call ]
Available slots: Mon–Sat, 10am–6pm IST
```

---

### Stage 6 — Admin Review

Internal team sees a verification dashboard showing:
- KYC result (pass/fail per document)
- Video call notes and checklist
- Any flags or mismatches
- Final decision: Approve / Reject / Request more info

If rejected, owner receives WhatsApp with specific reason and whether they can re-apply.

---

### Stage 7 — Agreement & Go-Live

Owner receives the Partner Agreement digitally. Key terms:
- Platform commission rate
- Payout schedule (weekly, to their verified bank account)
- Content standards (photos must be real, seat count must be accurate)
- Consequences of misrepresentation
- Data handling terms (mirrors what was shown at consent screen)

Owner signs digitally via OTP confirmation on their registered phone.

After signing:
- Admin panel training walkthrough is sent (screen-recorded video + written guide)
- Centre page goes live
- Verified badge applied
- WhatsApp sent: "Your centre is now live on [Platform]! Share this link with your students: [URL]"

---

### Stage 8 — Post-Onboarding

- 30 days after verification: raw document images are deleted from storage. Verification outcome record is retained.
- 12 months after go-live: annual re-verification reminder sent to owner.
- If owner changes address or bank account: re-verification triggered automatically.

---

## 4. Documents Required

### Tier 1 — Identity (Always Required)

| Document | Purpose | Verification Method |
|----------|---------|---------------------|
| Aadhaar card (front + back) | Prove owner's identity | Aadhaar OTP-based eKYC via DigiLocker or Surepass API |
| PAN card | Link identity to tax records | PAN verification API — name must match Aadhaar |

> **Storage rule:** Never store the full 12-digit Aadhaar number. Store only masked form: XXXX XXXX 3456. This is mandated by UIDAI guidelines.

---

### Tier 2 — Business (Required)

| Document | Purpose | Verification Method | Notes |
|----------|---------|---------------------|-------|
| Shop and Establishment Act Licence | Proves business is registered at that address in Karnataka | Manual check against BBMP / BMTF records | Required in Bengaluru under Karnataka Shops and Commercial Establishments Act, 1961 |
| Electricity bill for the premises | Confirms owner/tenant occupies that physical address | Address matching against centre address entered | Must be within last 3 months. Name on bill should match owner or be in business name |
| Lease / rental agreement | If owner does not own the premises | Manual review | Required if electricity bill is not in owner's name |

---

### Tier 3 — Financial (Required for Payouts)

| Document | Purpose | Verification Method |
|----------|---------|---------------------|
| Cancelled cheque or bank passbook front page | Set up Razorpay payout to owner's account | Penny-drop API — sends ₹1 to account, confirms it is active and name matches |
| GST certificate | If applicable (annual turnover > ₹20 lakh) | GST verification API |

> GST is optional for small centre owners below the threshold but recommended — it enables GST-compliant receipts for students and signals legitimacy.

---

### Tier 4 — Optional but Trust-Boosting

| Document | When to Request |
|----------|----------------|
| Udyam (MSME) Registration | If owner has registered as MSME — strong legitimacy signal |
| NOC from building owner | If the centre is in a residential building — reduces neighbour dispute risk |
| CCTV installation proof | Photo of CCTV camera in the hall — student safety signal |

---

### What You Do NOT Ask For

Never request the following — they are unnecessary and create liability:

- Full Aadhaar number in plain text
- Password or PIN of any account
- Personal bank account statements (only cancelled cheque needed)
- Any document not listed above
- Photographs of the owner themselves (Aadhaar has photo — sufficient)

---

## 5. Document Handling & Storage Rules

### Upload Pipeline

```
Owner uploads document in browser
          │
          ▼
File is encrypted client-side before leaving the browser
(using SubtleCrypto API — AES-GCM, 256-bit key)
          │
          ▼
Encrypted file transmitted over TLS 1.3
          │
          ▼
Received by your backend — never stored in plain text
          │
          ▼
Re-encrypted with your server-side key (AES-256)
and stored in Supabase Storage with private bucket policy
(no public URL, no unauthenticated access)
          │
          ▼
File path and encryption metadata stored in
verification_documents table (not the file itself in DB)
          │
          ▼
Sent to KYC API over mTLS (mutual TLS) connection
          │
          ▼
KYC API returns result — document image NOT retained by API
          │
          ▼
Result stored in DB. File retained for 30 days then deleted.
```

### Storage Rules

| Rule | Detail |
|------|--------|
| Bucket type | Private — no public URLs ever generated |
| File naming | UUID-based — never include owner name or PAN in filename |
| Access URL | Signed URLs only, expiring in 15 minutes — generated on-demand for internal reviewers |
| Retention period | 30 days after verification outcome (pass or fail) |
| Deletion | Hard delete from storage + DB record updated with `deleted_at` timestamp |
| Backup | Encrypted backups retained for 7 days only, then auto-purged |
| Geography | Store in `ap-south-1` (Mumbai) AWS / Supabase region — data residency within India |

### What Is Retained After Deletion

After the 30-day retention window and document deletion, the following non-sensitive record is kept permanently for audit:

```json
{
  "centre_id": "uuid",
  "document_type": "aadhaar",
  "verification_status": "verified",
  "verified_at": "2025-06-15T10:30:00Z",
  "masked_identifier": "XXXX XXXX 3456",
  "kyc_reference_id": "KYC-API-REF-12345",
  "deleted_at": "2025-07-15T00:00:00Z"
}
```

Raw images, full Aadhaar numbers, bank details — gone. Outcome record — kept.

---

## 6. KYC & Automated Verification

### Recommended KYC API Provider — India

**Surepass** (surepass.io) — Bengaluru-based, UIDAI-authorised, covers all required checks.

Alternative: **IDfy** (idfy.com) — also UIDAI-authorised, slightly higher cost but better SLA.

### API Calls Required

```
1. Aadhaar OTP eKYC
   Endpoint: POST /api/v1/aadhaar-v2/generate-otp
   Owner enters Aadhaar number → OTP sent to their registered mobile
   Owner enters OTP → identity confirmed
   Response: name, date of birth, masked Aadhaar, address
   Cost: ~₹5–8 per verification

2. PAN Verification
   Endpoint: POST /api/v1/pan/verify
   Input: PAN number + name from Aadhaar
   Response: name match result, PAN status (active/inactive)
   Cost: ~₹2–3 per verification

3. Bank Account Penny Drop
   Endpoint: POST /api/v1/bank-account/verify
   Input: account number + IFSC
   Response: account active, account holder name
   Cost: ~₹3–5 per verification

4. GST Verification (if applicable)
   Endpoint: POST /api/v1/gst/verify
   Input: GSTIN
   Response: business name, registration status, address
   Cost: ~₹1–2 per verification

Total automated KYC cost per owner: ₹11–18
```

### Name Matching Logic

Names across documents are rarely identical (initials, spelling variations). Use fuzzy matching:

```javascript
// Acceptable match threshold: 85% similarity
const similarity = levenshteinSimilarity(
  normalize(aadhaarName),   // "RAJESH KUMAR"
  normalize(panName)        // "R KUMAR" → flag for manual review
);

if (similarity >= 0.85) → auto-pass
if (similarity >= 0.70) → flag for manual review
if (similarity < 0.70)  → fail, request clarification
```

Normalise before comparing: remove salutations (Mr/Mrs/Dr), convert to uppercase, trim whitespace, handle common abbreviations.

### Address Matching Logic

Electricity bill address vs. centre address entered in the form:

```
Must match on:
  ✓ Pin code (exact match required)
  ✓ Street/area name (fuzzy match, 80% threshold)

Tolerated differences:
  ✓ Floor number not on bill
  ✓ Building name abbreviated
  ✓ Minor spelling variation in locality name

Automatic fail:
  ✗ Different pin code
  ✗ Different city
  ✗ Bill is older than 3 months
```

---

## 7. Physical Verification Process

### Bengaluru V1 — Video Call Verification

**Who conducts it:** You (the platform founder) for the first 20 centres. After that, a trained part-time contractor (₹200–300 per call).

**Scheduling:** Owner picks a 30-minute slot via a Calendly link embedded in their dashboard. Available Mon–Sat, 10am–6pm.

**Before the call — owner is asked to prepare:**
- Be physically present at the centre (not at home)
- Have their phone with them
- Ensure the hall is accessible and lights are on
- Have their onboarding application open on another device to cross-reference

**During the call — verification checklist:**

```
PHYSICAL VERIFICATION CHECKLIST — VIDEO CALL

Centre Name: ___________________
Date: ___________ Time: _________
Conducted by: ___________________
Owner Name: ____________________

LOCATION CONFIRMATION
  [ ] Owner is physically at the centre (not a different location)
  [ ] Exterior / entrance visible on camera — matches photo submitted
  [ ] Street or landmark visible — consistent with address entered
  [ ] Google Maps pin matches what is visible

PREMISES CONFIRMATION
  [ ] Main hall visible — seats/desks present
  [ ] Seat count visually consistent with claim (ask to pan the camera slowly)
  [ ] Claimed amenities visible: AC unit [ ] WiFi router [ ] Power sockets [ ]
  [ ] Restroom accessible [ ] (ask owner to point to it)
  [ ] CCTV visible if claimed [ ]
  [ ] Cleanliness and lighting acceptable [ ]

OWNER CONFIRMATION
  [ ] Person on call matches Aadhaar photo (ask them to hold Aadhaar on camera briefly)
  [ ] Owner can answer basic questions about the centre:
        How long have you been operating? ___________
        How many students currently? ___________
        Are students currently managed on WhatsApp / registers? ___________

MISMATCH FLAGS (note any)
  [ ] Seat count appears significantly lower than claimed
  [ ] Address appears different from what was submitted
  [ ] Person on call is not the owner (third party)
  [ ] Centre appears closed / not operational
  [ ] Any other concern: ___________________

OUTCOME
  [ ] PASS — proceed to approval
  [ ] FAIL — reason: ___________________
  [ ] CONDITIONAL PASS — action required: ___________________

Recording consent confirmed: [ ] YES
Recording stored at: [internal link]
```

**Recording:** The call is recorded with the owner's explicit consent (obtained at the start of the call verbally, confirmed in the onboarding dashboard). Recording is stored internally, accessible only to the platform verification team, and deleted after 90 days.

**Cost:** ₹0 direct cost when done by you. ₹200–300 per call when delegated to a contractor.

**Turnaround:** Same day or next day after the scheduled call.

---

### Bengaluru V1 Supplement — Field Agent Visit

For the first 10 centres in Bengaluru, do a field visit in addition to the video call. This builds your ground truth of what a verified centre looks like and creates internal benchmarks.

**Partner agencies for Bengaluru field verification:**
- **IDfy Field Ops** — covers Bengaluru, ₹400–600 per visit, 48-hour turnaround
- **AuthBridge** — covers Bengaluru, ₹350–500 per visit
- **Local option** — hire a freelance auditor from Upwork or LinkedIn for ₹300–400 per visit

**Field agent checklist additions over video call:**
- Geotagged photos taken at the centre (minimum 5)
- Physical count of seats in the hall
- Verification that the entrance signboard name matches the listing
- Agent signs and dates a physical form

---

## 8. Bengaluru-Specific Compliance

### Legal Requirements for Study Centres in Karnataka

Centre owners in Bengaluru must comply with the following. You verify these during onboarding:

| Requirement | Law / Authority | How You Verify |
|------------|----------------|----------------|
| Shop and Establishment Registration | Karnataka Shops and Commercial Establishments Act, 1961 | Document upload + manual check |
| Fire Safety NOC (if > 50 occupants) | Karnataka Fire Force | Ask if applicable based on seat count |
| Building Usage Permission | BBMP (Bruhat Bengaluru Mahanagara Palike) | Electricity bill + lease agreement confirms commercial usage |
| GST Registration (if turnover > ₹20 lakh) | GST Act | GST certificate upload + API verification |

> You are not responsible for ensuring the owner has obtained all licences — that is their legal obligation. Your responsibility is to collect evidence that they have. Add a declaration to the Partner Agreement: *"I confirm that my centre has obtained all licences required to operate under applicable Karnataka and central government law. I accept full legal responsibility for any non-compliance."*

### BBMP Zone Awareness

Bengaluru is divided into 8 zones. Study centres in residential areas (especially Jayanagar, Basavanagudi, Malleshwaram) sometimes operate in mixed-use buildings where commercial activity may require specific permissions. During onboarding:

- Ask if the centre is in a commercial or residential building
- If residential, request NOC from the building owner or housing society
- Flag this to the admin review team for manual assessment

### Language

Owner-facing onboarding screens should be available in both **English and Kannada**. Kannada-speaking centre owners in areas like Rajajinagar, Jayanagar, and Basavanagudi will trust the platform more if they can read it in their language.

The verification checklist and internal documents remain in English for your team.

---

## 9. Verification State Machine

### States

```
pending_submission      Owner account created, form not yet complete
pending_kyc             Documents uploaded, KYC API running
kyc_failed              One or more documents failed automated check
kyc_passed              All documents passed automated check
pending_physical        Waiting for video call / field visit
physical_failed         Physical verification not passed
pending_admin_review    KYC + physical both done, awaiting internal decision
approved                Internal team approved, pending agreement signing
agreement_signed        Partner Agreement signed, training pending
live                    Centre page live and visible to students
suspended               Live centre temporarily taken down (post-live issue)
rejected                Application rejected, owner notified with reason
withdrawn               Owner withdrew their own application
```

### State Transition Rules

```
pending_submission
  → pending_kyc             (owner completes form + uploads docs + consents)

pending_kyc
  → kyc_failed              (any document fails automated check)
  → kyc_passed              (all documents pass)

kyc_failed
  → pending_kyc             (owner re-uploads document, max 3 attempts)
  → rejected                (3 failed attempts, escalated and rejected)

kyc_passed
  → pending_physical        (automatically, video call scheduled)

pending_physical
  → physical_failed         (checklist outcome is FAIL)
  → pending_admin_review    (checklist outcome is PASS or CONDITIONAL PASS)

physical_failed
  → pending_physical        (owner given one chance to reschedule)
  → rejected                (second failure)

pending_admin_review
  → approved                (internal team approves)
  → rejected                (internal team rejects, reason logged)
  → pending_physical        (admin requests re-verification)

approved
  → agreement_signed        (owner digitally signs Partner Agreement)

agreement_signed
  → live                    (training completed, centre page activated)

live
  → suspended               (3+ student complaints, fraud flag, or re-verification trigger)

suspended
  → live                    (issue resolved, re-verified)
  → rejected                (fraud confirmed or owner does not respond in 48 hours)

[any state except live]
  → withdrawn               (owner withdraws application, all documents deleted)
```

---

## 10. Data Model for Onboarding

```sql
-- Onboarding state on the centres table
ALTER TABLE centres
  ADD COLUMN onboarding_status    VARCHAR(30) NOT NULL DEFAULT 'pending_submission'
    CHECK (onboarding_status IN (
      'pending_submission','pending_kyc','kyc_failed','kyc_passed',
      'pending_physical','physical_failed','pending_admin_review',
      'approved','agreement_signed','live','suspended','rejected','withdrawn'
    )),
  ADD COLUMN verified_at          TIMESTAMPTZ,
  ADD COLUMN rejected_at          TIMESTAMPTZ,
  ADD COLUMN rejection_reason     TEXT,           -- internal only, shown to owner in sanitised form
  ADD COLUMN verification_notes   TEXT,           -- internal only, never shown to owner
  ADD COLUMN agreement_signed_at  TIMESTAMPTZ,
  ADD COLUMN goes_live_at         TIMESTAMPTZ;

-- One row per document type per centre
CREATE TABLE verification_documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id           UUID NOT NULL REFERENCES centres(id),
  owner_id            UUID NOT NULL REFERENCES users(id),
  document_type       VARCHAR(50) NOT NULL
                        CHECK (document_type IN (
                          'aadhaar','pan','shop_establishment','electricity_bill',
                          'lease_agreement','cancelled_cheque','gst','udyam','noc_building'
                        )),
  storage_path        TEXT,                       -- encrypted path in Supabase storage
  kyc_reference_id    VARCHAR(100),               -- reference ID from KYC API response
  masked_identifier   VARCHAR(50),               -- e.g. XXXX XXXX 3456 for Aadhaar
  status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','verified','failed','re_upload_required')),
  failure_reason      TEXT,                       -- shown to owner if status = failed
  attempt_count       INTEGER NOT NULL DEFAULT 0, -- max 3 attempts per document
  verified_at         TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ,               -- set when file is deleted from storage
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per physical verification event
CREATE TABLE physical_verifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id           UUID NOT NULL REFERENCES centres(id),
  method              VARCHAR(20) NOT NULL
                        CHECK (method IN ('video_call','field_visit','student_survey')),
  conducted_by        VARCHAR(100) NOT NULL,     -- name of team member or agent
  scheduled_at        TIMESTAMPTZ,
  conducted_at        TIMESTAMPTZ,
  status              VARCHAR(20) NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled','completed','failed','no_show')),
  checklist           JSONB,                     -- completed checklist as JSON
  outcome             VARCHAR(20)
                        CHECK (outcome IN ('pass','fail','conditional_pass')),
  outcome_notes       TEXT,
  recording_url       TEXT,                      -- internal only, encrypted link
  recording_deleted_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consent audit trail
CREATE TABLE onboarding_consents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID NOT NULL REFERENCES users(id),
  consent_type        VARCHAR(50) NOT NULL,      -- 'document_collection', 'recording', 'partner_agreement'
  consented_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address          INET,
  user_agent          TEXT,
  consent_text_version VARCHAR(20) NOT NULL      -- version of the consent text shown (e.g. "v1.2")
);

-- Onboarding state change audit log
CREATE TABLE onboarding_audit_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id           UUID NOT NULL REFERENCES centres(id),
  changed_by          UUID REFERENCES users(id), -- NULL if system-triggered
  from_status         VARCHAR(30),
  to_status           VARCHAR(30) NOT NULL,
  reason              TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_vd_centre       ON verification_documents(centre_id);
CREATE INDEX idx_vd_status       ON verification_documents(status);
CREATE INDEX idx_vd_deleted      ON verification_documents(deleted_at);
CREATE INDEX idx_pv_centre       ON physical_verifications(centre_id);
CREATE INDEX idx_audit_centre    ON onboarding_audit_log(centre_id);
CREATE INDEX idx_consent_owner   ON onboarding_consents(owner_id);
```

---

## 11. Sensitive Data Handling Rules

### The Five Rules — Non-Negotiable

```
RULE 1 — NEVER log sensitive data
  Aadhaar numbers, PAN numbers, bank account numbers must NEVER
  appear in application logs, error logs, or console output.
  Use middleware to scrub these fields before logging.

RULE 2 — NEVER store full Aadhaar number
  Store only the masked form: XXXX XXXX 3456
  This is a legal requirement under UIDAI circular dated 28-05-2024.
  Violation carries penalties under the Aadhaar Act, 2016.

RULE 3 — NEVER email or WhatsApp documents
  Do not send document copies over email or WhatsApp to anyone.
  Signed URLs expire in 15 minutes and are the only access method.
  Internal reviewers access documents through the admin dashboard only.

RULE 4 — DELETE raw documents after 30 days
  Set a cron job to run nightly and delete any document where
  verified_at < NOW() - INTERVAL '30 days' AND deleted_at IS NULL.
  Update deleted_at timestamp. Log the deletion.

RULE 5 — ENCRYPT before storing, DECRYPT only to verify
  Documents are encrypted with a key stored in a secrets manager
  (AWS Secrets Manager or Supabase Vault).
  The encryption key is never stored in the database or in code.
  Key rotation every 90 days.
```

### Encryption Implementation

```javascript
// Environment: Node.js backend

// On document upload
const encryptDocument = async (fileBuffer) => {
  const key = await getKeyFromSecretsManager(); // never hardcoded
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

// On document access (internal reviewer only)
const decryptDocument = async (encryptedBuffer, iv, authTag) => {
  const key = await getKeyFromSecretsManager();
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
};
```

### Logging Scrubber Middleware

```javascript
// middleware/sanitiseLog.js
const SENSITIVE_FIELDS = [
  'aadhaar', 'pan', 'account_number', 'ifsc',
  'bank_account', 'gstin', 'password', 'otp'
];

const sanitiseForLog = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitised = { ...obj };
  for (const field of SENSITIVE_FIELDS) {
    if (sanitised[field]) sanitised[field] = '[REDACTED]';
  }
  return sanitised;
};

// Apply before any logger.info / logger.error call
```

---

## 12. Owner Privacy Rights

Under India's **Digital Personal Data Protection Act, 2023 (DPDPA)**, owners have the following rights. Your platform must honour all of them:

### Right to Access

Owner can request a summary of what data you hold about them at any time.

You provide:
- What documents were submitted and their current status
- The masked identifiers retained (e.g. XXXX XXXX 3456)
- Whether raw documents have been deleted
- The verification outcome and date

You do NOT need to provide:
- Internal verification notes or rejection reasons beyond what was shared
- Details of KYC API providers used

**Response time:** Within 72 hours of request.

### Right to Correction

If the owner believes stored information is incorrect, they can request a correction.

In practice: if their name is misspelled in your system, correct it. Document-level corrections go through re-submission.

### Right to Deletion (Erasure)

**Before going live:** Owner can withdraw their application at any time. All documents are deleted within 48 hours. Account is deleted or anonymised.

**After going live:** Owner can terminate the partnership. Booking records are retained (financial audit trail — you are legally required to retain these for 7 years under the Companies Act and GST Act). Personal documents are deleted. Account is anonymised.

### Right to Withdraw Consent

Owner can withdraw consent for document collection at any time before going live. Application is paused and treated as withdrawn.

### Right to Know About Breaches

If a data breach occurs that affects an owner's personal data, you must notify them within **72 hours** of discovering the breach, under the DPDPA. Notify CERT-In as well if the breach affects more than a threshold number of individuals.

### Grievance Redressal

Designate a **Data Protection Officer (DPO)** contact — even informally at this stage. This is a named person (can be you) reachable at a dedicated email (e.g. privacy@[platform].in) who handles data-related complaints.

Response time for grievances: 30 days.

---

## 13. Staff Access Controls

### Who Can Access What

| Role | What they can see | What they cannot see |
|------|------------------|---------------------|
| `super_admin` (you) | All onboarding records, verification status, masked identifiers, physical verification checklist | Full Aadhaar number, bank account number in plain text |
| `verification_staff` | Document status, KYC result, physical checklist, ability to generate 15-min signed URL to view document | Cannot download documents, cannot see other centres' data |
| `support_staff` | Onboarding status only, can communicate with owner | Cannot see any documents or financial details |
| `centre_admin` (the owner) | Their own onboarding status, their own document upload status | Other centres' data, internal notes, KYC raw response |

### Access Logging

Every access to a document — even a 15-minute signed URL generation — is logged:

```sql
CREATE TABLE document_access_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES verification_documents(id),
  accessed_by     UUID NOT NULL REFERENCES users(id),
  access_type     VARCHAR(20) NOT NULL,   -- 'signed_url_generated', 'kyc_api_sent', 'admin_view'
  ip_address      INET,
  accessed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

No document access happens without a log entry. This is your audit trail if a breach occurs.

### Two-Person Rule for Rejection

Any final rejection of a centre application requires sign-off from two internal team members — not just one. This prevents a single person from arbitrarily blocking a legitimate owner. Log both approvers in `onboarding_audit_log`.

---

## 14. Incident Response

### If a Document Breach Occurs

```
Hour 0    Breach discovered
Hour 1    Access to affected storage bucket/path revoked immediately
Hour 2    Affected owners identified from document_access_log
Hour 4    Internal assessment: what was exposed, to whom, for how long
Hour 24   Affected owners notified via WhatsApp + registered email
Hour 48   Interim security report prepared
Hour 72   CERT-In notification filed if threshold breached (DPDPA requirement)
Day 7     Full post-mortem completed
Day 14    Remediation plan implemented and tested
```

### Owner Notification Template

```
Dear [Name],

We are writing to inform you of an incident that may have affected
the documents you submitted during your centre onboarding on [Platform].

What happened: [brief, plain-language description]
What was affected: [specific document types]
What we have done: [immediate actions taken]
What you should do: [any action required from owner]

We sincerely apologise for this incident. Your data security is our
responsibility and we are taking immediate steps to prevent recurrence.

For any questions, please contact: privacy@[platform].in
or call: [number] (Mon–Sat, 10am–6pm)

[Platform] Data Protection Team
```

---

## 15. Onboarding Checklist — Owner-facing

> This is what you send to the owner on WhatsApp after they express interest. Plain language. No jargon.

```
Hi [Name], welcome to [Platform]!

Here is everything you need to get your study centre
listed and live for students in Bengaluru.

STEP 1 — Create your account (5 minutes)
  Click this link and verify your mobile number with OTP.
  [Link]

STEP 2 — Fill in your centre details (10–15 minutes)
  Centre name, address, photos, operating hours,
  seat layout, shifts, and pricing.
  Tip: Have 3–5 good photos of your centre ready.

STEP 3 — Upload your documents (10 minutes)
  Keep these ready:
  ✓ Aadhaar card (front and back)
  ✓ PAN card
  ✓ Electricity bill for the centre (last 3 months)
  ✓ Shop and Establishment licence (if you have it)
  ✓ Cancelled cheque or bank passbook (for receiving payments)
  ✓ Lease/rental agreement (if the premises is rented)
  ✓ GST certificate (only if your turnover is above ₹20 lakh)

STEP 4 — Document verification (24–72 hours)
  We will automatically verify your documents.
  You will get a WhatsApp update when done.
  No action needed from your side during this step.

STEP 5 — Short video call (10 minutes)
  One of our team members will do a quick video call
  to see your centre. Just a walkthrough on camera.
  You pick the time — available Mon–Sat, 10am–6pm.

STEP 6 — Sign the partner agreement (5 minutes)
  A simple digital agreement. Confirmed with your OTP.

STEP 7 — Your centre goes LIVE 🎉
  We send you a shareable link.
  Share it with your students on WhatsApp.
  Students can start booking immediately.

Total time: 3–5 working days from document submission.

Questions? Reply to this WhatsApp or email: support@[platform].in
```

---

## 16. Onboarding Checklist — Internal Team

> For each new centre application. Complete in order. Do not advance to the next step until the current one is ticked.

```
CENTRE ONBOARDING CHECKLIST — INTERNAL

Centre Name: ___________________________
Owner Name:  ___________________________
Area:        ___________________________  (Bengaluru zone)
Application Date: ______________________
Assigned To: ___________________________

STAGE 0–1 — ACCOUNT & EXPRESSION OF INTEREST
  [ ] Owner WhatsApp message received and logged
  [ ] Account created and phone OTP verified
  [ ] Centre name and area confirmed — not a duplicate listing

STAGE 2 — CENTRE INFORMATION REVIEW
  [ ] Address entered — verified on Google Maps (does it exist?)
  [ ] Photos reviewed — real, not stock images, centre visible
  [ ] Seat count appears consistent with photos (not wildly off)
  [ ] Operating hours are realistic
  [ ] Pricing is within reasonable market range for Bengaluru

STAGE 3 — DOCUMENT UPLOAD
  [ ] Consent obtained and logged in onboarding_consents table
  [ ] All required documents uploaded by owner
  [ ] Files are readable (not blurry, not cut off)

STAGE 4 — AUTOMATED KYC
  [ ] Aadhaar OTP eKYC — result: PASS / FAIL / MANUAL
  [ ] PAN verification — result: PASS / FAIL / MANUAL
  [ ] Name match Aadhaar ↔ PAN — result: PASS / REVIEW
  [ ] Bank penny-drop — result: PASS / FAIL
  [ ] Address match (electricity bill ↔ centre address) — result: PASS / REVIEW
  [ ] GST verification (if applicable) — result: PASS / FAIL / N/A
  [ ] Shop & Establishment licence reviewed — result: VALID / EXPIRED / N/A
  [ ] Overall KYC outcome: PASS / FAIL

  If FAIL: [ ] Owner notified with specific reason and re-upload link

STAGE 5 — PHYSICAL VERIFICATION
  [ ] Video call scheduled — date: _________ time: _________
  [ ] Recording consent obtained on call
  [ ] Checklist completed (see Section 7)
  [ ] Call recording stored at: [link]
  [ ] Outcome: PASS / FAIL / CONDITIONAL

  If field visit (first 10 centres):
  [ ] Agent assigned: ___________________
  [ ] Visit date: _______________________
  [ ] Geotagged photos received: YES / NO
  [ ] Field checklist received: YES / NO
  [ ] Field outcome: PASS / FAIL

STAGE 6 — ADMIN REVIEW
  [ ] KYC result reviewed
  [ ] Physical verification reviewed
  [ ] No red flags identified (name mismatch, address mismatch, owner not present on call)
  [ ] Second reviewer sign-off: ___________________ Date: _______
  [ ] Final decision: APPROVE / REJECT / REQUEST MORE INFO

  If REJECT:
  [ ] Reason documented internally
  [ ] Sanitised reason sent to owner on WhatsApp
  [ ] onboarding_audit_log updated

STAGE 7 — AGREEMENT & GO-LIVE
  [ ] Partner Agreement sent to owner
  [ ] Agreement signed (OTP confirmed) — date: _____________
  [ ] Admin panel training link sent
  [ ] Owner confirmed training completed
  [ ] Centre page activated
  [ ] Verified badge applied
  [ ] Goes-live WhatsApp sent to owner with shareable link
  [ ] goes_live_at timestamp recorded in DB

POST-ONBOARDING
  [ ] 30-day deletion reminder set (in calendar or cron)
  [ ] Annual re-verification reminder scheduled
  [ ] Centre added to weekly monitoring report
```

---

*Document version: 1.0*
*Jurisdiction: India — Bengaluru-first*
*Applicable laws: DPDPA 2023, IT Act 2000, Aadhaar Act 2016, Karnataka Shops and Commercial Establishments Act 1961*
*Internal classification: CONFIDENTIAL — Restricted to platform staff only*
*Last updated: July 2026*
