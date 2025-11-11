# Frontend Structure Guide

## Overview

The Policy Pro frontend is built with React and follows a modular, scalable architecture. This guide describes the folder structure, component organization, and best practices.

## Directory Tree

```
frontend/src/
├── app/                              # App-specific modules
│   ├── components/                   # App-specific components
│   │   ├── form/                    # Form components (Lead, COD, etc.)
│   │   └── listing/                 # List view components
│   ├── contexts/                     # React Context for global state
│   │   ├── auth/                    # Authentication context
│   │   ├── breakpoint/              # Responsive breakpoint context
│   │   ├── locale/                  # Localization context
│   │   ├── sidebar/                 # Sidebar state context
│   │   └── theme/                   # Theme context
│   ├── layouts/                      # Page layout components
│   │   ├── MainLayout/              # Main app layout
│   │   └── Sideblock/               # Side block layout
│   ├── navigation/                   # Navigation & routing
│   ├── pages/                        # Page-level components (one per route)
│   │   ├── Auth/                    # Login/authentication pages
│   │   ├── bridge/                  # Data bridge pages
│   │   ├── dashboards/              # Dashboard pages
│   │   │   ├── lead/               # Lead dashboard
│   │   │   └── sales/              # Sales dashboard
│   │   ├── employee/                # Employee management
│   │   ├── errors/                  # Error pages (404, 500)
│   │   ├── fleets/                  # Fleet management
│   │   ├── labs/                    # Experimental features
│   │   ├── purchases/               # Purchase module
│   │   ├── sales/                   # Sales module
│   │   │   ├── sales-order/        # Sales Order pages
│   │   │   ├── sales-invoice/      # Sales Invoice pages
│   │   │   └── cod-document/       # COD Document pages
│   │   ├── settings/                # Settings pages
│   │   └── stores/                  # Store management
│   └── router/                       # Route configuration
│
├── components/                       # Shared/reusable components
│   ├── docs/                        # Documentation components
│   ├── shared/                      # Shared business components
│   │   ├── form/                   # Form field components
│   │   └── table/                  # Table components
│   ├── template/                    # Template components
│   │   ├── Customizer/             # Theme customizer
│   │   ├── RightSidebar/           # Right sidebar
│   │   ├── Search/                 # Search component
│   │   └── Toc/                    # Table of contents
│   └── ui/                          # Atomic UI components
│       ├── Accordion/              # Accordion component
│       ├── Avatar/                 # Avatar component
│       ├── Badge/                  # Badge component
│       ├── Box/                    # Box/Container component
│       ├── Button/                 # Button component
│       ├── Card/                   # Card component
│       ├── Circlebar/              # Circular progress component
│       ├── Collapse/               # Collapse component
│       ├── Form/                   # Form wrapper component
│       ├── Pagination/             # Pagination component
│       ├── Progress/               # Progress bar component
│       ├── ScrollShadow/           # Scroll shadow component
│       ├── Skeleton/               # Skeleton loader component
│       ├── Spinner/                # Loading spinner component
│       ├── Table/                  # Table component
│       ├── Tag/                    # Tag/Label component
│       └── Timeline/               # Timeline component
│
├── assets/                          # Static assets
│   ├── dualicons/                  # Dual-color icons
│   ├── illustrations/              # Illustrations & graphics
│   └── nav-icons/                  # Navigation icons
│
├── configs/                         # Configuration files
│   ├── theme.config.js             # Theme configuration
│   └── [other configs]
│
├── constants/                       # Global constants
│   ├── status.js                   # Status constants
│   ├── document-types.js           # DocType constants
│   └── [other constants]
│
├── contexts/                        # Global React Contexts
│   └── [app-wide contexts]
│
├── hooks/                           # Custom React hooks
│   ├── useApi.js                   # API integration hook
│   ├── useAuth.js                  # Authentication hook
│   ├── useForm.js                  # Form handling hook
│   ├── useRealtime.js              # Real-time updates hook
│   └── [other hooks]
│
├── i18n/                            # Internationalization
│   ├── locales/                     # Translation files
│   │   ├── ar/                     # Arabic translations
│   │   ├── en/                     # English translations
│   │   ├── es/                     # Spanish translations
│   │   └── zh_cn/                  # Simplified Chinese
│   └── index.js                     # i18n configuration
│
├── middleware/                      # Middleware functions
│   ├── auth.js                      # Auth middleware
│   ├── permissions.js               # Permission checks
│   └── [other middleware]
│
├── styles/                          # Global styles
│   ├── app/                         # App-specific styles
│   │   ├── components/             # Component styles
│   │   ├── forms/                  # Form styles
│   │   └── vendors/                # Vendor styles
│   ├── index.css                    # Global styles
│   └── variables.css                # CSS custom properties
│
├── utils/                           # Utility functions
│   ├── dom/                         # DOM utilities
│   ├── react-table/                 # React-Table utilities
│   ├── api.js                       # API helper functions
│   ├── validation.js                # Form validation
│   ├── formatting.js                # Data formatting
│   └── [other utils]
│
├── App.jsx                          # Root App component
├── main.jsx                         # Entry point
└── index.css                        # Root styles

```

