# Implementation Guide

## Project Phases & Timeline

### Phase 1: Lead Management Enhancements (Week 1-2)

**Duration**: 2 weeks
**Components**: Lead form validation, callback scheduling, custom statuses

#### Tasks

1. **Enhance Lead DocType** (`policy_pro/policy_pro/custom/lead.json`)
   - Add custom fields:
     - `custom_call_back_date` (Date, depends_on: status='Call Back')
     - `custom_call_back_time` (Time, depends_on: status='Call Back')
     - `custom_call_back_notes` (Small Text)
   - Add custom statuses: "Call Back", "Already Purchased Insurance", "Not Interested"
   - Implement field dependency logic

2. **Backend Validation** (`policy_pro/api/hooks.py`)
   ```python
   doc_events = {
       "Lead": {
           "validate": "policy_pro.api.hooks.validate_lead_completeness"
       }
   }

   def validate_lead_completeness(doc, method):
       mandatory_fields = ['lead_name', 'company_name', 'email_id', 'mobile_no']
       for field in mandatory_fields:
           if not doc.get(field):
               frappe.throw(f"Field {field} is mandatory")
   ```

3. **Frontend Form Update** (`frontend/src/app/pages/dashboards/lead/form.jsx`)
   - Add DatePicker for call-back date
   - Add TimePicker for call-back time
   - Add RichTextEditor for notes
   - Implement conditional field visibility
   - Add field validation with react-hook-form

4. **Frontend List View** (`frontend/src/app/pages/dashboards/lead/index.jsx`)
   - Add filter by status
   - Add call-back date sorting
   - Add visual status badges
   - Display upcoming callbacks with date/time

#### Deliverables
- ✓ Extended Lead DocType JSON
- ✓ Validation hooks implementation
- ✓ Updated frontend form component
- ✓ Updated frontend list view
- ✓ Component tests

---

### Phase 2: Lead Assignment Automation (Week 2-3)

**Duration**: 1 week
**Components**: Assignment rules, auto-assignment, Sales User permissions

#### Tasks

1. **Create Lead Assignment Logic** (`policy_pro/api/hooks.py`)
   ```python
   doc_events = {
       "Lead": {
           "after_insert": "policy_pro.api.hooks.assign_lead_to_agent"
       }
   }

   def assign_lead_to_agent(doc, method):
       assignment_rule = get_best_assignment_rule(doc)
       if assignment_rule:
           doc.owner = assignment_rule.agent
           doc.add_comment("Comment", f"Auto-assigned to {assignment_rule.agent}")
   ```

2. **Implement Permission Query** (`policy_pro/api/hooks.py`)
   ```python
   permission_query_conditions = {
       "Lead": "policy_pro.api.hooks.get_lead_permission_query_conditions"
   }

   def get_lead_permission_query_conditions(user):
       roles = frappe.get_roles(user)
       if "Sales User" in roles:
           return "`tabLead`.status IN ('Converted', 'Won')"
       elif "Sales Agent" in roles:
           return f"`tabLead`.owner = '{user}'"
       return "1=1"
   ```

3. **Create Lead Assignment API** (`policy_pro/api/sales.py`)
   ```python
   @frappe.whitelist()
   def assign_lead_to_agent(lead_name, agent_email):
       if "Sales User" not in frappe.get_roles():
           frappe.throw("Insufficient permissions")

       lead = frappe.get_doc("Lead", lead_name)
       lead.owner = agent_email
       lead.save(ignore_permissions=True)
   ```

4. **Create Sales User Role** (`policy_pro/utils/after_app_install.py`)
   - Add role creation for "Sales User", "Sales Manager", "Sales Agent"
   - Set appropriate desk access

5. **Frontend Assignment UI** (`frontend/src/app/pages/dashboards/lead/index.jsx`)
   - Add "Assign Lead" button (visible for Sales User/Manager)
   - Create assignment modal with agent selection
   - Add assignment history view
   - Real-time permission-based visibility

#### Deliverables
- ✓ Assignment logic implementation
- ✓ Permission query configuration
- ✓ Assignment API endpoint
- ✓ Role creation script
- ✓ Frontend assignment UI
- ✓ Integration tests

