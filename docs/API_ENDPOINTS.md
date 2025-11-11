# API Endpoints Reference

## Base URL

```
https://your-erpnext-instance.com/api/method/policy_pro.api
```

## Authentication

All endpoints require Frappe authentication. Include session cookies or API key:

```bash
# Using API Key
curl -H "Authorization: token api_key:api_secret" \
  https://your-instance.com/api/method/policy_pro.api.sales.get_sales_dashboard_data
```

## Lead Management APIs

### 1. Get Leads List

**Endpoint**: `GET /api/method/policy_pro.api.sales.get_leads`

**Description**: Fetch paginated list of leads with filters

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `status` | string | No | Filter by status (Open, Contacted, Converted, etc.) |
| `owner` | string | No | Filter by assigned agent |
| `page` | int | No | Page number (default: 1) |
| `limit` | int | No | Records per page (default: 20) |
| `filters` | JSON | No | Additional filters |

**Request Example**:

```bash
curl -X GET "https://instance.com/api/method/policy_pro.api.sales.get_leads?status=Open&limit=50"
```

**Response**:

```json
{
  "status": "success",
  "data": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "leads": [
      {
        "name": "LEAD-001",
        "lead_name": "John Doe",
        "company_name": "ABC Corp",
        "email_id": "john@example.com",
        "mobile_no": "+971501234567",
        "status": "Open",
        "owner": "sales.agent@example.com",
        "creation": "2024-11-01T10:30:00",
        "custom_call_back_date": "2024-11-05",
        "custom_call_back_time": "14:30"
      }
    ]
  }
}
```

---

### 2. Get Won/Converted Leads

**Endpoint**: `GET /api/method/policy_pro.api.sales.get_won_leads`

**Description**: Get leads with "Won" or "Converted" status (accessible by Sales User)

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit` | int | No | Number of records (default: 100) |
| `order_by` | string | No | Sort field |

**Request Example**:

```bash
curl -X GET "https://instance.com/api/method/policy_pro.api.sales.get_won_leads?limit=50&order_by=modified desc"
```

**Response**:

```json
{
  "status": "success",
  "data": [
    {
      "name": "LEAD-001",
      "lead_name": "John Doe",
      "status": "Won",
      "owner": "sales.agent@example.com",
      "email_id": "john@example.com",
      "mobile_no": "+971501234567"
    }
  ]
}
```

**Permissions**: Sales User, Sales Manager, System Manager

---

### 3. Assign Lead to Agent

**Endpoint**: `POST /api/method/policy_pro.api.sales.assign_lead`

**Description**: Manually assign a lead to a sales agent

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `lead_name` | string | Yes | Lead ID to assign |
| `agent_email` | string | Yes | Email of target sales agent |
| `reason` | string | No | Assignment reason/notes |

**Request Example**:

```bash
curl -X POST "https://instance.com/api/method/policy_pro.api.sales.assign_lead" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_name": "LEAD-001",
    "agent_email": "sales.agent@example.com",
    "reason": "Reassigned due to territory change"
  }'
```

**Response**:

```json
{
  "status": "success",
  "message": "Lead LEAD-001 assigned to sales.agent@example.com",
  "data": {
    "lead_id": "LEAD-001",
    "assigned_to": "sales.agent@example.com",
    "assignment_date": "2024-11-01T15:30:00"
  }
}
```

**Permissions**: Sales User, Sales Manager, System Manager

**Errors**:
- 403: Insufficient permissions
- 404: Lead not found
- 400: Invalid agent email

---

### 4. Update Lead Status

**Endpoint**: `POST /api/method/policy_pro.api.sales.update_lead_status`

**Description**: Update lead status and set call-back details if needed

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `lead_id` | string | Yes | Lead ID |
| `status` | string | Yes | New status |
| `callback_date` | date | Conditional | Call-back date (if status='Call Back') |
| `callback_time` | time | Conditional | Call-back time (if status='Call Back') |
| `notes` | string | No | Call-back notes |

**Request Example**:

```bash
curl -X POST "https://instance.com/api/method/policy_pro.api.sales.update_lead_status" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "LEAD-001",
    "status": "Call Back",
    "callback_date": "2024-11-05",
    "callback_time": "14:30",
    "notes": "Customer interested, follow up after meeting"
  }'
