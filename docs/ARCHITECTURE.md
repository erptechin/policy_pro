# Policy Pro Architecture

## System Overview

Policy Pro is a modular ERPNext application built with a clear separation of concerns:

- **Backend**: Python/Frappe framework handles business logic, data validation, and workflows
- **Frontend**: React-based UI for user interactions and real-time updates
- **Integration Layer**: APIs connect frontend to ERPNext backend

## Backend Architecture

### Directory Structure

```
policy_pro/policy_pro/
├── api/
│   ├── __init__.py
│   ├── hooks.py              # Document event hooks (validate, on_insert, etc.)
│   ├── sales.py              # Sales dashboard & lead management APIs
│   ├── custom.py             # Custom business logic APIs
│   ├── auth.py               # Authentication & authorization utilities
│   ├── theme.py              # Theme configuration APIs
│   ├── utils.py              # Helper functions
│   └── doctype.py            # DocType utilities
├── policy_pro/
│   └── custom/
│       ├── lead.json         # Customized Lead DocType
│       ├── cod_document.json # Custom COD Document DocType
│       └── lead_assignment_rule.json # Lead assignment configuration
├── utils/
│   └── after_app_install.py  # Initialization & setup
├── hooks.py                  # Main app hooks
└── __init__.py
```

### Key Modules

#### 1. Document Hooks (`api/hooks.py`)

Handles lifecycle events for custom DocTypes:

- **Lead validation**: Ensure complete information before save
- **Lead assignment**: Auto-assign leads to agents on creation
- **COD notifications**: Send emails to managers/CEO on submission
- **Permission queries**: Filter documents based on user role

#### 2. Sales APIs (`api/sales.py`)

Provides REST endpoints for:

- Sales dashboard data aggregation
- Lead management and assignment
- Call-back scheduling
- COD document management
- Sales metrics and performance tracking

#### 3. Custom DocTypes

**Lead** (Extended)
- Call-back date/time fields
- Call-back notes
- Assignment tracking
- Custom status options

**COD Document** (New)
- Links to Sales Order/Invoice and Lead
- Child table for multiple document uploads
- Multi-level approval workflow
- File attachment management

**Lead Assignment Rule** (Optional)
- Configuration for auto-assignment logic
- Territory and agent mapping
- Priority and weighting

### Permission Model

Uses ERPNext's role-based access control:

```python
# Custom permission queries in hooks.py
Sales User → Read all leads, filter won leads, can assign
Sales Manager → Full lead access, manage assignments, approve COD
Sales Agent → Create/edit assigned leads, upload COD
Company Manager → Read/approve COD documents
CEO → Full dashboard access, final COD approval
System Manager → Full system access
```

## Frontend Architecture

### Directory Structure

```
frontend/src/app/
├── pages/
│   ├── dashboards/
│   │   ├── lead/
│   │   │   ├── form.jsx      # Lead entry form
│   │   │   └── index.jsx     # Lead list view
│   │   └── sales/
│   │       └── index.jsx     # Sales dashboard
│   └── sales/
│       └── cod-document/
│           ├── form.jsx      # COD upload form
│           └── index.jsx     # COD list view
├── components/
│   ├── ui/                   # Shared UI components
│   ├── forms/                # Form components
│   ├── dashboards/           # Dashboard components
│   └── shared/               # App-wide shared components
├── hooks/
│   ├── useApi.js            # API integration hook
│   ├── useAuth.js           # Authentication hook
│   └── useRealtime.js       # Real-time updates hook
├── configs/
│   └── theme.config.js      # Theme & styling configuration
├── utils/
│   ├── api.js               # API helper functions
│   ├── validation.js        # Form validation helpers
│   └── formatting.js        # Data formatting utilities
└── styles/
    └── variables.css        # CSS custom properties
```

### Key Components

#### 1. Lead Management Pages

**Lead Form** (`pages/dashboards/lead/form.jsx`)
- Multi-step form with field validation
- Real-time completeness checking
- Call-back scheduling date/time picker
- Notes rich-text editor

**Lead List** (`pages/dashboards/lead/index.jsx`)
- Filterable list with status badges
- Assignment interface for Sales Users
- Won leads filter
- Call-back calendar view

#### 2. Sales Dashboard (`pages/dashboards/sales/index.jsx`)

Main dashboard components:

- **MotivationalQuote**: Daily inspirational quote
- **AgentCards**: Sales agent photos and KPIs
- **SalesMetrics**: Key performance indicators
- **SalesCharts**: Visual data representations
- **TargetProgress**: Target vs actual indicators
- **NewLeadNotification**: Real-time new lead alerts

#### 3. COD Document Pages