---

## Module Structure Details

### 1. Pages Module (`app/pages/`)

Each page module represents a route and contains related components.

#### Lead Dashboard Page

```
app/pages/dashboards/lead/
├── index.jsx                # Lead list page (main export)
├── form.jsx                 # Lead form (create/edit)
├── LeadList.jsx             # Lead list component
├── LeadForm.jsx             # Lead form component
├── LeadDetail.jsx           # Lead detail view
├── hooks/
│   ├── useFetchLeads.js     # Fetch leads hook
│   ├── useCreateLead.js     # Create lead hook
│   └── useUpdateLead.js     # Update lead hook
├── utils/
│   ├── leadValidation.js    # Lead validation rules
│   └── leadFormatting.js    # Lead data formatting
├── services/
│   └── leadService.js       # API calls for leads
└── constants/
    └── leadStatus.js        # Lead status constants
```

#### Sales Dashboard Page

```
app/pages/dashboards/sales/
├── index.jsx                       # Sales dashboard page (main export)
├── SalesDashboard.jsx             # Main dashboard component
├── components/
│   ├── MotivationalQuote.jsx      # Daily quote display
│   ├── AgentCards.jsx             # Agent performance cards
│   ├── SalesMetrics.jsx           # KPI cards
│   ├── SalesCharts.jsx            # Charts & graphs
│   ├── TargetProgress.jsx         # Target progress bar
│   ├── NewLeadNotification.jsx    # Real-time lead alerts
│   └── CallBackCalendar.jsx       # Callback calendar
├── hooks/
│   ├── useFetchDashboard.js       # Fetch dashboard data
│   ├── useDashboardRefresh.js     # Auto-refresh hook
│   └── useRealtimeLeads.js        # Real-time lead updates
├── services/
│   └── dashboardService.js        # Dashboard API calls
└── constants/
    └── dashboardConfig.js         # Dashboard config
```

#### COD Document Page

```
app/pages/sales/cod-document/
├── index.jsx                # COD list page (main export)
├── form.jsx                 # COD form (create/edit)
├── CODList.jsx              # COD list component
├── CODForm.jsx              # COD form component
├── CODDetail.jsx            # COD detail view
├── components/
│   ├── FileUploader.jsx     # Drag-drop file upload
│   ├── ApprovalPanel.jsx    # Manager/CEO approval
│   └── DocumentTypeSelect.jsx # Document type selector
├── hooks/
│   ├── useFetchCOD.js       # Fetch COD docs
│   ├── useCreateCOD.js      # Create COD
│   ├── useFileUpload.js     # File upload hook
│   └── useApproval.js       # Approval hook
├── services/
│   └── codService.js        # COD API calls
├── utils/
│   ├── fileValidation.js    # File validation
│   └── codFormatting.js     # COD data formatting
└── constants/
    └── documentTypes.js     # Document type options
```

---

### 2. Components Module (`components/`)

#### UI Components (`components/ui/`)

Atomic, reusable UI components following the component pattern:

