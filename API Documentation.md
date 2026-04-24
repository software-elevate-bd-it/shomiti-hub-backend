# SomiteeHQ REST API Documentation

> **Base URL:** `https://api.somiteehq.com/v1`
> **Version:** 2.0.0
> **Authentication:** Bearer Token (JWT)
> **Last Updated:** 2026-04-16

---

## Table of Contents

1. [Standards & Conventions](#standards--conventions)
2. [Authentication](#-authentication)
3. [Company / Branding](#-company--branding)
4. [Member Registration](#-member-registration)
5. [Members](#-members)
6. [Member Requests](#-member-requests)
7. [Collections (Income)](#-collections-income)
8. [Advanced Collection (Quick Pay)](#-advanced-collection-quick-pay)
9. [Expenses](#-expenses)
10. [Ledger](#-ledger)
11. [Cash Book](#-cash-book)
12. [Bank Accounts](#-bank-accounts)
13. [Payments (Verification)](#-payments-verification)
14. [Reports](#-reports)
15. [SMS](#-sms)
16. [Settings](#-settings)
17. [Somitees (Super Admin)](#-somitees-super-admin)
18. [Platform Analytics (Super Admin)](#-platform-analytics-super-admin)
19. [Subscriptions (Super Admin)](#-subscriptions-super-admin)
20. [FAQ](#-faq)
21. [Notifications](#-notifications)
22. [Activity Log](#-activity-log)
23. [Global Search](#-global-search)
24. [Dashboard](#-dashboard)
25. [Roles & Permissions](#-roles--permissions)
26. [Approvals (Maker-Checker)](#-approvals-maker-checker)
27. [Users (Managed by Main User)](#-users-managed-by-main-user)

---

## Standards & Conventions

### Response Format

All endpoints return a consistent JSON envelope:

#### ✅ Success

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### ❌ Error

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{"field": "email", "message": "Email is required"}]
}
```

### TypeScript Interfaces

```typescript
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  errors: FieldError[];
}

interface FieldError {
  field: string;
  message: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginationParams {
  page?: number; // default: 1
  limit?: number; // default: 10
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### HTTP Status Codes

| Code | Meaning                                     |
| ---- | ------------------------------------------- |
| 200  | OK — Request successful                     |
| 201  | Created — Resource created                  |
| 400  | Bad Request — Validation error              |
| 401  | Unauthorized — Invalid/missing token        |
| 403  | Forbidden — Insufficient permissions        |
| 404  | Not Found — Resource not found              |
| 409  | Conflict — Duplicate resource               |
| 422  | Unprocessable Entity — Business logic error |
| 500  | Internal Server Error                       |

### Request Headers

| Header            | Value              | Required                      |
| ----------------- | ------------------ | ----------------------------- |
| `Content-Type`    | `application/json` | Yes                           |
| `Authorization`   | `Bearer <token>`   | Yes (except public endpoints) |
| `Accept-Language` | `en` \| `bn`       | Optional                      |

### User Roles

| Role          | Description                           |
| ------------- | ------------------------------------- |
| `super_admin` | Platform owner — manages all somitees |
| `main_user`   | Somitee manager — manages one somitee |
| `member`      | Somitee member — limited access       |

---

# 🔐 Authentication

## POST `/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "manager@somitee.com",
  "password": "manager123"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-123",
      "name": "Rahim Uddin",
      "email": "manager@somitee.com",
      "role": "main_user",
      "somiteeId": "s1",
      "somiteeName": "বৃহত্তর মুরাদপুর ব্যবসায়ী সমিতি",
      "profilePhoto": null
    },
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 3600
  }
}
```

**❌ 401 Unauthorized:**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password",
  "errors": []
}
```

---

## POST `/auth/register`

Register a new somitee manager account.

**Request Body:**

```json
{
  "name": "New Manager",
  "email": "new@somitee.com",
  "password": "securePass123",
  "phone": "01700000000",
  "somiteeName": "New Market Somitee"
}
```

**✅ 201 Created:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid-456",
      "name": "New Manager",
      "email": "new@somitee.com",
      "role": "main_user",
      "somiteeId": "s-new",
      "somiteeName": "New Market Somitee"
    },
    "token": "eyJhbGciOi..."
  }
}
```

**❌ 409 Conflict:**

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already registered",
  "errors": [{"field": "email", "message": "This email is already in use"}]
}
```

---

## POST `/auth/forgot-password`

Send password reset link.

**Request Body:**

```json
{
  "email": "manager@somitee.com"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset link sent to your email",
  "data": null
}
```

**❌ 404 Not Found:**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "No account found with this email",
  "errors": []
}
```

---

## POST `/auth/reset-password`

Reset password with token.

**Request Body:**

```json
{
  "token": "reset-token-xyz",
  "newPassword": "newSecurePass123"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successful",
  "data": null
}
```

**❌ 400 Bad Request:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid or expired reset token",
  "errors": [{"field": "token", "message": "Token has expired"}]
}
```

---

## POST `/auth/refresh-token`

Refresh access token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed",
  "data": {
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 3600
  }
}
```

---

## POST `/auth/logout`

Invalidate current session.

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null
}
```

---

## GET `/auth/me`

Get current authenticated user profile.

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved",
  "data": {
    "id": "uuid-123",
    "name": "Rahim Uddin",
    "email": "manager@somitee.com",
    "role": "main_user",
    "phone": "01711111111",
    "profilePhoto": "https://cdn.somiteehq.com/photos/uuid-123.jpg",
    "somiteeId": "s1",
    "somiteeName": "বৃহত্তর মুরাদপুর ব্যবসায়ী সমিতি"
  }
}
```

---

# 🏢 Company / Branding

Dynamic company branding used across the platform: login page, sidebar, forms, PDFs, print, and reports.

## GET `/company/settings`

Get company branding settings. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Company settings retrieved",
  "data": {
    "name": "বৃহত্তর মুরাদপুর ব্যবসায়ী সমিতি",
    "logo": "https://cdn.somiteehq.com/logos/s1.png",
    "address": "মুরাদপুর, চট্টগ্রাম",
    "phone": "01711111111",
    "email": "info@muradpur-somitee.com",
    "signature": "https://cdn.somiteehq.com/signatures/s1.png"
  }
}
```

---

## PUT `/company/settings`

Update company branding. Changes propagate to login page, sidebar, forms, PDFs, and reports. **Role:** `main_user`

**Request Body:**

```json
{
  "name": "বৃহত্তর মুরাদপুর ব্যবসায়ী সমিতি",
  "address": "মুরাদপুর, চট্টগ্রাম",
  "phone": "01711111111",
  "email": "info@muradpur-somitee.com"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Company settings updated",
  "data": {
    "name": "বৃহত্তর মুরাদপুর ব্যবসায়ী সমিতি",
    "logo": "https://cdn.somiteehq.com/logos/s1.png",
    "address": "মুরাদপুর, চট্টগ্রাম",
    "phone": "01711111111",
    "email": "info@muradpur-somitee.com",
    "signature": "https://cdn.somiteehq.com/signatures/s1.png"
  }
}
```

---

## POST `/company/upload-logo`

Upload company logo. **Role:** `main_user`

**Request:** `multipart/form-data` — field: `logo` (jpg/png, max 2MB)

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logo uploaded",
  "data": {
    "logoUrl": "https://cdn.somiteehq.com/logos/s1-v2.png"
  }
}
```

---

## POST `/company/upload-signature`

Upload company signature image. **Role:** `main_user`

**Request:** `multipart/form-data` — field: `signature` (png, max 1MB)

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Signature uploaded",
  "data": {
    "signatureUrl": "https://cdn.somiteehq.com/signatures/s1-v2.png"
  }
}
```

---

# 📋 Member Registration

Two-step registration form with Bangla/English names, NID, address, nominee, image uploads, and digital signature.

## POST `/members/register`

Submit a new member registration. **Role:** `main_user` or public (via `/apply`)

**Request Body:**

```json
{
  "nameBn": "করিম মিয়া",
  "nameEn": "Karim Mia",
  "shopName": "করিম ইলেকট্রনিক্স",
  "fatherName": "আব্দুল করিম",
  "motherName": "ফাতেমা বেগম",
  "mobile": "01712345678",
  "village": "বানানী",
  "wardNo": "5",
  "union": "বানানী",
  "upazila": "গুলশান",
  "district": "ঢাকা",
  "nid": "1234567890123",
  "dob": "1990-05-15",
  "nationality": "বাংলাদেশী",
  "religion": "ইসলাম",
  "bloodGroup": "B+",
  "nomineeName": "রহিমা বেগম",
  "nomineeRelation": "স্ত্রী",
  "nomineeNid": "9876543210123",
  "monthlyFee": 500
}
```

**✅ 201 Created:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration submitted. Pending admin approval.",
  "data": {
    "id": "mr-uuid",
    "memberId": "MEM-ABC123",
    "status": "pending",
    "appliedAt": "2026-04-16T10:00:00Z"
  }
}
```

**❌ 400 Validation Error:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {"field": "nid", "message": "NID must be 10-17 digits"},
    {"field": "mobile", "message": "Valid Bangladesh mobile number required"}
  ]
}
```

---

## POST `/members/register/upload-images`

Upload profile image, NID front/back, and signature for a registration. **Role:** `main_user` or public

**Request:** `multipart/form-data`

| Field            | Type                    | Required |
| ---------------- | ----------------------- | -------- |
| `registrationId` | string                  | Yes      |
| `profileImage`   | File (jpg/png, max 2MB) | Yes      |
| `nidFront`       | File (jpg/png, max 2MB) | Yes      |
| `nidBack`        | File (jpg/png, max 2MB) | Yes      |
| `signature`      | File (png, max 1MB)     | Yes      |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Images uploaded",
  "data": {
    "profileImageUrl": "https://cdn.somiteehq.com/members/profile-uuid.jpg",
    "nidFrontUrl": "https://cdn.somiteehq.com/members/nid-front-uuid.jpg",
    "nidBackUrl": "https://cdn.somiteehq.com/members/nid-back-uuid.jpg",
    "signatureUrl": "https://cdn.somiteehq.com/members/sig-uuid.png"
  }
}
```

---

## POST `/members/register/draft`

Auto-save registration as draft (partial data allowed). **Role:** `main_user` or public

**Request Body:** Same schema as `/members/register` — all fields optional.

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Draft saved",
  "data": {
    "draftId": "draft-uuid",
    "savedAt": "2026-04-16T10:00:00Z"
  }
}
```

---

## GET `/members/register/draft/:draftId`

Retrieve a saved draft. **Role:** `main_user` or public

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Draft retrieved",
  "data": {
    "draftId": "draft-uuid",
    "nameBn": "করিম মিয়া",
    "nameEn": "Karim Mia",
    "shopName": "করিম ইলেকট্রনিক্স",
    "savedAt": "2026-04-16T10:00:00Z"
  }
}
```

---

# 👥 Members

## GET `/members`

List all members with pagination. **Role:** `main_user`

**Query Params:**

| Param       | Type   | Default | Description                 |
| ----------- | ------ | ------- | --------------------------- |
| `page`      | number | 1       | Page number                 |
| `limit`     | number | 10      | Items per page              |
| `search`    | string | —       | Search by name, phone, shop |
| `status`    | string | —       | `active` \| `inactive`      |
| `sortBy`    | string | `name`  | Sort field                  |
| `sortOrder` | string | `asc`   | `asc` \| `desc`             |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Members retrieved",
  "data": [
    {
      "id": "m1",
      "name": "Karim Mia",
      "shopName": "Karim Electronics",
      "phone": "01712345678",
      "address": "Shop 12, Banani Market",
      "nid": "1234567890",
      "photo": "https://cdn.somiteehq.com/members/m1.jpg",
      "status": "active",
      "somiteeId": "s1",
      "joinDate": "2024-01-15",
      "monthlyFee": 500,
      "totalDue": 1000,
      "totalPaid": 5000,
      "billingCycle": "monthly",
      "paymentLink": "https://pay.somiteehq.com/pay-karim-m1"
    }
  ],
  "meta": {"page": 1, "limit": 10, "total": 45, "totalPages": 5}
}
```

---

## GET `/members/:id`

Get single member details. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member retrieved",
  "data": {
    "id": "m1",
    "name": "Karim Mia",
    "shopName": "Karim Electronics",
    "phone": "01712345678",
    "address": "Shop 12, Banani Market",
    "nid": "1234567890",
    "photo": "https://cdn.somiteehq.com/members/m1.jpg",
    "status": "active",
    "somiteeId": "s1",
    "joinDate": "2024-01-15",
    "monthlyFee": 500,
    "totalDue": 1000,
    "totalPaid": 5000,
    "billingCycle": "monthly",
    "paymentLink": "https://pay.somiteehq.com/pay-karim-m1",
    "ledger": [],
    "paymentHistory": [],
    "dueHistory": []
  }
}
```

**❌ 404 Not Found:**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Member not found",
  "errors": []
}
```

---

## POST `/members`

Create a new member. **Role:** `main_user`

**Request Body:**

```json
{
  "name": "New Member",
  "shopName": "New Shop",
  "phone": "01700000000",
  "address": "Shop 25, Banani Market",
  "nid": "1122334455",
  "monthlyFee": 500,
  "billingCycle": "monthly"
}
```

**✅ 201 Created:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Member created successfully",
  "data": {
    "id": "m-new",
    "name": "New Member",
    "shopName": "New Shop",
    "phone": "01700000000",
    "status": "active",
    "somiteeId": "s1",
    "joinDate": "2026-04-16",
    "monthlyFee": 500,
    "totalDue": 0,
    "totalPaid": 0,
    "paymentLink": "https://pay.somiteehq.com/pay-new-m-new",
    "autoGeneratedPassword": "Xk9mQ2pL"
  }
}
```

**❌ 400 Validation Error:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {"field": "name", "message": "Name is required"},
    {"field": "phone", "message": "Phone must be a valid Bangladesh number"}
  ]
}
```

---

## PUT `/members/:id`

Update member details. **Role:** `main_user`

**Request Body:**

```json
{
  "name": "Karim Mia Updated",
  "shopName": "Karim Electronics Pro",
  "phone": "01712345678",
  "monthlyFee": 600,
  "status": "active"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member updated successfully",
  "data": {
    "id": "m1",
    "name": "Karim Mia Updated",
    "shopName": "Karim Electronics Pro",
    "monthlyFee": 600,
    "status": "active"
  }
}
```

---

## DELETE `/members/:id`

Delete a member. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member deleted successfully",
  "data": null
}
```

**❌ 422 Unprocessable:**

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Cannot delete member with pending dues",
  "errors": [{"field": "totalDue", "message": "Member has ৳1000 pending dues"}]
}
```

---

## GET `/members/:id/ledger`

Get member's ledger entries. **Role:** `main_user`, `member`

**Query Params:**

| Param      | Type                | Default |
| ---------- | ------------------- | ------- |
| `page`     | number              | 1       |
| `limit`    | number              | 20      |
| `dateFrom` | string (YYYY-MM-DD) | —       |
| `dateTo`   | string (YYYY-MM-DD) | —       |
| `type`     | string              | —       |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ledger entries retrieved",
  "data": [
    {
      "id": "l1",
      "date": "2024-12-01",
      "description": "Monthly Fee - December 2024",
      "type": "credit",
      "amount": 500,
      "balance": 5000,
      "reference": "t1"
    }
  ],
  "meta": {"page": 1, "limit": 20, "total": 12, "totalPages": 1}
}
```

---

## GET `/members/:id/payment-history`

Get member's payment history. **Role:** `main_user`, `member`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment history retrieved",
  "data": [
    {
      "id": "t1",
      "date": "2024-12-01",
      "amount": 500,
      "method": "cash",
      "status": "approved",
      "category": "Monthly Fee",
      "transactionId": null,
      "receiptUrl": null
    }
  ],
  "meta": {"page": 1, "limit": 10, "total": 5, "totalPages": 1}
}
```

---

## GET `/members/:id/due-history`

Get member's due breakdown by month. **Role:** `main_user`, `member`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Due history retrieved",
  "data": [
    {"month": "2024-12", "fee": 500, "paid": 500, "due": 0, "status": "paid"},
    {"month": "2025-01", "fee": 500, "paid": 0, "due": 500, "status": "unpaid"}
  ],
  "meta": {"page": 1, "limit": 12, "total": 12, "totalPages": 1}
}
```

---

## GET `/members/:id/report`

Download member report as PDF or CSV. **Role:** `main_user`

**Query Params:**

| Param    | Type   | Options      |
| -------- | ------ | ------------ |
| `format` | string | `pdf`, `csv` |

**✅ 200 Success:** Binary file download

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="member-karim-mia-report.pdf"
```

---

## POST `/members/:id/upload-photo`

Upload member profile photo. **Role:** `main_user`

**Request:** `multipart/form-data` — field: `photo` (jpg/png, max 2MB)

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Photo uploaded successfully",
  "data": {
    "photoUrl": "https://cdn.somiteehq.com/members/m1-updated.jpg"
  }
}
```

---

# 📝 Member Requests

## GET `/member-requests`

List membership applications. **Role:** `main_user`

**Query Params:**

| Param    | Type   | Default |
| -------- | ------ | ------- |
| `page`   | number | 1       |
| `limit`  | number | 10      |
| `status` | string | —       |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member requests retrieved",
  "data": [
    {
      "id": "mr1",
      "name": "Habib Rahman",
      "shopName": "Habib Mobile",
      "phone": "01611111111",
      "address": "Shop 30, Banani Market",
      "nid": "5555555555",
      "photo": null,
      "status": "pending",
      "appliedAt": "2025-04-10",
      "somiteeId": "s1"
    }
  ],
  "meta": {"page": 1, "limit": 10, "total": 4, "totalPages": 1}
}
```

---

## PATCH `/member-requests/:id/approve`

Approve a membership request. Creates a member record. **Role:** `main_user`

**Request Body:**

```json
{
  "monthlyFee": 500,
  "billingCycle": "monthly"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member request approved",
  "data": {
    "requestId": "mr1",
    "memberId": "m-new",
    "name": "Habib Rahman",
    "status": "approved",
    "approvedAt": "2026-04-16T10:00:00Z"
  }
}
```

---

## PATCH `/member-requests/:id/reject`

Reject a membership request. **Role:** `main_user`

**Request Body:**

```json
{
  "rejectionNote": "Incomplete documents"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member request rejected",
  "data": {
    "requestId": "mr4",
    "status": "rejected",
    "rejectionNote": "Incomplete documents",
    "rejectedAt": "2026-04-16T10:00:00Z"
  }
}
```

---

## DELETE `/member-requests/:id`

Delete a membership request. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member request deleted",
  "data": null
}
```

---

# 💰 Collections (Income)

## GET `/collections`

List all collections. **Role:** `main_user`

**Query Params:**

| Param      | Type                | Default |
| ---------- | ------------------- | ------- |
| `page`     | number              | 1       |
| `limit`    | number              | 10      |
| `search`   | string              | —       |
| `status`   | string              | —       |
| `method`   | string              | —       |
| `category` | string              | —       |
| `dateFrom` | string (YYYY-MM-DD) | —       |
| `dateTo`   | string (YYYY-MM-DD) | —       |
| `memberId` | string              | —       |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Collections retrieved",
  "data": [
    {
      "id": "t1",
      "memberId": "m1",
      "memberName": "Karim Mia",
      "type": "collection",
      "amount": 500,
      "date": "2024-12-01",
      "category": "Monthly Fee",
      "method": "cash",
      "status": "approved",
      "note": null,
      "transactionId": null,
      "receiptUrl": null,
      "createdAt": "2024-12-01T10:00:00Z",
      "approvedBy": "uuid-123",
      "approvedAt": "2024-12-01T10:05:00Z"
    }
  ],
  "meta": {"page": 1, "limit": 10, "total": 50, "totalPages": 5}
}
```

---

## POST `/collections`

Record a new collection. **Role:** `main_user`, or any user with `collection.create` permission.

Supports two payload modes:

### Mode A — Simple single payment (legacy)

```json
{
  "memberId": "m1",
  "amount": 500,
  "date": "2024-12-01",
  "category": "Monthly Fee",
  "method": "bkash",
  "transactionId": "BK12345",
  "note": "December payment"
}
```

### Mode B — Financial-year multi-month payment ⭐ NEW

Used by the Advanced Collection (Quick Pay) form. The client selects a financial year and one or more months from the month grid, optionally applies discount/late fee, and posts a single collection record covering the whole batch.

```json
{
  "memberId": "m1",
  "financialYear": "2024-2025",
  "months": [7, 8, 9, 10],
  "amount": 2000,
  "lateFee": 0,
  "discount": 100,
  "totalPaid": 1900,
  "date": "2026-04-24",
  "method": "bkash",
  "transactionId": "BK12345",
  "note": "Jul-Oct 2024-25 dues"
}
```

**Field reference:**

| Field           | Type                | Required           | Notes                                                                           |
| --------------- | ------------------- | ------------------ | ------------------------------------------------------------------------------- |
| `memberId`      | string              | ✅                 | Target member                                                                   |
| `amount`        | number              | ✅                 | Subtotal before discount/late fee (months × monthlyFee in mode B)               |
| `date`          | string (YYYY-MM-DD) | ✅                 | Collection date                                                                 |
| `method`        | enum                | ✅                 | `cash` \| `bkash` \| `nagad` \| `bank` \| `sslcommerz`                          |
| `category`      | string              | optional in mode B | E.g. `Monthly Fee`, `Late Fee`, `Custom`                                        |
| `transactionId` | string              | conditional        | Required when method is `bkash` / `nagad` / `bank` / `sslcommerz`               |
| `note`          | string              | optional           | Free-text                                                                       |
| `financialYear` | string              | mode B             | Format `YYYY-YYYY`, e.g. `2024-2025`                                            |
| `months`        | number[]            | mode B             | Array of month numbers `1..12` (somitee fiscal calendar)                        |
| `lateFee`       | number              | optional           | Added on top of `amount`                                                        |
| `discount`      | number              | optional           | Subtracted from `amount + lateFee`                                              |
| `totalPaid`     | number              | optional           | Final paid amount; server should validate against `amount + lateFee - discount` |

**Server-side validation (mode B):**

- Reject if any month in `months` is already paid for `(memberId, financialYear)` → `409 DUPLICATE_PAYMENT`.
- If `totalPaid` is provided, it must equal `amount + (lateFee||0) - (discount||0)` (±1 tolerance).
- Created record has `status: "pending"` when an approval workflow is active for the somitee, otherwise `approved`.

**✅ 201 Created:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Collection recorded successfully",
  "data": {
    "id": "t-new",
    "memberId": "m1",
    "memberName": "Karim Mia",
    "type": "collection",
    "amount": 2000,
    "lateFee": 0,
    "discount": 100,
    "totalPaid": 1900,
    "financialYear": "2024-2025",
    "months": [7, 8, 9, 10],
    "date": "2026-04-24",
    "category": "Monthly Fee",
    "method": "bkash",
    "status": "pending",
    "transactionId": "BK12345",
    "note": "Jul-Oct 2024-25 dues",
    "createdAt": "2026-04-24T10:30:00Z",
    "createdBy": "u-collector-1"
  }
}
```

**❌ 400 Validation Error:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {"field": "memberId", "message": "Member is required"},
    {"field": "amount", "message": "Amount must be greater than 0"},
    {"field": "months", "message": "Select at least one month"},
    {"field": "transactionId", "message": "Transaction ID required for bKash/Nagad/Bank"}
  ]
}
```

**❌ 409 Duplicate Payment:**

```json
{
  "success": false,
  "statusCode": 409,
  "message": "One or more selected months are already paid for this financial year",
  "errors": [{"field": "months", "message": "Already paid: [7, 8]"}]
}
```

---

## PUT `/collections/:id`

Update a collection. **Role:** `main_user`

**Request Body:**

```json
{
  "amount": 600,
  "note": "Updated amount"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Collection updated successfully",
  "data": {"id": "t1", "amount": 600, "note": "Updated amount"}
}
```

---

## DELETE `/collections/:id`

Delete a collection. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Collection deleted successfully",
  "data": null
}
```

---

## PATCH `/collections/:id/status`

Approve or reject a collection. **Role:** `main_user`

**Request Body:**

```json
{
  "status": "approved",
  "note": "Verified via bKash statement"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Collection approved successfully",
  "data": {
    "id": "t3",
    "status": "approved",
    "approvedBy": "uuid-123",
    "approvedAt": "2026-04-16T14:30:00Z"
  }
}
```

---

## POST `/collections/public-pay/:paymentLink`

Public payment endpoint (no auth). Member pays via SSLCommerz.

**Request Body:**

```json
{
  "amount": 500,
  "method": "sslcommerz",
  "month": "2025-01"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment initiated",
  "data": {
    "gatewayUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/api.php?...",
    "sessionKey": "ssl-session-xyz"
  }
}
```

---

## POST `/collections/public-pay/callback`

SSLCommerz IPN callback (server-to-server).

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment confirmed",
  "data": {
    "collectionId": "t-ssl-1",
    "transactionId": "SSL98765",
    "status": "approved"
  }
}
```

---

# ⚡ Advanced Collection (Quick Pay)

Single-screen collection with member search, financial year month grid, and smart calculation.

## POST `/collections/quick-pay`

Record payment for multiple months at once. **Role:** `main_user`

**Request Body:**

```json
{
  "memberId": "m1",
  "financialYear": "2024-2025",
  "months": [12, 1, 2, 3],
  "method": "bkash",
  "transactionId": "BK55555",
  "discount": 100
}
```

**✅ 201 Created:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Payment recorded. SMS confirmation sent.",
  "data": {
    "id": "mp-uuid",
    "memberId": "m1",
    "memberName": "Karim Mia",
    "financialYear": "2024-2025",
    "months": [12, 1, 2, 3],
    "amount": 2000,
    "lateFee": 0,
    "discount": 100,
    "totalPaid": 1900,
    "method": "bkash",
    "transactionId": "BK55555",
    "date": "2026-04-16",
    "status": "approved"
  }
}
```

**❌ 409 Duplicate:**

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Duplicate payment detected",
  "errors": [{"field": "months", "message": "Month 12 of 2024-2025 is already paid for member m1"}]
}
```

---

## GET `/collections/member-status/:memberId`

Get paid/due month grid for a member in a financial year. **Role:** `main_user`

**Query Params:**

| Param           | Type   | Required |
| --------------- | ------ | -------- |
| `financialYear` | string | Yes      |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member payment status retrieved",
  "data": {
    "memberId": "m1",
    "memberName": "Karim Mia",
    "financialYear": "2024-2025",
    "monthlyFee": 500,
    "months": [
      {
        "month": 6,
        "label": "June",
        "labelBn": "জুন",
        "status": "paid",
        "paidDate": "2024-07-01",
        "amount": 500
      },
      {
        "month": 7,
        "label": "July",
        "labelBn": "জুলাই",
        "status": "paid",
        "paidDate": "2024-07-01",
        "amount": 500
      },
      {
        "month": 12,
        "label": "December",
        "labelBn": "ডিসেম্বর",
        "status": "due",
        "paidDate": null,
        "amount": 0
      },
      {
        "month": 1,
        "label": "January",
        "labelBn": "জানুয়ারি",
        "status": "due",
        "paidDate": null,
        "amount": 0
      }
    ],
    "summary": {
      "totalPaid": 3000,
      "totalDue": 3000,
      "paidMonths": 6,
      "dueMonths": 6
    }
  }
}
```

---

# 💸 Expenses

## GET `/expenses`

List all expenses. **Role:** `main_user`

**Query Params:**

| Param       | Type                | Default |
| ----------- | ------------------- | ------- |
| `page`      | number              | 1       |
| `limit`     | number              | 10      |
| `category`  | string              | —       |
| `dateFrom`  | string (YYYY-MM-DD) | —       |
| `dateTo`    | string (YYYY-MM-DD) | —       |
| `amountMin` | number              | —       |
| `amountMax` | number              | —       |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Expenses retrieved",
  "data": [
    {
      "id": "t5",
      "type": "expense",
      "amount": 2000,
      "date": "2024-12-05",
      "category": "Maintenance",
      "method": "bank",
      "status": "approved",
      "note": "Market cleaning",
      "receiptUrl": null,
      "createdAt": "2024-12-05T09:00:00Z"
    }
  ],
  "meta": {"page": 1, "limit": 10, "total": 20, "totalPages": 2}
}
```

---

## POST `/expenses`

Record a new expense. **Role:** `main_user`

**Request Body:**

```json
{
  "amount": 5000,
  "date": "2024-12-10",
  "category": "Electricity",
  "method": "bank",
  "note": "Monthly electricity bill",
  "receipt": null
}
```

**✅ 201 Created:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Expense recorded successfully",
  "data": {
    "id": "t-exp-new",
    "type": "expense",
    "amount": 5000,
    "date": "2024-12-10",
    "category": "Electricity",
    "method": "bank",
    "status": "approved",
    "note": "Monthly electricity bill"
  }
}
```

---

## PUT `/expenses/:id`

Update an expense. **Role:** `main_user`

**Request Body:**

```json
{
  "amount": 2500,
  "note": "Market cleaning - updated"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Expense updated successfully",
  "data": {
    "id": "t5",
    "amount": 2500,
    "category": "Maintenance",
    "note": "Market cleaning - updated"
  }
}
```

---

## DELETE `/expenses/:id`

Delete an expense. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Expense deleted successfully",
  "data": null
}
```

---

## GET `/expenses/categories`

Get all expense categories. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Categories retrieved",
  "data": [
    "Maintenance",
    "Electricity",
    "Water",
    "Security",
    "Cleaning",
    "Repair",
    "Office Supplies",
    "Transport",
    "Other"
  ]
}
```

---

# 📒 Ledger

## GET `/ledger`

Get somitee-wide ledger. **Role:** `main_user`

**Query Params:**

| Param      | Type                | Default |
| ---------- | ------------------- | ------- |
| `page`     | number              | 1       |
| `limit`    | number              | 20      |
| `dateFrom` | string (YYYY-MM-DD) | —       |
| `dateTo`   | string (YYYY-MM-DD) | —       |
| `type`     | string              | —       |
| `memberId` | string              | —       |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ledger entries retrieved",
  "data": [
    {
      "id": "led-1",
      "date": "2024-12-01",
      "description": "Monthly Fee - Karim Mia",
      "type": "income",
      "debit": 0,
      "credit": 500,
      "balance": 500,
      "referenceType": "collection",
      "referenceId": "t1",
      "memberId": "m1",
      "memberName": "Karim Mia"
    }
  ],
  "meta": {"page": 1, "limit": 20, "total": 50, "totalPages": 3}
}
```

