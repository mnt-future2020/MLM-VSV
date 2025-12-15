# Sponsor KYC Feature – Delivery Plan (VSV Unite MLM)

## 1) Objectives
- Gate user activation behind KYC approval: Register → KYC → Admin approve → Active
- Capture comprehensive KYC: Basic info + DOB + PAN/Aadhaar + Bank + JPEG ID proof (≤ 500KB)
- Support three submitters: user, sponsor (for direct downline), admin
- Enforce constraints server-side (JPEG signature + size) and client-side (preview + limits)
- Provide clean, fast admin review UI (list → view → approve/reject with reason)
- Preserve existing MLM flows (auth, teams, plans) without regressions

## 2) Scope
- In-scope: Data model, endpoints, Next.js pages, validations, status transitions, UX states, testing
- Out-of-scope: External storage (S3), OCR/AI extraction, eKYC vendors, SMS/Email OTP, multi-tenant

## 3) Complexity & POC Decision
- This is CRUD + auth + file upload, no external integrations → POC not required (Level ≤ 2)
- Proceed directly to app development with strong validation and end-to-end testing

## 4) Data Design
- Mongo Collections
  - users (existing): add
    - kycStatus: 'PENDING_KYC' | 'KYC_SUBMITTED' | 'KYC_APPROVED' | 'KYC_REJECTED' | 'ACTIVE'
    - activatedAt: datetime (set on approval)
    - kycSubmissionId?: ObjectId (latest linked submission)
    - isActive: default False for normal users; admin remains True
  - kyc_submissions (new):
    - userId: ObjectId
    - submittedBy: { userId, role: 'user' | 'sponsor' | 'admin' }
    - sponsorId?: referralId or ObjectId (when sponsor submits)
    - form: { name, email, phone, address, sponsorReferralId, dob, idNumber (PAN/Aadhaar), bank: { accountName, accountNumber, ifsc, bankName } }
    - idProofBase64: string (JPEG base64, ≤ 500KB)
    - status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    - remarks?: string
    - createdAt, updatedAt
  - Indexes: kyc_submissions.userId, kyc_submissions.status, users.kycStatus

## 5) API Endpoints (All prefixed with /api)
- POST /kyc/submit  [auth:user]
  - Body: form fields + idProofBase64
  - Validates: JPEG + ≤ 500KB; set users.kycStatus → 'KYC_SUBMITTED', link kycSubmissionId
- POST /kyc/submit-for  [auth:user or admin]
  - Body: targetReferralId, form fields + idProofBase64
  - Only admin OR direct sponsor of target (teams.sponsorId == currentUser.id) can submit
- GET  /kyc/me  [auth:user]
  - Returns current user KYC status + last submission
- GET  /admin/kyc/pending  [auth:admin]
  - Query: search?, page?, pageSize?
- GET  /admin/kyc/{kycId}  [auth:admin]
- POST /admin/kyc/approve  [auth:admin]
  - Body: kycId, remarks?
  - Effects: kyc.status → APPROVED; user.kycStatus → ACTIVE; user.isActive → True; user.activatedAt set
- POST /admin/kyc/reject   [auth:admin]
  - Body: kycId, remarks (required); user.kycStatus → KYC_REJECTED
- Guard rails
  - Only one active submission per user (SUBMITTED). Re-submit allowed only after REJECTED

## 6) Frontend (Next.js 16, Tailwind, shadcn)
- User dashboard
  - KYC banner (data-testid="kyc-banner"): shows status + CTA
  - /dashboard/kyc (data-testid="kyc-form") – comprehensive form + JPEG upload (500KB limit) + preview
  - Clear states: idle/loading/success/error
- Sponsor flow
  - /dashboard/kyc/submit-for (data-testid="kyc-submit-for") – search by referralId (data-testid="referral-search"), load member basic, submit KYC
  - Restrict to direct downline (teams.sponsorId == current user)