---

### Phase 3: COD Document Workflow (Week 3-5)

**Duration**: 2 weeks
**Components**: COD DocType, file uploads, approval workflow, notifications

#### Tasks

1. **Create COD Document DocType** (`policy_pro/policy_pro/custom/cod_document.json`)
   ```json
   {
     "doctype": "DocType",
     "name": "COD Document",
     "fields": [
       {"fieldname": "sales_order", "fieldtype": "Link", "options": "Sales Order"},
       {"fieldname": "sales_invoice", "fieldtype": "Link", "options": "Sales Invoice"},
       {"fieldname": "customer", "fieldtype": "Link", "options": "Customer"},
       {"fieldname": "lead", "fieldtype": "Link", "options": "Lead"},
       {"fieldname": "sales_agent", "fieldtype": "Link", "options": "User"},
       {"fieldname": "cod_documents", "fieldtype": "Table", "options": "COD Document Item"},
       {"fieldname": "manager_approval_status", "fieldtype": "Select", "options": "Pending\nApproved\nRejected"},
       {"fieldname": "ceo_approval_status", "fieldtype": "Select", "options": "Pending\nApproved\nRejected"}
     ]
   }
   ```

2. **Create Child DocType** (`policy_pro/policy_pro/custom/cod_document_item.json`)
   ```json
   {
     "doctype": "DocType",
     "name": "COD Document Item",
     "fields": [
       {"fieldname": "document_type", "fieldtype": "Select",
        "options": "Car Mulkiya\nDriving License\nEmirates ID\nInvoice\nCredit Note\nDebit Note\nCar Passing"},
       {"fieldname": "file_attachment", "fieldtype": "Attach"},
       {"fieldname": "upload_date", "fieldtype": "Datetime"},
       {"fieldname": "status", "fieldtype": "Select", "options": "Pending\nApproved\nRejected"}
     ]
   }
   ```

3. **Create Notification Hooks** (`policy_pro/api/hooks.py`)
   ```python
   doc_events = {
       "COD Document": {
           "on_submit": "policy_pro.api.hooks.notify_cod_submission",
           "on_update_after_submit": "policy_pro.api.hooks.update_cod_approval"
       }
   }

   def notify_cod_submission(doc, method):
       # Get approvers and send email
       managers = frappe.get_all("User", {"role_profile_name": "Company Manager"})
       send_notification_email(doc, managers)

   def update_cod_approval(doc, method):
       if doc.manager_approval_status == "Approved" and doc.ceo_approval_status == "Approved":
           update_sales_dashboard(doc)
   ```

4. **Create COD APIs** (`policy_pro/api/sales.py`)
   ```python
   @frappe.whitelist()
   def create_cod_document(sales_order_id, documents):
       # Create COD document with file attachments
       pass

   @frappe.whitelist()
   def approve_cod_document(cod_id, status, comments):
       # Update approval status
       pass

   @frappe.whitelist()
   def get_cod_documents(filters=None):
       # Get COD documents based on user role
       pass
   ```

5. **Frontend COD Form** (`frontend/src/app/pages/sales/cod-document/form.jsx`)
   - Drag-and-drop file upload
   - Document type selection
   - File preview
   - Approval status display
   - Comment section
   - Submit button with role-based visibility

6. **Frontend COD List** (`frontend/src/app/pages/sales/cod-document/index.jsx`)
   - COD document list with filters
   - Status badges (Pending, Approved, Rejected)
   - Approval action buttons for managers/CEO
   - Document download links

#### Deliverables
- ✓ COD Document DocType JSON
- ✓ COD Document Item child DocType JSON
- ✓ Notification hooks implementation
- ✓ COD management APIs
- ✓ Frontend form component
- ✓ Frontend list component
- ✓ Email templates (via Frappe UI)
- ✓ Integration tests

---

### Phase 4: Sales Dashboard (Week 5-7)

**Duration**: 2 weeks
**Components**: Dashboard UI, metrics calculation, real-time updates, motivational quotes

