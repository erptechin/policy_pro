# Policy Pro - CRM and Sales Management App

A comprehensive ERPNext application for managing leads, sales operations, COD (Certificate of Delivery) workflows, and sales dashboards.

## Features

- **Lead Management**: Complete lead entry process with validation and automated assignment
- **Lead Assignment Automation**: Intelligent lead distribution to sales agents (round-robin, territory-based, load-balancing)
- **Call-Back Management**: Schedule and track callback dates/times with notes
- **COD Document Workflow**: Upload and manage COD documents with multi-level approvals
- **Sales Dashboard**: Real-time sales metrics, agent performance, and motivational content
- **Real-Time Notifications**: Instant updates for new leads and critical events
- **Role-Based Access Control**: Sales User, Sales Manager, Sales Agent roles with granular permissions

## Quick Start

### Installation

Install via [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app policy_pro
```

### Development Setup

1. Clone and install the app
2. Install pre-commit hooks:

```bash
cd apps/policy_pro
pre-commit install
```

3. Set up frontend dependencies:

```bash
cd frontend
npm install
npm run dev
```

4. Start the development server:

```bash
cd $PATH_TO_YOUR_BENCH
bench start
```

## Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md) - System design and module structure
- [Implementation Guide](./docs/IMPLEMENTATION.md) - Phase-by-phase implementation roadmap
- [Custom DocTypes](./docs/DOCTYPES.md) - Lead, COD Document, and other custom types
- [API Endpoints](./docs/API_ENDPOINTS.md) - Complete API reference
- [Roles & Permissions](./docs/ROLES_PERMISSIONS.md) - User roles and access control

## Project Structure

```
policy_pro/
├── policy_pro/                 # Backend Python package
│   ├── api/                   # API endpoints
│   │   ├── hooks.py          # Document event hooks
│   │   ├── sales.py          # Sales APIs
│   │   └── custom.py         # Other custom APIs
│   ├── policy_pro/
│   │   └── custom/           # Custom DocType definitions
│   ├── utils/                # Utility functions
│   ├── hooks.py              # App hooks configuration
│   └── __init__.py
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/        # Page components
│   │   │   ├── components/   # Reusable components
│   │   │   └── hooks/        # Custom React hooks
│   │   └── configs/          # Configuration files
│   └── package.json
├── docs/                       # Documentation
└── README.md
```

## Development Tools

This app uses pre-commit hooks for code quality:

- **ruff** - Python linter and formatter
- **eslint** - JavaScript linter
- **prettier** - Code formatter
- **pyupgrade** - Python syntax modernization

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure pre-commit hooks pass
4. Submit a pull request

## License

MIT