---

## GET `/ledger/summary`

Get ledger summary for a date range. **Role:** `main_user`

**Query Params:**

| Param      | Type                |
| ---------- | ------------------- |
| `dateFrom` | string (YYYY-MM-DD) |
| `dateTo`   | string (YYYY-MM-DD) |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ledger summary retrieved",
  "data": {
    "totalIncome": 25000,
    "totalExpense": 7000,
    "netBalance": 18000,
    "openingBalance": 0,
    "closingBalance": 18000,
    "period": {"from": "2024-12-01", "to": "2024-12-31"}
  }
}
```

---

# 📖 Cash Book

## GET `/cashbook`

Get cash book entries. **Role:** `main_user`

**Query Params:**

| Param      | Type                | Default |
| ---------- | ------------------- | ------- |
| `page`     | number              | 1       |
| `limit`    | number              | 20      |
| `dateFrom` | string (YYYY-MM-DD) | —       |
| `dateTo`   | string (YYYY-MM-DD) | —       |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cash book entries retrieved",
  "data": [
    {
      "id": "cb-1",
      "date": "2024-12-01",
      "description": "Cash collection - Karim Mia",
      "cashIn": 500,
      "cashOut": 0,
      "balance": 500,
      "referenceType": "collection",
      "referenceId": "t1"
    }
  ],
  "meta": {"page": 1, "limit": 20, "total": 30, "totalPages": 2}
}
```

