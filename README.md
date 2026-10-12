# CRM Dashboard: React Frontend

A responsive **CRM dashboard** for managing clients and invoices, built on a Laravel REST API.

**React · React Router · Tailwind CSS · Axios · Headless UI**

Backend: [CRMAPPBACK](https://github.com/djordjeradosav/CRMAPPBACK) (Laravel 12 + Sanctum)

## Features

- **Authentication**: login/register with token auth, an `AuthContext` and protected routes
- **Dashboard**: overview of clients and invoices
- **Clients**: list, search, sort, filter, add, edit and delete
- **Invoices**: create invoices per client, filter by status (pending / paid / overdue), export
- **Settings** page
- Sidebar layout, responsive on desktop and mobile

## Structure

```
src/
├── components/
│   ├── common/      # reusable buttons: search, filter, sort, add client
│   ├── layout/      # DashboardLayout, Sidebar, ProtectedRoute
│   └── services/    # api.js (Axios instance), clientService, invoiceService
├── context/         # AuthContext
└── pages/           # Dashboard, Clients, Invoices, Settings, AuthPages
```

## Getting started

```bash
git clone https://github.com/djordjeradosav/CRMFINALE.git
cd CRMFINALE
npm install
cp .env.example .env   # set REACT_APP_API_URL to your backend URL
npm start              # http://localhost:3000
```