```

**Response**:

```json
{
  "status": "success",
  "message": "Lead status updated",
  "data": {
    "lead_id": "LEAD-001",
    "previous_status": "Contacted",
    "new_status": "Call Back",
    "callback_date": "2024-11-05",
    "callback_time": "14:30"
  }
}
```

**Permissions**: Sales Agent (assigned only), Sales Manager

---

### 5. Get Call-Back Leads

**Endpoint**: `GET /api/method/policy_pro.api.sales.get_call_back_leads`

**Description**: Get leads with upcoming call-backs

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `date_from` | date | No | Start date (default: today) |
| `date_to` | date | No | End date (default: +7 days) |
| `agent_email` | string | No | Filter by specific agent |

**Request Example**:

```bash
curl -X GET "https://instance.com/api/method/policy_pro.api.sales.get_call_back_leads?date_from=2024-11-01&date_to=2024-11-07"
```

**Response**:

```json
{
  "status": "success",
  "data": {
    "total": 5,
    "leads": [
      {
        "name": "LEAD-001",
        "lead_name": "John Doe",
        "callback_date": "2024-11-05",
        "callback_time": "14:30",
        "callback_notes": "Follow up on interest",
        "owner": "sales.agent@example.com"
      }
    ]
  }
}
```

---

## Sales Dashboard APIs

### 1. Get Sales Dashboard Data

**Endpoint**: `GET /api/method/policy_pro.api.sales.get_sales_dashboard_data`

**Description**: Get complete dashboard data (sales agents, metrics, targets)

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `date` | date | No | Dashboard date (default: today) |
| `period` | string | No | Period: 'daily', 'weekly', 'monthly' |

**Request Example**:

```bash
curl -X GET "https://instance.com/api/method/policy_pro.api.sales.get_sales_dashboard_data?date=2024-11-01&period=daily"
```

**Response**:

```json
{
  "status": "success",
  "data": {
    "date": "2024-11-01",
    "agents": [
      {
        "name": "sales.agent@example.com",
        "full_name": "John Agent",
        "user_image": "/file/path/image.jpg",
        "sales_count": 5,
        "total_revenue": 50000,
        "conversion_rate": 25.0,
        "target": 60000,
        "target_achieved": false
      }
    ],
    "summary": {
      "total_sales": 25,
      "total_revenue": 250000,
      "target_revenue": 300000,
      "overall_conversion_rate": 20.5,
      "top_agent": "John Agent"
    }
  }
}
```

**Permissions**: Sales User, Sales Manager, Company Manager, CEO, System Manager

---

### 2. Get Sales Agents

**Endpoint**: `GET /api/method/policy_pro.api.sales.get_sales_agents`

**Description**: Get all sales agents with basic info

**Parameters**: None

**Request Example**:

```bash
curl -X GET "https://instance.com/api/method/policy_pro.api.sales.get_sales_agents"
```

**Response**:

```json
{
  "status": "success",
  "data": [
    {
      "name": "sales.agent1@example.com",
      "full_name": "John Agent",
      "email": "sales.agent1@example.com",
      "user_image": "/file/path/image.jpg",
      "enabled": 1
    }
  ]
}
```

---

### 3. Get Daily Sales Summary

**Endpoint**: `GET /api/method/policy_pro.api.sales.get_daily_sales_summary`

**Description**: Get daily sales metrics

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `date` | date | No | Sales date (default: today) |

**Response**:

```json
{
  "status": "success",
  "data": {
    "date": "2024-11-01",
    "total_sales_count": 25,
    "total_revenue": 250000,
    "sales_by_agent": {
      "sales.agent1@example.com": 10,
      "sales.agent2@example.com": 15
    },
    "revenue_by_agent": {
      "sales.agent1@example.com": 100000,
      "sales.agent2@example.com": 150000
    }
  }
}
```

---

### 4. Get Sales Targets

**Endpoint**: `GET /api/method/policy_pro.api.sales.get_sales_targets`

**Description**: Get sales targets for agents

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `date` | date | No | Target date (default: today) |
| `agent_email` | string | No | Specific agent's target |

**Response**:

```json
{
  "status": "success",
  "data": {
    "date": "2024-11-01",
    "targets": [
      {
        "agent": "sales.agent1@example.com",
        "target_amount": 60000,
        "target_count": 6,
        "achieved_amount": 50000,
        "achieved_count": 5
      }
    ]
  }
}
```

---

### 5. Get Daily Quote

**Endpoint**: `GET /api/method/policy_pro.api.sales.get_daily_quote`

**Description**: Get motivational quote for the day

**Parameters**: None

**Request Example**:

```bash
curl -X GET "https://instance.com/api/method/policy_pro.api.sales.get_daily_quote"
```

**Response**:

```json
{
  "status": "success",
  "data": {
    "quote": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "author": "Winston Churchill",
    "date": "2024-11-01"
  }
}
```

---

## COD Document APIs

### 1. Create COD Document

**Endpoint**: `POST /api/method/policy_pro.api.sales.create_cod_document`

**Description**: Create a new COD document with file attachments

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `sales_order_id` | string | Yes | Sales Order ID |
| `sales_invoice_id` | string | No | Sales Invoice ID |
| `customer_id` | string | Yes | Customer ID |
| `lead_id` | string | No | Lead ID |
| `documents` | array | Yes | Array of document uploads |

**Document Object**:

```json
{
  "document_type": "Car Mulkiya",
  "file_content": "base64_encoded_content",
  "file_name": "mulkiya.pdf"
}
```

**Request Example**:

```bash
curl -X POST "https://instance.com/api/method/policy_pro.api.sales.create_cod_document" \
  -H "Content-Type: application/json" \
  -d '{
    "sales_order_id": "SO-2024-001",
    "customer_id": "CUST-001",
    "documents": [
      {
        "document_type": "Car Mulkiya",
        "file_name": "mulkiya.pdf",
        "file_content": "base64_encoded_pdf"
      },
      {
        "document_type": "Driving License",
        "file_name": "license.pdf",
        "file_content": "base64_encoded_pdf"
      }
    ]
  }'