---

## GET `/cashbook/summary`

Get cash book summary. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cash book summary retrieved",
  "data": {
    "totalCashIn": 15000,
    "totalCashOut": 5000,
    "cashInHand": 10000,
    "period": {"from": "2024-12-01", "to": "2024-12-31"}
  }
}
```

---

# 🏦 Bank Accounts

## GET `/bank-accounts`

List all bank accounts. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bank accounts retrieved",
  "data": [
    {
      "id": "b1",
      "bankName": "Sonali Bank",
      "accountName": "Banani Market Somitee",
      "accountNumber": "1234-5678-9012",
      "balance": 150000,
      "openingBalance": 50000,
      "somiteeId": "s1",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {"page": 1, "limit": 10, "total": 2, "totalPages": 1}
}
```

---

## POST `/bank-accounts`

Create a new bank account. **Role:** `main_user`

**Request Body:**

```json
{
  "bankName": "Dutch Bangla Bank",
  "accountName": "Banani Somitee Savings",
  "accountNumber": "5555-6666-7777",
  "openingBalance": 10000
}
```

**✅ 201 Created:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Bank account created successfully",
  "data": {
    "id": "b-new",
    "bankName": "Dutch Bangla Bank",
    "accountName": "Banani Somitee Savings",
    "accountNumber": "5555-6666-7777",
    "balance": 10000,
    "openingBalance": 10000,
    "somiteeId": "s1"
  }
}
```

---

## PUT `/bank-accounts/:id`

Update bank account details. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bank account updated successfully",
  "data": {"id": "b1", "bankName": "Sonali Bank", "accountName": "Updated Name"}
}
```