#### Tasks

1. **Create Dashboard API** (`policy_pro/api/sales.py`)
   ```python
   @frappe.whitelist()
   def get_sales_dashboard_data(date=None):
       if not date:
           date = frappe.utils.today()

       return {
           "agents": get_sales_agents(),
           "sales_data": get_daily_sales(date),
           "targets": get_sales_targets(date),
           "approved_cods": get_approved_cods(date)
       }

   @frappe.whitelist()
   def get_daily_quote():
       import datetime
       quotes = MOTIVATIONAL_QUOTES
       day = datetime.date.today().timetuple().tm_yday
       return quotes[day % len(quotes)]
   ```

2. **Create Motivational Quote Component** (`frontend/src/app/components/dashboards/MotivationalQuote.jsx`)
   - Display daily quote with animation
   - Quote rotation every day
   - Attractive styling

3. **Create Agent Cards Component** (`frontend/src/app/components/dashboards/AgentCards.jsx`)
   - Display agent photo, name, KPIs
   - Sales count, revenue, conversion rate
   - Target progress indicator
   - Responsive grid layout

4. **Create Metrics Cards Component** (`frontend/src/app/components/dashboards/SalesMetrics.jsx`)
   - Total sales count
   - Total revenue
   - Target vs actual comparison
   - Performance indicators

5. **Create Charts Component** (`frontend/src/app/components/dashboards/SalesCharts.jsx`)
   - Bar chart: Sales by agent
   - Line chart: Daily sales trend
   - Pie chart: Sales by category
   - Use Recharts or Chart.js

6. **Create Sales Dashboard Page** (`frontend/src/app/pages/dashboards/sales/index.jsx`)
   - Compose all components
   - Implement refresh mechanism
   - Add date range selector
   - Real-time updates via WebSocket

7. **Theme Configuration** (`frontend/src/configs/theme.config.js`)
   ```javascript
   export const salesDashboardTheme = {
     colors: {
       primary: "#4F46E5",
       success: "#10B981",
       warning: "#F59E0B",
       danger: "#EF4444",
       gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
     },
     fonts: {
       heading: "'Inter', 'Poppins', sans-serif",
       body: "'Inter', system-ui, sans-serif"
     }
   }
   ```

#### Deliverables
- ✓ Dashboard data API
- ✓ Quote generation API
- ✓ MotivationalQuote component
- ✓ AgentCards component
- ✓ SalesMetrics component
- ✓ SalesCharts component
- ✓ Sales dashboard page
- ✓ Theme configuration
- ✓ Responsive design tests

---

### Phase 5: Real-Time Updates & Integration (Week 7-8)

**Duration**: 1 week
**Components**: WebSocket integration, real-time notifications, webhook endpoints

#### Tasks

1. **Implement Real-Time Lead Notifications** (`policy_pro/api/hooks.py`)
   ```python
   def notify_new_lead(doc, method):
       frappe.publish_realtime('new_lead', {
           'lead_id': doc.name,
           'lead_name': doc.lead_name,
           'timestamp': frappe.utils.now()
       })
   ```

2. **Create Frontend Real-Time Hook** (`frontend/src/app/hooks/useRealtime.js`)
   - Connect to Frappe WebSocket
   - Implement event listeners
   - Auto-refresh dashboard on new lead
   - Show notification toasts

3. **Create Website Lead Webhook** (`policy_pro/api/sales.py`)
   ```python
   @frappe.whitelist(allow_guest=True)
   def create_lead_from_website(lead_data):
       lead = frappe.get_doc({
           "doctype": "Lead",
           "lead_name": lead_data.get("name"),
           "email_id": lead_data.get("email"),
           "mobile_no": lead_data.get("phone"),
           "source": "Website"
       })
       lead.insert()
       frappe.publish_realtime('new_lead', {...})
   ```

4. **Implement Call-Back Calendar View** (`frontend/src/app/components/dashboards/CallBackCalendar.jsx`)
   - Calendar showing upcoming call-backs
   - Click to view lead details
   - Add new call-back from calendar