```

**Response**:

```json
{
  "status": "success",
  "message": "COD Document created successfully",
  "data": {
    "cod_id": "COD-2024-001",
    "sales_order": "SO-2024-001",
    "submission_date": "2024-11-01T15:30:00",
    "manager_approval_status": "Pending",
    "ceo_approval_status": "Pending"
  }
}
```

**Permissions**: Sales Agent, Sales Manager, System Manager

---

### 2. Get COD Documents

**Endpoint**: `GET /api/method/policy_pro.api.sales.get_cod_documents`

**Description**: Get COD documents with filters

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `status` | string | No | Filter by approval status |
| `sales_agent` | string | No | Filter by sales agent |
| `customer_id` | string | No | Filter by customer |
| `page` | int | No | Page number |
| `limit` | int | No | Records per page |

**Request Example**:

```bash
curl -X GET "https://instance.com/api/method/policy_pro.api.sales.get_cod_documents?status=Pending&limit=50"
```

**Response**:

```json
{
  "status": "success",
  "data": {
    "total": 10,
    "page": 1,
    "limit": 50,
    "documents": [
      {
        "name": "COD-2024-001",
        "sales_order": "SO-2024-001",
        "customer": "CUST-001",
        "sales_agent": "sales.agent@example.com",
        "submission_date": "2024-11-01T15:30:00",
        "manager_approval_status": "Pending",
        "ceo_approval_status": "Pending",
        "approval_workflow_status": "Pending"
      }
    ]
  }
}
```

---

### 3. Approve COD Document

**Endpoint**: `POST /api/method/policy_pro.api.sales.approve_cod_document`

**Description**: Approve or reject COD document

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `cod_id` | string | Yes | COD Document ID |
| `status` | string | Yes | Status: 'Approved' or 'Rejected' |
| `comments` | string | No | Approval comments |
| `role` | string | Yes | Approver role: 'Company Manager' or 'CEO' |

**Request Example**:

```bash
curl -X POST "https://instance.com/api/method/policy_pro.api.sales.approve_cod_document" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_id": "COD-2024-001",
    "status": "Approved",
    "role": "Company Manager",
    "comments": "All documents verified and approved"
  }'