---

## DELETE `/bank-accounts/:id`

Delete a bank account. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bank account deleted successfully",
  "data": null
}
```

**❌ 422 Unprocessable:**

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Cannot delete account with non-zero balance",
  "errors": [{"field": "balance", "message": "Account has ৳150,000 balance"}]
}
```

---

## POST `/bank-accounts/:id/deposit`

Deposit to bank account. **Role:** `main_user`

**Request Body:**

```json
{
  "amount": 25000,
  "date": "2024-12-01",
  "note": "Monthly collection deposit",
  "reference": "DEP-001"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Deposit successful",
  "data": {
    "id": "bt-new",
    "bankAccountId": "b1",
    "type": "deposit",
    "amount": 25000,
    "date": "2024-12-01",
    "note": "Monthly collection deposit",
    "reference": "DEP-001",
    "balanceAfter": 175000
  }
}
```

---

## POST `/bank-accounts/:id/withdraw`

Withdraw from bank account. **Role:** `main_user`

**Request Body:**

```json
{
  "amount": 5000,
  "date": "2024-12-05",
  "note": "Electricity bill payment"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Withdrawal successful",
  "data": {
    "id": "bt-new-2",
    "bankAccountId": "b1",
    "type": "withdraw",
    "amount": 5000,
    "date": "2024-12-05",
    "note": "Electricity bill payment",
    "balanceAfter": 145000
  }
}
```