```
components/ui/Button/
├── Button.jsx               # Main component
├── Button.module.css        # Component styles
├── useButton.js             # Custom hook (if needed)
├── Button.types.js          # TypeScript types (optional)
└── Button.test.jsx          # Tests

components/ui/Card/
├── Card.jsx
├── Card.module.css
└── Card.test.jsx

components/ui/Modal/
├── Modal.jsx
├── Modal.module.css
├── useModal.js
└── Modal.test.jsx
```

#### Shared Components (`components/shared/`)

Business logic components used across multiple pages:

```
components/shared/form/
├── FormField.jsx            # Generic form field
├── FormFieldGroup.jsx       # Field grouping
├── FormField.module.css
└── useFormField.js

components/shared/table/
├── DataTable.jsx            # Reusable data table
├── TablePagination.jsx      # Pagination
├── TableFilters.jsx         # Column filters
└── DataTable.module.css

components/shared/
├── ConfirmDialog.jsx        # Confirmation dialog
├── ErrorBoundary.jsx        # Error boundary
├── LoadingOverlay.jsx       # Loading overlay
└── Toast.jsx                # Toast notifications
```

---

### 3. Hooks Module (`hooks/`)

Custom React hooks for shared logic:

```
hooks/
├── useApi.js                # API integration
│   export const useApi = (method, params = {}) => {
│       const [data, setData] = useState(null);
│       const [loading, setLoading] = useState(false);
│       const [error, setError] = useState(null);
│       // Implementation
│   }
│
├── useAuth.js               # Authentication
│   export const useAuth = () => {
│       const [user, setUser] = useState(null);
│       const [roles, setRoles] = useState([]);
│       // Implementation
│   }
│
├── useForm.js               # Form state management
│   export const useForm = (initialValues, onSubmit) => {
│       const [values, setValues] = useState(initialValues);
│       const [errors, setErrors] = useState({});
│       // Implementation
│   }
│
├── useRealtime.js           # Real-time updates
│   export const useRealtime = (channel) => {
│       const [data, setData] = useState(null);
│       // WebSocket/SSE connection
│   }
│
├── usePermission.js         # Permission checks
│   export const usePermission = (doctype, action) => {
│       const { roles } = useAuth();
│       return hasPermission(roles, doctype, action);
│   }
│
├── usePagination.js         # Pagination logic
├── useDebounce.js           # Debouncing
├── useLocalStorage.js       # Local storage
└── useNotification.js       # Toast notifications
```

---

### 4. Utils Module (`utils/`)

Pure utility functions:

```
utils/
├── api.js
│   export const fetchLeads = (filters) => { }
│   export const createLead = (data) => { }
│   export const updateLead = (id, data) => { }
│   export const approveCOD = (id, status) => { }
│
├── validation.js
│   export const validateEmail = (email) => { }
│   export const validatePhone = (phone) => { }
│   export const validateLead = (leadData) => { }
│   export const validateCODFiles = (files) => { }
│
├── formatting.js
│   export const formatCurrency = (amount) => { }
│   export const formatDate = (date) => { }
│   export const formatPhoneNumber = (phone) => { }
│   export const formatLeadStatus = (status) => { }
│
├── dom/
│   ├── scrollToElement.js
│   └── getElementPosition.js
│
└── react-table/
    └── useReactTable.js     # React-Table integration
```

---

### 5. Services Module (Per Feature)

Each feature page has a `services/` folder with API integration:

```
app/pages/dashboards/lead/services/
├── leadService.js
│   export const getLeads = (filters, pagination) => { }
│   export const getLead = (id) => { }
│   export const createLead = (data) => { }
│   export const updateLead = (id, data) => { }
│   export const deleteLead = (id) => { }
│   export const assignLead = (id, agentEmail) => { }
│   export const getWonLeads = () => { }

app/pages/sales/cod-document/services/
├── codService.js
│   export const createCODDocument = (data) => { }
│   export const getCODDocuments = (filters) => { }
│   export const approveCODDocument = (id, status) => { }
│   export const uploadFile = (file) => { }

app/pages/dashboards/sales/services/
├── dashboardService.js
│   export const getDashboardData = (date) => { }
│   export const getSalesAgents = () => { }
│   export const getDailySummary = (date) => { }
│   export const getDailyQuote = () => { }
```