```

**Response**:

```json
{
  "status": "success",
  "message": "COD Document approved",
  "data": {
    "cod_id": "COD-2024-001",
    "manager_approval_status": "Approved",
    "manager_approval_date": "2024-11-01T16:00:00"
  }
}
```

**Permissions**: Company Manager (manager approval), CEO (CEO approval), System Manager

---

### 4. Get Approved COD Summary

**Endpoint**: `GET /api/method/policy_pro.api.sales.get_approved_cod_summary`

**Description**: Get approved COD documents summary for dashboard

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `date_from` | date | No | Start date |
| `date_to` | date | No | End date |

**Response**:

```json
{
  "status": "success",
  "data": {
    "total_submitted": 15,
    "total_approved": 12,
    "total_pending": 2,
    "total_rejected": 1,
    "approval_rate": 80.0
  }
}
```

---

## Webhook APIs

### 1. Create Lead from Website

**Endpoint**: `POST /api/method/policy_pro.api.sales.create_lead_from_website`

**Description**: Public webhook endpoint for website form submissions

**Authentication**: `allow_guest=True`

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Customer name |
| `email` | string | Yes | Email address |
| `phone` | string | Yes | Phone number |
| `company_name` | string | No | Company name |
| `source` | string | No | Lead source (default: 'Website') |

**Request Example**:

```bash
curl -X POST "https://instance.com/api/method/policy_pro.api.sales.create_lead_from_website" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+971501234567",
    "company_name": "ABC Corp",
    "source": "Website Contact Form"
  }'
```

**Response**:

```json
{
  "status": "success",
  "message": "Lead created successfully",
  "data": {
    "lead_id": "LEAD-2024-001",
    "lead_name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Rate Limiting**: 100 requests per hour per IP

---

## Error Handling

### Common Error Responses

**401 Unauthorized**:
```json
{
  "status": "error",
  "code": 401,
  "message": "Authentication required"
}
```

**403 Forbidden**:
```json
{
  "status": "error",
  "code": 403,
  "message": "Insufficient permissions for this action"
}
```

**404 Not Found**:
```json
{
  "status": "error",
  "code": 404,
  "message": "Resource not found"
}
```

**400 Bad Request**:
```json
{
  "status": "error",
  "code": 400,
  "message": "Invalid parameters",
  "errors": {
    "lead_name": "This field is required"
  }
}
```

**500 Internal Server Error**:
```json
{
  "status": "error",
  "code": 500,
  "message": "Internal server error",
  "trace_id": "req_123456"
}
```

---

## Rate Limiting

- **Authenticated Requests**: 1000/hour per user
- **Public Endpoints**: 100/hour per IP
- **WebSocket Connections**: 10 simultaneous per user

---

## Pagination

List endpoints support pagination:

```
?page=1&limit=50
?offset=0&limit=50
```

Response includes:
```json
{
  "total": 150,
  "page": 1,
  "limit": 50,
  "pages": 3,
  "data": [...]
}
```

---

## Field Validation

### Lead Status Values

```
Pending, Open, Contacted, Interested, Call Back,
Already Purchased Insurance, Not Interested,
Converted, Won, Lost
```

### COD Document Type Values

```
Car Mulkiya, Driving License, Emirates ID, Invoice,
Credit Note, Debit Note, Car Passing
```

### Approval Status Values

```
Pending, Approved, Rejected
```

---

## Testing

Use Postman or cURL to test endpoints:

```bash
# Export to Postman collection
# See docs/postman_collection.json
```

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - System design
- [DocTypes](./DOCTYPES.md) - Data models
- [Roles & Permissions](./ROLES_PERMISSIONS.md) - Access control