**COD Form** (`pages/sales/cod-document/form.jsx`)
- Multi-file drag-and-drop upload
- Document type selection
- Approval status tracking
- Comment/feedback section

**COD List** (`pages/sales/cod-document/index.jsx`)
- COD document list with filters
- Approval status indicators
- Action buttons for managers/CEO

### Data Flow

```
User Action
    ↓
React Component
    ↓
useApi Hook (validate & prepare)
    ↓
Frappe API Call
    ↓
Backend Processing (hooks.py, sales.py)
    ↓
Database Transaction
    ↓
Response with real-time updates
    ↓
Component Re-render
```

## API Contract

### Lead APIs

```
POST /api/method/policy_pro.api.sales.assign_lead
Parameters: lead_name, agent_email
Response: {status, message}

GET /api/method/policy_pro.api.sales.get_won_leads
Response: [{lead_id, lead_name, status, owner, ...}]

POST /api/method/policy_pro.api.sales.update_lead_status
Parameters: lead_id, status, callback_date, callback_time
```

### Sales Dashboard APIs

```
GET /api/method/policy_pro.api.sales.get_sales_dashboard_data
Parameters: date (optional)
Response: {agents, sales_data, targets, summary}

GET /api/method/policy_pro.api.sales.get_daily_quote
Response: {quote, author}
```

### COD Document APIs

```
POST /api/method/policy_pro.api.sales.create_cod_document
Parameters: sales_order_id, documents[], approvers

POST /api/method/policy_pro.api.sales.approve_cod_document
Parameters: cod_id, status, comments
```

## Real-Time Communication

Uses Frappe's built-in real-time capabilities:

- **WebSocket**: Live dashboard updates (new leads, approvals)
- **Server-Sent Events (SSE)**: Fallback for notifications
- **Polling**: UI refresh interval (optional)

```python
# Backend trigger
frappe.publish_realtime('new_lead', {
    'lead_name': lead.name,
    'lead_customer': lead.customer_name,
    'timestamp': frappe.utils.now()
})

# Frontend listener (via useRealtime hook)
onRealtimeUpdate('new_lead', (data) => {
    updateDashboard(data);
    showNotification(data);
});
```

## Database Schema

### Extended Lead Fields

```json
{
  "custom_call_back_date": "Date",
  "custom_call_back_time": "Time",
  "custom_call_back_notes": "Small Text",
  "custom_assigned_agent": "Link (User)",
  "custom_assignment_date": "Datetime"
}
```

### COD Document Schema

```json
{
  "sales_order": "Link (Sales Order)",
  "sales_invoice": "Link (Sales Invoice)",
  "customer": "Link (Customer)",
  "lead": "Link (Lead)",
  "sales_agent": "Link (User)",
  "submission_date": "Datetime",
  "manager_approval_status": "Select (Pending/Approved/Rejected)",
  "ceo_approval_status": "Select (Pending/Approved/Rejected)",
  "cod_documents": [
    {
      "document_type": "Select",
      "file_attachment": "Attach",
      "upload_date": "Datetime",
      "status": "Select (Pending/Approved/Rejected)"
    }
  ]
}
```

## Workflow Diagram

### Lead Workflow

```
New Lead → Validation → Auto Assignment → Sales Agent → Call-back/Status Update → Conversion
```

### COD Approval Workflow

```
COD Upload → Manager Review → CEO Review → Dashboard Update
             ↓ (Rejected)
           Revision Requested
```

## Security Considerations

1. **Authentication**: Frappe session-based auth
2. **Authorization**: Role-based access control with permission queries
3. **Data Validation**: Server-side validation in hooks
4. **File Upload**: Sandboxed file attachment system
5. **API Endpoints**: Whitelisted methods with role checks

## Performance Optimization

1. **Caching**: API responses cached at frontend
2. **Pagination**: Large lists paginated server-side
3. **Query Optimization**: Use filters and specific fields
4. **Real-time Updates**: Only for critical notifications
5. **Frontend**: Code splitting, lazy loading components

## Deployment Architecture

```
Production Environment
├── Backend (Frappe/ERPNext)
├── Frontend (React, served via Frappe)
├── Database (PostgreSQL/MariaDB)
└── File Storage (Local/S3)
```

### Environment Variables Required

```
FRAPPE_APP_ENDPOINT=https://your-erpnext.com
FRAPPE_API_KEY=***
FRAPPE_API_SECRET=***
REACT_APP_API_URL=https://your-erpnext.com
```

## Integration Points

1. **Email Service**: For COD notifications
2. **File Storage**: For document uploads
3. **User Authentication**: Frappe auth system
4. **Document Management**: ERPNext native workflows