- Admin panel
  - /admin/kyc (data-testid="admin-kyc-list") – table: member, referralId, submitter, createdAt, actions
  - /admin/kyc/[id] (data-testid="admin-kyc-detail") – form view, ID preview, approve/reject with remarks
- Client validations
  - JPEG only + ≤ 500KB; red error if violated; disable submit; show byte size

## 7) Permissions & Status Transitions
- Register → users.isActive=False; users.kycStatus='PENDING_KYC'
- Submit → kyc.status='SUBMITTED'; users.kycStatus='KYC_SUBMITTED'
- Approve → kyc.status='APPROVED'; users.isActive=True; users.kycStatus='ACTIVE'; users.activatedAt=now
- Reject → kyc.status='REJECTED'; users.kycStatus='KYC_REJECTED'

## 8) Phase 1 – POC (Skipped)
- Reason: No external integrations; straightforward CRUD + validations

## 9) Phase 2 – App Development (End-to-End)
- Backend
  1) Add kyc_submissions collection + indexes
  2) Add helpers: is_jpeg(bytes), ensure_max_500kb(bytes), parse_base64
  3) Update /auth/register: set isActive=False (except admin), kycStatus='PENDING_KYC'
  4) Implement endpoints listed in Section 5
  5) Extend serialize_doc safety for nested docs
- Frontend
  6) Add KYC routes/pages (user, sponsor, admin) with shadcn UI
  7) Build FileUpload component (data-testid="id-proof-input")
  8) Axios clients wired to REACT_APP_BACKEND_URL + '/api'
  9) Add dashboard banner and navigation entries
  10) Handle all states; show toast notifications
- QA & Testing
  11) ESLint + Ruff checks
  12) End-to-end with testing agent: happy paths + failures

## 10) User Stories (Phase 2)
1. As a new user, I see a KYC banner guiding me to complete KYC before accessing features.
2. As a user, I can submit my KYC with a JPEG ID proof within 500KB and get immediate validation feedback.
3. As a user, I can view my current KYC status and resubmit if previously rejected (with reason shown).
4. As a sponsor, I can search my direct downline by referral ID and submit their KYC on their behalf.
5. As an admin, I can see a list of pending KYC submissions with quick filters and open details.
6. As an admin, I can preview the uploaded JPEG, approve or reject with remarks, and the user activation updates instantly.
7. As a user, after approval I can access all dashboard features (isActive=True) without re-login issues.
8. As an admin, I cannot be blocked by KYC gating and can operate normally.

## 11) Testing Plan
- Backend
  - Register → expect isActive=False, kycStatus=PENDING_KYC
  - Submit KYC (own) → expect KYC_SUBMITTED + one active submission
  - Submit KYC (sponsor) for direct child → expect success; non-child → 403
  - JPEG/size validation: wrong type/oversize → 400 with clear message
  - Approve → user ACTIVE + activatedAt set; Reject → KYC_REJECTED
- Frontend
  - Validate client limits; show error banners; ensure data-testid on interactive elements
  - Admin list/detail: actions work and reflect backend
- Use testing_agent_v3 for e2e flows (skip drag-drop/camera)

## 12) Risks & Mitigations
- Risk: Oversized/invalid images → Mitigate with double validation (client + server)
- Risk: Ambiguous sponsor permissions → Restrict to direct downline; show error if not direct
- Risk: Legacy users without KYC → Migration rule: existing non-admin users remain as-is; KYC gating only for new registrations

## 13) Next Actions (You will see progress live)
- Backend: create KYC schema + endpoints; change register defaults; add validations
- Frontend: build KYC pages/components; wire API; add dashboard status
- Testing: run testing agent end-to-end; fix any issues; ship

## 14) Success Criteria
- All user stories pass via automated tests
- JPEG-only and ≤ 500KB enforced server-side and client-side
- Admin can activate users via KYC approval; users gain access immediately
- No regressions in existing auth, plans, wallets, teams
- Deployed app shows KYC flow end-to-end working