---

## Naming Conventions

### Components

```javascript
// Page components (PascalCase, match route)
export default function LeadForm() { }
export default function LeadList() { }
export default function SalesDashboard() { }

// Functional components (PascalCase)
function AgentCard() { }
function SalesMetric() { }
function ApprovalPanel() { }

// UI components (PascalCase)
function Button() { }
function Card() { }
function Modal() { }

// Hooks (camelCase, prefixed with 'use')
function useApi() { }
function useForm() { }
function useFetchLeads() { }

// Utils/Services (camelCase)
const formatCurrency = () => { }
const validateEmail = () => { }
const ledService = { }
```

### Files

```
// Page files
pages/dashboards/lead/index.jsx      # Main export
pages/dashboards/lead/form.jsx       # Form page
pages/dashboards/lead/LeadList.jsx   # List component
pages/dashboards/lead/LeadForm.jsx   # Form component

// Component files
components/ui/Button/Button.jsx
components/shared/form/FormField.jsx

// Hook files
hooks/useApi.js
hooks/useAuth.js

// Service files
services/leadService.js
services/codService.js

// Utility files
utils/validation.js
utils/formatting.js
utils/api.js

// Style files
components/ui/Button/Button.module.css
styles/app/forms/index.css
styles/variables.css
```

---

## Module Dependencies

```
Atomic UI Components (components/ui/)
         ↓
Shared Components (components/shared/)
         ↓
Page Components (app/pages/)
         ↓
Hooks (hooks/)
         ↓
Utils & Services (utils/, services/)
         ↓
Configs & Constants (configs/, constants/)
```

### Import Example

```javascript
// ❌ Bad - Circular dependency
// components/ui/Button.jsx imports from app/pages/dashboard/DashboardPage.jsx

// ✅ Good - Unidirectional dependency
// app/pages/dashboard/DashboardPage.jsx imports from components/ui/Button.jsx
// app/pages/dashboard/DashboardPage.jsx imports from hooks/useApi.js
// hooks/useApi.js imports from utils/api.js
```

---

## Creating New Features

### Step 1: Create Page Structure

```bash
mkdir -p frontend/src/app/pages/sales/new-feature
mkdir -p frontend/src/app/pages/sales/new-feature/components
mkdir -p frontend/src/app/pages/sales/new-feature/hooks
mkdir -p frontend/src/app/pages/sales/new-feature/services
mkdir -p frontend/src/app/pages/sales/new-feature/utils
mkdir -p frontend/src/app/pages/sales/new-feature/constants
```

### Step 2: Create Main Page Component

```javascript
// frontend/src/app/pages/sales/new-feature/index.jsx
import NewFeaturePage from './NewFeaturePage';
export default NewFeaturePage;
```

### Step 3: Create Feature Components

```javascript
// frontend/src/app/pages/sales/new-feature/NewFeaturePage.jsx
import { useApi } from '@/hooks/useApi';
import { newFeatureService } from './services/newFeatureService';
import NewFeatureList from './components/NewFeatureList';

export default function NewFeaturePage() {
  const { data, loading, error } = useApi('method', {
    method: newFeatureService.getList
  });

  return (
    <div className="new-feature-page">
      <NewFeatureList data={data} loading={loading} />
    </div>
  );
}
```

### Step 4: Create Service Layer

```javascript
// frontend/src/app/pages/sales/new-feature/services/newFeatureService.js
export const newFeatureService = {
  getList: async (filters) => {
    return frappe.call({
      method: 'policy_pro.api.sales.get_new_features',
      args: { filters }
    });
  },

  create: async (data) => {
    return frappe.call({
      method: 'policy_pro.api.sales.create_new_feature',
      args: { ...data }
    });
  },

  update: async (id, data) => {
    return frappe.call({
      method: 'policy_pro.api.sales.update_new_feature',
      args: { id, ...data }
    });
  }
};
```

### Step 5: Add Route

```javascript
// frontend/src/app/router/index.js
const NewFeaturePage = lazy(() => import('@/app/pages/sales/new-feature'));

export const routes = [
  {
    path: '/app/sales/new-feature',
    component: NewFeaturePage,
    name: 'New Feature'
  }
];
```

