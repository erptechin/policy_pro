# Policy Pro Documentation Index

Welcome to the Policy Pro documentation. This is your guide to understanding and implementing the CRM and Sales Management system.

## Quick Navigation

### For Project Managers & Stakeholders
- Start with: [README.md](../README.md) - Project overview and features
- Then read: [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Timeline and phases

### For Developers

#### Backend Developers
- Start with: [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md) - Backend organization
- Then read: [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API guide
- Reference: [ROLES_PERMISSIONS.md](./ROLES_PERMISSIONS.md) - Access control

#### Frontend Developers
- Start with: [FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md) - Frontend organization
- Reference: [ARCHITECTURE.md](./ARCHITECTURE.md) - System design

#### Full-Stack Developers
- Start with: [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- Then read: [DOCTYPES.md](./DOCTYPES.md) - Data models
- Then read: [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md) - Backend organization
- Then read: [FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md) - Frontend organization
- Reference: [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API guide
- Reference: [ROLES_PERMISSIONS.md](./ROLES_PERMISSIONS.md) - Access control

### For DevOps & Administrators
- Start with: [README.md](../README.md#development-setup) - Setup instructions
- Then read: [ARCHITECTURE.md](./ARCHITECTURE.md#deployment-architecture) - Deployment
- Reference: [IMPLEMENTATION.md](./IMPLEMENTATION.md#deployment-plan) - Deployment phases

---

## Documentation Structure

### 1. [README.md](../README.md)
**What**: Project overview and getting started guide
**Contains**:
- Feature list
- Installation instructions
- Development setup
- Project structure overview
- Contributing guidelines

**Read time**: 5-10 minutes
**Audience**: Everyone

---

### 2. [ARCHITECTURE.md](./ARCHITECTURE.md)
**What**: Technical system design and architecture
**Contains**:
- System overview
- Backend architecture (directory structure, modules)
- Frontend architecture (directory structure, components)
- Data flow diagrams
- API contract specifications
- Real-time communication design
- Database schema
- Workflow diagrams
- Security considerations
- Performance optimization strategies

**Read time**: 20-30 minutes
**Audience**: Developers, Architects

---

### 3. [IMPLEMENTATION.md](./IMPLEMENTATION.md)
**What**: Phase-by-phase implementation roadmap
**Contains**:
- 7 development phases with timeline
- Detailed tasks for each phase
- Deliverables for each phase
- Development best practices
- Testing strategy
- Deployment checklist
- Success metrics

**Phases**:
1. Lead Management Enhancements (Week 1-2)
2. Lead Assignment Automation (Week 2-3)
3. COD Document Workflow (Week 3-5)
4. Sales Dashboard (Week 5-7)
5. Real-Time Updates & Integration (Week 7-8)
6. Testing & QA (Week 8)
7. Deployment (Week 9)

**Read time**: 30-40 minutes
**Audience**: Project managers, Developers, QA

---

### 4. [DOCTYPES.md](./DOCTYPES.md)
**What**: Custom DocType specifications
**Contains**:
- Lead DocType (Extended)
  - Extended fields (call-back management, assignment tracking)
  - Validation rules
  - Document events
  - Permissions
- COD Document DocType (New)
  - Header fields
  - Link fields
  - Approval fields
  - Child table structure
  - Workflow states
  - Document events
  - Permissions
  - Custom methods
- Lead Assignment Rule DocType (Optional)
  - Assignment methods
  - Configuration fields
- Database schema

**Read time**: 20-25 minutes
**Audience**: Backend developers, Database administrators

---

### 5. [API_ENDPOINTS.md](./API_ENDPOINTS.md)
**What**: Complete API reference
**Contains**:
- Authentication methods
- Lead Management APIs (6 endpoints)
- Sales Dashboard APIs (5 endpoints)
- COD Document APIs (4 endpoints)
- Webhook APIs (1 endpoint)
- Error handling
- Rate limiting
- Pagination
- Field validation
- Testing guide

**Read time**: 25-30 minutes
**Audience**: Backend developers, Frontend developers, API integrators

---

### 6. [ROLES_PERMISSIONS.md](./ROLES_PERMISSIONS.md)
**What**: Role-based access control guide
**Contains**:
- Role hierarchy
- 6 role definitions with permissions:
  - System Manager
  - Company Manager
  - CEO
  - Sales Manager
  - Sales User
  - Sales Agent
- DocType permission matrices
- Field-level permissions
- Custom permission functions
- Implementation code samples
- Testing guidelines
- Security best practices
- Troubleshooting guide

**Read time**: 25-30 minutes
**Audience**: Architects, Security personnel, Backend developers

---

### 7. [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md)
**What**: Backend folder organization and patterns
**Contains**:
- Directory tree with descriptions
- Module structure details:
  - API layer (`api/` folder)
  - Utils & setup (`utils/` folder)
  - Custom DocTypes (`policy_pro/custom/`)
  - Main app hooks configuration
- Naming conventions for files and functions
- Best practices for:
  - Error handling
  - Permission checks
  - Database queries
  - API responses
  - Logging
- Performance optimization techniques
- Testing examples (using Frappe CLI and cURL)
- Quick reference table

**Read time**: 25-30 minutes
**Audience**: Backend developers, Architects

---

### 8. [FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md)
**What**: Frontend folder organization and patterns
**Contains**:
- Complete directory tree with descriptions
- Module structure details:
  - Pages module (`app/pages/`)
  - Components module (`components/`)
  - Hooks module (`hooks/`)
  - Utils & services
  - Configuration & constants
- Specific folder structures for each feature:
  - Lead Dashboard
  - Sales Dashboard
  - COD Document management
- Naming conventions for components, files, hooks
- Module dependencies and import patterns
- Step-by-step guide to creating new features
- Best practices for:
  - Component composition
  - Hook usage
  - State management
  - API integration
  - Styling
- File size guidelines
- Testing structure
- Performance optimization (code splitting, memoization, virtual scrolling)
- Environment configuration

**Read time**: 25-30 minutes
**Audience**: Frontend developers, Full-stack developers

---

## Quick Reference

### User Workflows

#### Lead Creation & Assignment
```
Sales Agent creates Lead
  ↓
Lead validation (all fields required)
  ↓
Auto-assignment to agent (if rule exists)
  ↓
Sales Manager can reassign
  ↓
Sales User can assign from won leads
```

#### COD Approval Workflow
```
Sales Agent uploads COD documents
  ↓
Company Manager approves
  ↓
CEO gives final approval
  ↓
Dashboard updates automatically
```

#### Dashboard Access
```
Sales Agent: Personal metrics
Sales User: Summary view + assignment controls
Sales Manager: Full visibility + assignment
CEO: Full visibility (read-only)
```

---

## Key Files in the Project

### Backend
```
policy_pro/
├── api/
│   ├── hooks.py              # Document event handlers
│   ├── sales.py              # Sales dashboard APIs
│   ├── custom.py             # Custom business logic
│   ├── auth.py               # Auth utilities
│   └── utils.py              # Helper functions
├── policy_pro/custom/
│   ├── lead.json             # Extended Lead DocType
│   ├── cod_document.json     # COD Document DocType
│   └── cod_document_item.json # Child table
├── utils/
│   └── after_app_install.py  # Role setup & initialization
└── hooks.py                  # App hooks
```

### Frontend
```
frontend/src/app/
├── pages/
│   ├── dashboards/lead/      # Lead forms & lists
│   ├── dashboards/sales/     # Sales dashboard
│   └── sales/cod-document/   # COD forms & lists
├── components/
│   ├── dashboards/           # Dashboard components
│   ├── forms/                # Form components
│   └── shared/               # Shared components
└── hooks/
    ├── useApi.js             # API hook
    ├── useAuth.js            # Auth hook
    └── useRealtime.js        # Real-time hook
```

---

## Getting Started Checklist

### Day 1-2: Understand the System
- [ ] Read README.md
- [ ] Read ARCHITECTURE.md
- [ ] Review DOCTYPES.md
- [ ] Understand role hierarchy (ROLES_PERMISSIONS.md)

### Day 3-4: API Understanding
- [ ] Review all API endpoints (API_ENDPOINTS.md)
- [ ] Test endpoints with Postman/cURL
- [ ] Review frontend API integration

### Day 5+: Implementation
- [ ] Follow IMPLEMENTATION.md phases
- [ ] Start with Phase 1 (Lead Management)
- [ ] Reference specific docs as needed

---

## Common Questions Answered

### Q: Where do I start implementing?
**A**: Start with Phase 1 in IMPLEMENTATION.md - Lead Management Enhancements. It's foundational for all other features.

### Q: How do permissions work?
**A**: Review ROLES_PERMISSIONS.md. Key concept: permission queries filter documents at database level based on user role.

### Q: What's the API contract?
**A**: See API_ENDPOINTS.md. Each endpoint documents parameters, responses, and error codes.

### Q: How are documents structured?
**A**: See DOCTYPES.md. Each DocType is fully documented with fields, validations, and workflows.

### Q: What's the deployment process?
**A**: See IMPLEMENTATION.md Phase 6-7 and ARCHITECTURE.md Deployment section.

---

## File Mapping

| Topic | Main Doc | Secondary Docs |
|---|---|---|
| Project Overview | README.md | - |
| System Design | ARCHITECTURE.md | DOCTYPES.md, ROLES_PERMISSIONS.md |
| Implementation | IMPLEMENTATION.md | ARCHITECTURE.md |
| Backend Organization | BACKEND_STRUCTURE.md | API_ENDPOINTS.md, ROLES_PERMISSIONS.md |
| Frontend Organization | FRONTEND_STRUCTURE.md | ARCHITECTURE.md |
| Data Models | DOCTYPES.md | API_ENDPOINTS.md, BACKEND_STRUCTURE.md |
| APIs | API_ENDPOINTS.md | ARCHITECTURE.md, BACKEND_STRUCTURE.md |
| Access Control | ROLES_PERMISSIONS.md | API_ENDPOINTS.md |

---

## Document Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2024-11-01 | Initial documentation structure |

---

## How to Use This Documentation

1. **As a Reference**: Use the index to find specific topics
2. **For Implementation**: Follow IMPLEMENTATION.md phases and reference other docs as needed
3. **For Questions**: Search across docs or check Common Questions above
4. **For API Development**: Use API_ENDPOINTS.md as your primary reference

---

## Contributing to Documentation

When updating documentation:

1. Update the relevant doc file
2. Update this INDEX.md if structure changes
3. Maintain consistent formatting (Markdown)
4. Include examples where helpful
5. Keep table of contents updated

---

## Support & Contact

For documentation issues or suggestions:
- Create a GitHub issue in the repository
- Reference the specific documentation file
- Describe the improvement needed

---

**Last Updated**: November 1, 2024
**Maintained By**: Development Team
**Status**: Active