**❌ 422 Insufficient Balance:**

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Insufficient balance",
  "errors": [{"field": "amount", "message": "Requested ৳200,000 but only ৳150,000 available"}]
}
```

---

## POST `/bank-accounts/:id/transfer`

Transfer between bank accounts. **Role:** `main_user`

**Request Body:**

```json
{
  "toAccountId": "b2",
  "amount": 10000,
  "date": "2024-12-12",
  "note": "Transfer to Islami Bank"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Transfer successful",
  "data": {
    "fromTransaction": {
      "id": "bt-tf-1",
      "bankAccountId": "b1",
      "type": "transfer",
      "amount": 10000,
      "balanceAfter": 140000
    },
    "toTransaction": {
      "id": "bt-tf-2",
      "bankAccountId": "b2",
      "type": "deposit",
      "amount": 10000,
      "balanceAfter": 95000
    }
  }
}
```

---

## GET `/bank-accounts/:id/transactions`

Get bank account transactions (bank ledger). **Role:** `main_user`

**Query Params:**

| Param      | Type                | Default |
| ---------- | ------------------- | ------- |
| `page`     | number              | 1       |
| `limit`    | number              | 20      |
| `type`     | string              | —       |
| `dateFrom` | string (YYYY-MM-DD) | —       |
| `dateTo`   | string (YYYY-MM-DD) | —       |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bank transactions retrieved",
  "data": [
    {
      "id": "bt1",
      "bankAccountId": "b1",
      "type": "deposit",
      "amount": 25000,
      "date": "2024-12-01",
      "note": "Monthly collection deposit",
      "reference": "DEP-001",
      "balanceAfter": 75000
    }
  ],
  "meta": {"page": 1, "limit": 20, "total": 15, "totalPages": 1}
}
```

---

## GET `/bank-accounts/:id/statement`

Download bank statement as PDF. **Role:** `main_user`

**Query Params:**

| Param      | Type                    |
| ---------- | ----------------------- |
| `dateFrom` | string (YYYY-MM-DD)     |
| `dateTo`   | string (YYYY-MM-DD)     |
| `format`   | string (`pdf` \| `csv`) |

**✅ 200 Success:** Binary file download

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="bank-statement-sonali-bank-dec-2024.pdf"
```

---

# 💳 Payments (Verification)

## GET `/payments`

List payments pending verification. **Role:** `main_user`

**Query Params:**

| Param    | Type   | Default   |
| -------- | ------ | --------- |
| `page`   | number | 1         |
| `limit`  | number | 10        |
| `status` | string | `pending` |
| `method` | string | —         |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payments retrieved",
  "data": [
    {
      "id": "t3",
      "memberId": "m3",
      "memberName": "Rina Begum",
      "amount": 500,
      "date": "2024-12-02",
      "method": "nagad",
      "status": "pending",
      "transactionId": "NG67890",
      "category": "Monthly Fee"
    }
  ],
  "meta": {"page": 1, "limit": 10, "total": 5, "totalPages": 1}
}
```

---

## PATCH `/payments/:id/verify`

Approve or reject a payment. **Role:** `main_user`

**Request Body:**

```json
{
  "status": "approved",
  "note": "Verified with Nagad statement"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment approved successfully",
  "data": {
    "id": "t3",
    "status": "approved",
    "verifiedBy": "uuid-123",
    "verifiedAt": "2026-04-16T15:00:00Z",
    "note": "Verified with Nagad statement"
  }
}
```

---

# 📊 Reports

## GET `/reports/income-vs-expense`

Income vs Expense report. **Role:** `main_user`

**Query Params:**

| Param      | Type                                      |
| ---------- | ----------------------------------------- |
| `dateFrom` | string (YYYY-MM-DD)                       |
| `dateTo`   | string (YYYY-MM-DD)                       |
| `groupBy`  | string (`daily` \| `monthly` \| `yearly`) |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Income vs Expense report generated",
  "data": {
    "summary": {"totalIncome": 25000, "totalExpense": 7000, "netProfit": 18000},
    "breakdown": [{"month": "2024-12", "income": 25000, "expense": 7000, "net": 18000}],
    "incomeByCategory": [
      {"category": "Monthly Fee", "amount": 22500},
      {"category": "Late Fee", "amount": 2500}
    ],
    "expenseByCategory": [
      {"category": "Electricity", "amount": 5000},
      {"category": "Maintenance", "amount": 2000}
    ]
  }
}
```

---

## GET `/reports/cash-flow`

Cash flow report. **Role:** `main_user`

**Query Params:**

| Param      | Type                |
| ---------- | ------------------- |
| `dateFrom` | string (YYYY-MM-DD) |
| `dateTo`   | string (YYYY-MM-DD) |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cash flow report generated",
  "data": {
    "openingBalance": 50000,
    "closingBalance": 68000,
    "totalInflow": 25000,
    "totalOutflow": 7000,
    "daily": [
      {"date": "2024-12-01", "inflow": 1500, "outflow": 0, "balance": 51500},
      {"date": "2024-12-05", "inflow": 0, "outflow": 2000, "balance": 49500}
    ]
  }
}
```

---

## GET `/reports/member-dues`

Member due report. **Role:** `main_user`

**Query Params:**

| Param    | Type                                             |
| -------- | ------------------------------------------------ |
| `status` | string (`all` \| `overdue`)                      |
| `sortBy` | string (`totalDue` \| `monthsOverdue` \| `name`) |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member due report generated",
  "data": {
    "totalDue": 3000,
    "membersWithDue": 2,
    "members": [
      {
        "memberId": "m4",
        "name": "Salam Mia",
        "shopName": "Salam Tea Stall",
        "phone": "01612345678",
        "totalDue": 1500,
        "lastPaymentDate": "2024-10-15",
        "monthsOverdue": 3
      }
    ]
  }
}
```

---

## GET `/reports/bank-vs-cash`

Bank vs Cash comparison report. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bank vs Cash report generated",
  "data": {
    "cashInHand": 10000,
    "totalBankBalance": 235000,
    "totalAssets": 245000,
    "bankAccounts": [
      {"bankName": "Sonali Bank", "accountNumber": "1234-5678-9012", "balance": 150000},
      {"bankName": "Islami Bank", "accountNumber": "9876-5432-1098", "balance": 85000}
    ]
  }
}
```

---

## GET `/reports/collection`

Collection report with filters. **Role:** `main_user`

**Query Params:**

| Param      | Type                |
| ---------- | ------------------- |
| `dateFrom` | string (YYYY-MM-DD) |
| `dateTo`   | string (YYYY-MM-DD) |
| `method`   | string              |
| `status`   | string              |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Collection report generated",
  "data": {
    "totalCollected": 25000,
    "totalPending": 1500,
    "byMethod": [
      {"method": "cash", "amount": 10000, "count": 15},
      {"method": "bkash", "amount": 8000, "count": 10},
      {"method": "nagad", "amount": 4000, "count": 5},
      {"method": "bank", "amount": 3000, "count": 3}
    ],
    "byCategory": [
      {"category": "Monthly Fee", "amount": 22500},
      {"category": "Late Fee", "amount": 2500}
    ]
  }
}
```

---

## GET `/reports/export`

Export any report as PDF, CSV, or Excel. **Role:** `main_user`

**Query Params:**

| Param              | Type                | Options                                                                 |
| ------------------ | ------------------- | ----------------------------------------------------------------------- |
| `type`             | string              | `income-expense`, `cash-flow`, `member-dues`, `bank-cash`, `collection` |
| `format`           | string              | `pdf`, `csv`, `excel`                                                   |
| `dateFrom`         | string (YYYY-MM-DD) | —                                                                       |
| `dateTo`           | string (YYYY-MM-DD) | —                                                                       |
| `includeLogo`      | boolean             | `true`                                                                  |
| `includeSignature` | boolean             | `true`                                                                  |

**✅ 200 Success:** Binary file download

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="income-expense-report-dec-2024.pdf"
```

---

# 📱 SMS

## GET `/sms/templates`