#### Deliverables
- ✓ Real-time notification system
- ✓ useRealtime custom hook
- ✓ Website webhook endpoint
- ✓ Call-back calendar component
- ✓ Integration tests with WebSocket

---

### Phase 6: Testing & QA (Week 8)

**Duration**: 1 week

#### Tasks

1. **Unit Tests**
   - API endpoint tests
   - Hook validation tests
   - Component tests

2. **Integration Tests**
   - Lead creation to assignment workflow
   - COD approval workflow
   - Dashboard data accuracy

3. **End-to-End Tests**
   - Complete user workflows
   - Permission-based access
   - Real-time updates

4. **Performance Tests**
   - Dashboard load time < 3 seconds
   - Lead creation < 2 seconds
   - Query optimization

5. **Security Tests**
   - Permission enforcement
   - API authentication
   - File upload validation

#### Deliverables
- ✓ Test suite with >80% coverage
- ✓ Performance test results
- ✓ Security audit report

---

### Phase 7: Deployment (Week 9)

**Duration**: 1 week

#### Tasks

1. **Staging Deployment**
   - Deploy to staging environment
   - Run full test suite
   - Performance validation

2. **User Acceptance Testing (UAT)**
   - Sales team testing
   - Manager approval workflow
   - Dashboard usability

3. **Documentation**
   - User manual
   - Admin guide
   - API documentation

4. **User Training**
   - Sales team training
   - Manager training
   - Support staff training

5. **Production Deployment**
   - Data backup
   - Database migration (if needed)
   - Go-live

#### Deliverables
- ✓ Deployed application
- ✓ User documentation
- ✓ Training materials
- ✓ Support procedures

---

## Development Best Practices

### Backend Development

1. **Code Organization**
   - Keep hooks.py for event handlers only
   - Put business logic in api/sales.py, api/custom.py
   - Use utils/ for reusable functions

2. **Error Handling**
   - Use frappe.throw() for user errors
   - Log errors with frappe.log_error()
   - Return meaningful error messages

3. **Database Queries**
   - Use frappe.get_all() for simple queries
   - Use frappe.db.sql() for complex queries
   - Always filter by required fields only
   - Implement pagination for large datasets

4. **Security**
   - Always check user permissions with frappe.get_roles()
   - Validate input data before processing
   - Use ignore_permissions=True carefully
   - Never expose sensitive data in APIs

### Frontend Development

1. **Component Structure**
   - Keep components focused and single-responsibility
   - Use hooks for shared logic
   - Pass data through props, avoid prop drilling
   - Implement proper error boundaries

2. **API Integration**
   - Use custom useApi hook for all API calls
   - Implement proper loading/error states
   - Handle pagination for large lists
   - Cache responses where appropriate

3. **Form Handling**
   - Use react-hook-form for form management
   - Implement client-side and server-side validation
   - Show validation errors inline
   - Implement auto-save for drafts

4. **Performance**
   - Implement code splitting with React.lazy()
   - Use useMemo for expensive computations
   - Implement virtual scrolling for long lists
   - Optimize re-renders with React.memo()

---

## Testing Strategy

### Unit Tests
- API endpoint responses
- Hook functions
- Utility functions
- React components (snapshot + behavior)

### Integration Tests
- Multi-step workflows
- Database transactions
- API + Hook interactions
- Permission enforcement

### E2E Tests
- Complete user journeys
- Real-time updates
- File uploads
- Multi-user scenarios

---

## Deployment Checklist

- [ ] All tests passing
- [ ] Code review completed
- [ ] Pre-commit hooks passing
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] User training completed
- [ ] Support team briefed
- [ ] Monitoring configured

---

## Rollback Plan

If issues occur post-deployment:

1. Revert to previous app version
2. Restore database backup
3. Clear cache
4. Notify users
5. Post-incident analysis

---

## Success Metrics

- All features implemented and tested
- Dashboard loads in < 3 seconds
- Lead assignment completes in < 2 seconds
- Real-time updates within 5 seconds
- 95%+ test coverage
- Zero critical bugs at go-live
- User satisfaction > 4/5 stars