---

## Best Practices

### 1. Component Composition

```javascript
// ✅ Good - Single responsibility
function AgentCard({ agent }) {
  return (
    <Card>
      <Avatar src={agent.photo} />
      <AgentInfo agent={agent} />
      <AgentStats agent={agent} />
    </Card>
  );
}

// ❌ Bad - Too much logic in one component
function AgentCard({ agent }) {
  // 50+ lines of JSX mixing display, logic, and styling
}
```

### 2. Hook Usage

```javascript
// ✅ Good - Custom hook for business logic
function useLeadData(filters) {
  const { data, loading, error } = useApi('method', {
    method: 'policy_pro.api.sales.get_leads',
    args: { filters }
  });
  return { data, loading, error };
}

// ❌ Bad - API calls in component
function LeadList() {
  useEffect(() => {
    frappe.call({ method: '...' }).then(r => {
      // Processing in component
    });
  }, []);
}
```

### 3. State Management

```javascript
// ✅ Good - Use React Context for global state
const { user, roles } = useAuth();
const { theme, setTheme } = useTheme();

// ❌ Bad - Prop drilling
<Component user={user} roles={roles} theme={theme} ... />
```

### 4. API Integration

```javascript
// ✅ Good - Service layer abstraction
const leads = await leadService.getLeads(filters);

// ❌ Bad - Direct API calls scattered
const leads = await frappe.call({
  method: 'policy_pro.api.sales.get_leads',
  args: { filters }
});
```

### 5. Styling

```javascript
// ✅ Good - CSS Modules or Tailwind
import styles from './Button.module.css';

// ✅ Good - Tailwind utilities
<button className="px-4 py-2 bg-blue-500 text-white rounded" />

// ❌ Bad - Inline styles
<button style={{ padding: '8px 16px', background: 'blue' }} />
```

---

## File Size Guidelines

| Type | Recommended Max Size |
|---|---|
| Page Component | 300 lines |
| Feature Component | 200 lines |
| UI Component | 150 lines |
| Hook | 100 lines |
| Service/Util | 150 lines |

If exceeding, split into smaller components.

---

## Testing Structure

```
frontend/src/
├── app/pages/dashboards/lead/
│   ├── LeadForm.jsx
│   ├── LeadForm.test.jsx        # Component tests
│   └── hooks/
│       ├── useFetchLeads.js
│       └── useFetchLeads.test.js # Hook tests
├── components/ui/Button/
│   ├── Button.jsx
│   └── Button.test.jsx
└── utils/
    ├── validation.js
    └── validation.test.js       # Utility tests
```

---

## Performance Optimization

### Code Splitting

```javascript
// ✅ Lazy load page components
const LeadPage = lazy(() => import('@/app/pages/dashboards/lead'));
const SalesDashboard = lazy(() => import('@/app/pages/dashboards/sales'));

<Suspense fallback={<Spinner />}>
  <LeadPage />
</Suspense>
```

### Memoization

```javascript
// ✅ Memoize expensive components
const AgentCard = memo(function AgentCard({ agent }) {
  return <Card>...</Card>;
});

// ✅ Memoize callbacks
const handleAssign = useCallback((leadId) => {
  assignLead(leadId);
}, []);
```

### Virtual Scrolling

```javascript
// ✅ Use virtual scrolling for large lists
<VirtualList
  items={leads}
  renderItem={(lead) => <LeadRow lead={lead} />}
  height={600}
  itemHeight={80}
/>
```

---

## Environment Configuration

```javascript
// frontend/src/configs/env.js
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  APP_NAME: 'Policy Pro',
  DEBUG: import.meta.env.DEV
};
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system design
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Frontend development phase
- [README.md](../README.md) - Quick start guide

---

## Summary

The frontend structure follows these principles:

1. **Modularity** - Each feature is self-contained
2. **Scalability** - Easy to add new features
3. **Reusability** - UI components and hooks are reusable
4. **Maintainability** - Clear separation of concerns
5. **Performance** - Code splitting and optimization built-in
6. **Testability** - Tests live alongside code

This structure enables teams to work independently on different features while maintaining code quality and consistency.