List SMS templates. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SMS templates retrieved",
  "data": [
    {
      "id": "sms-t1",
      "name": "Payment Received",
      "body": "Dear {{name}}, your payment of ৳{{amount}} has been received. Thank you! - {{somiteeName}}",
      "variables": ["name", "amount", "somiteeName"],
      "type": "auto"
    },
    {
      "id": "sms-t2",
      "name": "Due Reminder",
      "body": "Dear {{name}}, you have ৳{{due}} pending for {{month}}. Please pay soon. - {{somiteeName}}",
      "variables": ["name", "due", "month", "somiteeName"],
      "type": "auto"
    }
  ]
}
```

---

## POST `/sms/send`

Send SMS using a template to selected members. **Role:** `main_user`

**Request Body:**

```json
{
  "templateId": "sms-t2",
  "recipientType": "selected",
  "memberIds": ["m1", "m4"]
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SMS sent to 2 members",
  "data": {
    "sent": 2,
    "failed": 0,
    "results": [
      {"memberId": "m1", "phone": "01712345678", "status": "sent"},
      {"memberId": "m4", "phone": "01612345678", "status": "sent"}
    ]
  }
}
```

---

## POST `/sms/send-custom`

Send custom SMS message. **Role:** `main_user`

**Request Body:**

```json
{
  "recipientType": "all",
  "message": "Meeting tomorrow at 4 PM. All members please attend."
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SMS sent to 45 members",
  "data": {"sent": 43, "failed": 2, "results": []}
}
```

---

## GET `/sms/history`

Get SMS send history. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SMS history retrieved",
  "data": [
    {
      "id": "sms-h1",
      "date": "2024-12-01T10:00:00Z",
      "template": "Due Reminder",
      "recipients": 5,
      "sent": 5,
      "failed": 0,
      "cost": 2.5
    }
  ],
  "meta": {"page": 1, "limit": 10, "total": 20, "totalPages": 2}
}
```

---

## PUT `/sms/config`

Update SMS gateway configuration. **Role:** `main_user`

**Request Body:**

```json
{
  "provider": "bulksmsbd",
  "apiKey": "your-api-key",
  "senderId": "SomiteeHQ",
  "autoSendOnPayment": true,
  "autoSendDueReminder": true,
  "reminderDayOfMonth": 5
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SMS configuration updated",
  "data": {
    "provider": "bulksmsbd",
    "senderId": "SomiteeHQ",
    "autoSendOnPayment": true,
    "autoSendDueReminder": true,
    "reminderDayOfMonth": 5
  }
}
```

---

# ⚙️ Settings

## GET `/settings/profile`

Get user profile. **Role:** `all`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved",
  "data": {
    "id": "uuid-123",
    "name": "Rahim Uddin",
    "email": "manager@somitee.com",
    "phone": "01711111111",
    "profilePhoto": "https://cdn.somiteehq.com/photos/uuid-123.jpg"
  }
}
```

---

## PUT `/settings/profile`

Update user profile. **Role:** `all`

**Request Body:**

```json
{
  "name": "Rahim Uddin Updated",
  "phone": "01711111112"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {"id": "uuid-123", "name": "Rahim Uddin Updated", "phone": "01711111112"}
}
```

---

## PUT `/settings/password`

Change password. **Role:** `all`

**Request Body:**

```json
{
  "currentPassword": "manager123",
  "newPassword": "newSecure456"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully",
  "data": null
}
```

**❌ 400 Wrong Password:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Current password is incorrect",
  "errors": [{"field": "currentPassword", "message": "Password does not match"}]
}
```

---

## GET `/settings/print-template`

Get print layout template. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Print template retrieved",
  "data": {
    "showLogo": true,
    "showCompanyName": true,
    "showSignature": true,
    "showFooterNotes": true,
    "footerNotes": "This is a computer-generated document",
    "marginTop": 20,
    "marginBottom": 20,
    "marginLeft": 15,
    "marginRight": 15,
    "paperSize": "A4",
    "orientation": "portrait"
  }
}
```

---

## PUT `/settings/print-template`

Update print layout template. **Role:** `main_user`

**Request Body:**

```json
{
  "showLogo": true,
  "showSignature": false,
  "marginTop": 25
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Print template updated successfully",
  "data": {"showLogo": true, "showSignature": false, "marginTop": 25}
}
```

---

# 🏢 Somitees (Super Admin)

## GET `/admin/somitees`

List all somitees. **Role:** `super_admin`

**Query Params:**

| Param    | Type   | Default |
| -------- | ------ | ------- |
| `page`   | number | 1       |
| `limit`  | number | 10      |
| `search` | string | —       |
| `status` | string | —       |
| `plan`   | string | —       |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Somitees retrieved",
  "data": [
    {
      "id": "s1",
      "name": "বৃহত্তর মুরাদপুর ব্যবসায়ী সমিতি",
      "managerName": "Rahim Uddin",
      "email": "rahim@muradpur.com",
      "phone": "01711111111",
      "totalMembers": 45,
      "status": "active",
      "plan": "premium",
      "createdAt": "2024-01-01",
      "monthlyRevenue": 22500,
      "lastActivity": "2026-04-16T18:00:00Z"
    }
  ],
  "meta": {"page": 1, "limit": 10, "total": 4, "totalPages": 1}
}
```

---

## GET `/admin/somitees/:id`

Get somitee details. **Role:** `super_admin`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Somitee details retrieved",
  "data": {
    "id": "s1",
    "name": "বৃহত্তর মুরাদপুর ব্যবসায়ী সমিতি",
    "managerName": "Rahim Uddin",
    "email": "rahim@muradpur.com",
    "phone": "01711111111",
    "totalMembers": 45,
    "status": "active",
    "plan": "premium",
    "createdAt": "2024-01-01",
    "stats": {
      "totalCollections": 250000,
      "totalExpenses": 70000,
      "bankBalance": 235000,
      "cashInHand": 10000
    }
  }
}
```

---

## POST `/admin/somitees`

Create a new somitee. **Role:** `super_admin`

**Request Body:**

```json
{
  "name": "New Market Somitee",
  "managerName": "Manager Name",
  "email": "manager@new.com",
  "phone": "01700000000",
  "plan": "basic"
}
```

**✅ 201 Created:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Somitee created successfully",
  "data": {"id": "s-new", "name": "New Market Somitee", "status": "active", "plan": "basic"}
}
```

---

## PUT `/admin/somitees/:id`

Update somitee. **Role:** `super_admin`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Somitee updated successfully",
  "data": {"id": "s1", "name": "Updated Somitee Name"}
}
```

---

## PATCH `/admin/somitees/:id/status`

Block/unblock a somitee. **Role:** `super_admin`

**Request Body:**

```json
{
  "status": "blocked",
  "reason": "Subscription expired"
}
```

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Somitee blocked successfully",
  "data": {
    "id": "s3",
    "status": "blocked",
    "blockedAt": "2026-04-16T16:00:00Z",
    "reason": "Subscription expired"
  }
}
```

---

## DELETE `/admin/somitees/:id`

Delete a somitee. **Role:** `super_admin`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Somitee deleted successfully",
  "data": null
}
```

---

# 📈 Platform Analytics (Super Admin)

## GET `/admin/analytics/overview`

Platform overview stats. **Role:** `super_admin`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Analytics overview retrieved",
  "data": {
    "totalSomitees": 4,
    "activeSomitees": 3,
    "totalMembers": 165,
    "totalTransactions": 450000,
    "platformRevenue": 25000,
    "growth": {
      "somitees": "+2 this month",
      "members": "+12 this month",
      "revenue": "+8%"
    }
  }
}
```

---

## GET `/admin/analytics/revenue`

Platform revenue analytics. **Role:** `super_admin`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Revenue analytics retrieved",
  "data": {
    "totalRevenue": 150000,
    "monthly": [
      {"month": "2024-07", "revenue": 15000},
      {"month": "2024-08", "revenue": 18000}
    ],
    "byPlan": [
      {"plan": "premium", "somitees": 2, "revenue": 20000},
      {"plan": "basic", "somitees": 1, "revenue": 5000},
      {"plan": "free", "somitees": 1, "revenue": 0}
    ]
  }
}
```

---

# 💳 Subscriptions (Super Admin)

## GET `/admin/subscriptions/plans`

List subscription plans. **Role:** `super_admin`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Plans retrieved",
  "data": [
    {
      "id": "plan-free",
      "name": "Free",
      "price": 0,
      "maxMembers": 10,
      "features": ["Basic accounting", "5 SMS/month"],
      "status": "active"
    },
    {
      "id": "plan-basic",
      "name": "Basic",
      "price": 500,
      "maxMembers": 50,
      "features": ["Full accounting", "50 SMS/month", "Reports"],
      "status": "active"
    },
    {
      "id": "plan-premium",
      "name": "Premium",
      "price": 1500,
      "maxMembers": -1,
      "features": ["Unlimited members", "Unlimited SMS", "All reports", "Priority support"],
      "status": "active"
    }
  ]
}
```

---

# ❓ FAQ

## GET `/faq`

List FAQs. **Role:** `all`

**Query Params:**

| Param      | Type   |
| ---------- | ------ |
| `category` | string |
| `search`   | string |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "FAQs retrieved",
  "data": [
    {
      "id": "f1",
      "question": "How do I add a new member?",
      "answer": "Go to Member Registration and fill in the two-step form.",
      "category": "Members"
    }
  ],
  "meta": {"page": 1, "limit": 20, "total": 5, "totalPages": 1}
}
```

---

## POST `/faq`

Create FAQ. **Role:** `super_admin`, `main_user`

**Request Body:**

```json
{
  "question": "How to export reports?",
  "answer": "Go to Reports, select type, apply filters, click Export button.",
  "category": "Reports"
}
```

**✅ 201 Created:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "FAQ created successfully",
  "data": {
    "id": "f-new",
    "question": "How to export reports?",
    "answer": "Go to Reports, select type, apply filters, click Export button.",
    "category": "Reports"
  }
}
```

---

## PUT `/faq/:id`

Update FAQ. **Role:** `super_admin`, `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "FAQ updated successfully",
  "data": {"id": "f1", "question": "How do I add a new member?", "answer": "Updated answer."}
}
```

---

## DELETE `/faq/:id`

Delete FAQ. **Role:** `super_admin`, `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "FAQ deleted successfully",
  "data": null
}
```

---

# 🔔 Notifications

## GET `/notifications`

Get user notifications. **Role:** `all`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notifications retrieved",
  "data": [
    {
      "id": "n1",
      "type": "payment_received",
      "title": "Payment Received",
      "message": "Karim Mia paid ৳500 via bKash",
      "read": false,
      "createdAt": "2026-04-16T10:00:00Z",
      "actionUrl": "/collections"
    }
  ],
  "meta": {"page": 1, "limit": 20, "total": 3, "totalPages": 1}
}
```

---

## PATCH `/notifications/:id/read`

Mark notification as read. **Role:** `all`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification marked as read",
  "data": {"id": "n1", "read": true}
}
```

---

## PATCH `/notifications/read-all`

Mark all notifications as read. **Role:** `all`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "All notifications marked as read",
  "data": {"updated": 3}
}
```

---

# 📝 Activity Log

## GET `/activity-log`

Get activity log. **Role:** `main_user`, `super_admin`

**Query Params:**

| Param      | Type                | Default |
| ---------- | ------------------- | ------- |
| `page`     | number              | 1       |
| `limit`    | number              | 20      |
| `action`   | string              | —       |
| `userId`   | string              | —       |
| `dateFrom` | string (YYYY-MM-DD) | —       |
| `dateTo`   | string (YYYY-MM-DD) | —       |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Activity log retrieved",
  "data": [
    {
      "id": "act-1",
      "userId": "uuid-123",
      "userName": "Rahim Uddin",
      "action": "member.create",
      "description": "Created member Karim Mia",
      "metadata": {"memberId": "m1"},
      "ipAddress": "103.12.45.67",
      "createdAt": "2026-04-16T10:30:00Z"
    }
  ],
  "meta": {"page": 1, "limit": 20, "total": 100, "totalPages": 5}
}
```

---

# 🔍 Global Search

## GET `/search`

Global search across all entities. **Role:** `main_user`

**Query Params:**

| Param   | Type              |
| ------- | ----------------- |
| `q`     | string (required) |
| `limit` | number            |

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Search results",
  "data": {
    "members": [
      {"id": "m1", "name": "Karim Mia", "shopName": "Karim Electronics", "phone": "01712345678"}
    ],
    "transactions": [
      {"id": "t2", "memberName": "Jamal Hossain", "amount": 500, "transactionId": "BK12345"}
    ],
    "bankAccounts": []
  }
}
```

---

# 🌐 Dashboard

## GET `/dashboard/stats`

Get dashboard statistics. **Role:** `main_user`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard stats retrieved",
  "data": {
    "todayCollection": 2500,
    "pendingDue": 3000,
    "totalBankBalance": 235000,
    "cashInHand": 10000,
    "totalMembers": 45,
    "activeMembers": 41,
    "monthlyIncome": 25000,
    "monthlyExpense": 7000,
    "pendingPayments": 5,
    "recentTransactions": []
  }
}
```

---

## GET `/dashboard/member-stats`

Get member dashboard stats. **Role:** `member`

**✅ 200 Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member dashboard stats retrieved",
  "data": {
    "totalPaid": 5000,
    "totalDue": 1000,
    "lastPaymentDate": "2024-12-01",
    "lastPaymentAmount": 500,
    "monthlyFee": 500,
    "paymentLink": "https://pay.somiteehq.com/pay-karim-m1",
    "recentPayments": []
  }
}
```

---

## 🛡️ Roles & Permissions

Dynamic role system. Main user creates custom roles, assigns granular permissions, and links roles to users. All permissions are namespaced as `<module>.<action>`.

### Available Permission Keys

| Key                  | Description                                    |
| -------------------- | ---------------------------------------------- |
| `collection.create`  | Submit new collection (goes to approval queue) |
| `collection.approve` | Approve/reject pending collections             |
| `expense.create`     | Submit new expense                             |
| `expense.approve`    | Approve/reject pending expenses                |
| `bank.create`        | Submit bank deposit/withdraw/transfer          |
| `bank.approve`       | Approve/reject bank transactions               |
| `member.create`      | Register new members                           |
| `member.approve`     | Approve member applications                    |
| `reports.view`       | View financial reports                         |
| `settings.manage`    | Modify company settings                        |
| `roles.manage`       | Manage roles & assignments                     |

### Preset Roles (seeded)

- `Collector` — `[collection.create]`
- `Accountant` — `[collection.create, expense.create, bank.create, reports.view]`
- `Approver` — `[collection.approve, expense.approve, bank.approve, member.approve, reports.view]`
- `Viewer` — `[reports.view]`

---

## GET `/roles`

List all roles (preset + custom).

**Headers:** `Authorization: Bearer {token}`

**Response 200**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Roles retrieved",
  "data": [
    {
      "id": "role-collector",
      "name": "Collector",
      "description": "Can record collections, requires approval",
      "permissions": ["collection.create"],
      "isPreset": true,
      "createdAt": "2026-04-18T10:00:00Z"
    }
  ]
}
```

---

## POST `/roles`

Create a custom role. Requires `roles.manage`.

**Body**

```json
{
  "name": "Cashier",
  "description": "Handles daily cash collection",
  "permissions": ["collection.create", "expense.create"]
}
```

**Response 201**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Role created",
  "data": {
    "id": "role-1745000000000",
    "name": "Cashier",
    "permissions": ["collection.create", "expense.create"],
    "isPreset": false,
    "createdAt": "2026-04-18T10:00:00Z"
  }
}
```

**Errors**

- `400` — name missing OR permissions empty
- `409` — role name already exists

---

## PUT `/roles/:id`

Update a custom role. Preset roles cannot be renamed but their permissions can be modified.

**Response 200**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Role updated",
  "data": {"id": "role-1745000000000"}
}
```

---

## DELETE `/roles/:id`

Delete a custom role. Preset roles return `403`. Cascades — all assignments to this role are removed.

**Response 200**

```json
{"success": true, "statusCode": 200, "message": "Role deleted"}
```

---

## POST `/roles/assign`

Assign a role to a user.

**Body**

```json
{"userId": "user-123", "userName": "Karim Mia", "roleId": "role-collector"}
```

**Response 201**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Role assigned",
  "data": {"userId": "user-123", "roleId": "role-collector", "assignedAt": "2026-04-18T10:00:00Z"}
}
```

---

## DELETE `/roles/assign`

Remove a role from a user.

**Body**

```json
{"userId": "user-123", "roleId": "role-collector"}
```

---

## GET `/roles/assignments`

List all role assignments. Query: `?userId=user-123` (optional).

**Response 200**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Assignments retrieved",
  "data": [
    {
      "userId": "user-123",
      "userName": "Karim Mia",
      "roleId": "role-collector",
      "roleName": "Collector",
      "assignedAt": "2026-04-18T10:00:00Z"
    }
  ]
}
```

---

## GET `/roles/me/permissions`

Get effective permissions for the authenticated user (union of all assigned roles).

**Response 200**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Permissions retrieved",
  "data": {
    "userId": "user-123",
    "permissions": ["collection.create", "expense.create"],
    "roles": ["Collector", "Accountant"]
  }
}
```

---

## ✅ Approvals (Maker-Checker)

Every financial transaction (collection, expense, bank, member) flows through this queue. **Maker** (creator) submits → **Checker** (approver) approves or rejects with a mandatory note.

### Approval Lifecycle

```
[draft] → POST /approvals → [pending] → PATCH /approvals/:id/approve → [approved]
                                     ↘  PATCH /approvals/:id/reject  → [rejected + note]
```

### Approval Types

| Type         | Submit Permission   | Approve Permission   |
| ------------ | ------------------- | -------------------- |
| `collection` | `collection.create` | `collection.approve` |
| `expense`    | `expense.create`    | `expense.approve`    |
| `bank`       | `bank.create`       | `bank.approve`       |
| `member`     | `member.create`     | `member.approve`     |

---

## POST `/approvals`

Submit a new item for approval.

**Body**

```json
{
  "type": "expense",
  "title": "Office Rent",
  "amount": 5000,
  "description": "April 2026 rent payment",
  "payload": {
    "category": "Office Rent",
    "method": "bank",
    "date": "2026-04-18",
    "note": "Paid via DBBL"
  }
}
```

**Response 201**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Submitted for approval",
  "data": {
    "id": "apr-1745000000-x7k2p",
    "type": "expense",
    "title": "Office Rent",
    "amount": 5000,
    "status": "pending",
    "createdBy": "user-123",
    "createdByName": "Karim Mia",
    "createdAt": "2026-04-18T10:00:00Z"
  }
}
```

**Errors**

- `400` — invalid type or missing title
- `403` — user lacks `<type>.create` permission

---

## GET `/approvals`

List approval items with filtering.

**Query Parameters**
| Param | Values | Default |
|-------|--------|---------|
| `status` | `pending` \| `approved` \| `rejected` \| `all` | `pending` |
| `type` | `collection` \| `expense` \| `bank` \| `member` \| `all` | `all` |
| `createdBy` | userId | — |
| `page` | number | 1 |
| `limit` | number | 20 |

**Response 200**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Approvals retrieved",
  "data": [
    {
      "id": "apr-1745000000-x7k2p",
      "type": "expense",
      "title": "Office Rent",
      "amount": 5000,
      "status": "pending",
      "createdBy": "user-123",
      "createdByName": "Karim Mia",
      "createdAt": "2026-04-18T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "counts": {"pending": 5, "approved": 42, "rejected": 3}
  }
}
```

---

## GET `/approvals/:id`

Get full details of an approval item including original payload.

---

## PATCH `/approvals/:id/approve`

Approve a pending item. Requires `<type>.approve` permission. On approval, the underlying record (expense/collection/etc.) is created in its module table.

**Response 200**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Approved",
  "data": {
    "id": "apr-1745000000-x7k2p",
    "status": "approved",
    "reviewedBy": "user-456",
    "reviewedByName": "Rahim Uddin",
    "reviewedAt": "2026-04-18T11:00:00Z",
    "createdRecordId": "exp-9912"
  }
}
```

**Errors**

- `403` — lacks `<type>.approve` permission
- `409` — item is not in `pending` status

---

## PATCH `/approvals/:id/reject`

Reject a pending item. **Note is required.**

**Body**

```json
{"note": "Receipt not attached. Please re-submit with proof."}
```

**Response 200**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rejected",
  "data": {
    "id": "apr-1745000000-x7k2p",
    "status": "rejected",
    "reviewedBy": "user-456",
    "reviewedByName": "Rahim Uddin",
    "reviewedAt": "2026-04-18T11:00:00Z",
    "rejectionNote": "Receipt not attached. Please re-submit with proof."
  }
}
```

**Errors**

- `400` — `note` field empty
- `403` — lacks `<type>.approve` permission
- `409` — item is not in `pending` status

---

## GET `/approvals/stats`

Get pending counts for dashboard badges.

**Response 200**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Stats retrieved",
  "data": {
    "totalPending": 5,
    "byType": {
      "collection": 2,
      "expense": 2,
      "bank": 1,
      "member": 0
    }
  }
}
```

---

## 👥 Users (Managed by Main User)

Main user (somitee manager) creates and manages user accounts. Each user is assigned one or more roles which determine their permissions. Users login with the credentials set by the main user.

### Login Resolution Order

1. Built-in demo accounts (`admin@system.com`, `manager@somitee.com`, `member@shop.com`)
2. Managed users created via `/users` endpoint
3. Reject if neither matches or user `status === 'inactive'`

### Created User Object

| Field          | Type         | Notes                                       |
| -------------- | ------------ | ------------------------------------------- |
| `id`           | string       | `usr-<timestamp>`                           |
| `name`         | string       | Display name                                |
| `email`        | string       | Login email (unique)                        |
| `password`     | string       | Hashed in production                        |
| `role`         | enum         | `member` \| `main_user` (base account type) |
| `somiteeId`    | string       | Scope of data access                        |
| `someiteeName` | string       | Resolved name                               |
| `roleIds`      | string[]     | Links to `/roles`                           |
| `status`       | enum         | `active` \| `inactive`                      |
| `createdBy`    | string       | userId of main_user                         |
| `createdAt`    | ISO datetime |                                             |

---

## POST `/users`

Create a new user. Requires `users.manage` (or main_user role).

**Body**

```json
{
  "name": "Karim Mia",
  "email": "karim@market.com",
  "password": "secure123",
  "role": "member",
  "somiteeId": "s1",
  "roleIds": ["role-collector", "role-accountant"]
}
```

**Response 201**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User created",
  "data": {
    "id": "usr-1745000000000",
    "name": "Karim Mia",
    "email": "karim@market.com",
    "role": "member",
    "somiteeId": "s1",
    "someiteeName": "Banani Market Somitee",
    "roleIds": ["role-collector", "role-accountant"],
    "status": "active",
    "createdAt": "2026-04-18T10:00:00Z"
  }
}
```

**Errors**

- `400` — name/email/password missing or password < 6 chars
- `409` — email already exists
- `422` — at least one roleId required

---

## GET `/users`

List managed users. Filterable.

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `somiteeId` | string | Filter by somitee |
| `status` | `active` \| `inactive` | |
| `roleId` | string | Users with a specific role |
| `q` | string | Search name / email |
| `page` | number | Default 1 |
| `limit` | number | Default 20 |

**Response 200**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved",
  "data": [
    {
      "id": "usr-1745000000000",
      "name": "Karim Mia",
      "email": "karim@market.com",
      "role": "member",
      "someiteeName": "Banani Market Somitee",
      "roleIds": ["role-collector"],
      "status": "active",
      "createdAt": "2026-04-18T10:00:00Z"
    }
  ],
  "meta": {"page": 1, "limit": 20, "total": 1}
}
```

---

## GET `/users/:id`

Get full user details (without password).

---

## PUT `/users/:id`

Update user fields. Email cannot be changed.

**Body** (any subset)

```json
{
  "name": "Karim Mia Updated",
  "password": "newPass123",
  "role": "member",
  "somiteeId": "s1",
  "roleIds": ["role-collector", "role-approver"],
  "status": "active"
}
```

**Response 200**

```json
{"success": true, "statusCode": 200, "message": "User updated", "data": {"id": "usr-1745000000000"}}
```

---

## PATCH `/users/:id/status`

Toggle active/inactive. Inactive users cannot login.

**Body**

```json
{"status": "inactive"}
```

---

## DELETE `/users/:id`

Permanently delete a user. Their role assignments are also removed.

**Response 200**

```json
{"success": true, "statusCode": 200, "message": "User deleted"}
```

---

## POST `/users/:id/reset-password`

Generate a new password for the user. Returns the plaintext to the main_user (who shares it with the user).

**Response 200**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset",
  "data": {"userId": "usr-1745000000000", "newPassword": "K7hf9p2qX3"}
}
```

---

## POST `/auth/login` (extended)

The existing `/auth/login` endpoint now also resolves managed users. Response includes `roleIds` and `permissions` so the frontend can enforce UI access.

**Response 200 (managed user)**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "usr-1745000000000",
      "name": "Karim Mia",
      "email": "karim@market.com",
      "role": "member",
      "somiteeId": "s1",
      "someiteeName": "Banani Market Somitee",
      "roleIds": ["role-collector"],
      "permissions": ["collection.create"],
      "isManagedUser": true
    }
  }
}
```

---

> **Document Version:** 2.2.0
> **Last Updated:** 2026-04-18
> **Total Endpoints:** 102+
> **Total Modules:** 27
> **New in v2.2:** User Management (managed users login with role-based permissions)
> **New in v2.1:** Dynamic Roles & Permissions, Maker-Checker Approval Workflow
> **Contact:** api@somiteehq.com
