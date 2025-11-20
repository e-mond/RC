
# 🏡 Rental Connects (RC)

**Rental Connects (RC)** is a modern, scalable, and role-driven rental ecosystem built specifically for Ghana’s housing market.  
It connects **Tenants**, **Landlords**, **Artisans**, **Admins**, and **Super Admins** in one secure, well-structured platform — enabling seamless renting, smooth communication, and digital trust.

Live Demo: [https://rental-connects.vercel.app](https://rental-connects.vercel.app) *(coming soon)*  
GitHub: https://github.com/e-mond/RC

---

## 🚀 Project Status (November 2025)

### Completed ✅
- Fully implemented role system:
  - Tenant
  - Landlord
  - Artisan
  - Admin
  - Super Admin (highest authority)
- Role-specific dashboards
- JWT authentication with role-based redirection
- Robust RBAC (Role-Based Access Control)
- Admin permission system (toggleable by Super Admin)
- Mock + Real API toggle for development/production
- Clean, scalable folder structure

---

## 🧱 Tech Stack

| Category         | Technology                           |
|------------------|---------------------------------------|
| Framework        | React 18 + Vite                       |
| Styling          | Tailwind CSS                          |
| Animation        | Framer Motion                         |
| State Management | React Context + Zustand               |
| Routing          | React Router v6                       |
| Authentication   | JWT                                   |
| API Client       | Axios                                 |
| API Mode         | Real + Mock (toggleable)              |
| Deployment       | Vercel                                |

---

## 📂 Folder Structure

```bash
src/
├─ main.jsx
├─ App.jsx
├─ index.css
├─ routes/
│  ├─ index.jsx
│  ├─ secureRoutes.jsx
│  ├─ RoleProtectedRoute.jsx
│  └─ PublicRoute.jsx
├─ context/
│  ├─ AuthProvider.jsx
│  └─ PermissionsContext.js
├─ stores/
│  └─ authStore.js                 # Zustand store for role & permissions
├─ services/
│  ├─ apiClient.js
│  ├─ authService.js
│  ├─ userService.js
│  ├─ adminService.js
│  ├─ superAdminService.js
│  ├─ propertyService.js
│  └─ mock/
│     ├─ mockAuth.js
│     ├─ mockUsers.js
│     ├─ mockAdmin.js
│     └─ mockToggle.js            # DEV/PROD API switch
├─ components/
│  ├─ layout/
│  │  ├─ DashboardLayout.jsx
│  │  ├─ Sidebar.jsx
│  │  └─ Navbar.jsx
│  └─ ui/                          # Shared UI components
├─ pages/
│  ├─ Landing/
│  ├─ Auth/
│  ├─ Dashboards/
│  │  ├─ Tenant/
│  │  ├─ Landlord/
│  │  ├─ Artisan/
│  │  ├─ Admin/
│  │  │  ├─ AdminDashboard.jsx
│  │  │  └─ components/
│  │  │     ├─ AD_UserApprovals.jsx
│  │  │     ├─ AD_PropertyApprovals.jsx
│  │  │     ├─ AD_SystemInsights.jsx
│  │  │     ├─ AD_MaintenanceOverview.jsx
│  │  │     └─ AD_ReportsPanel.jsx
│  │  └─ SuperAdmin/
│  │     ├─ SuperAdminDashboard.jsx
│  │     ├─ users/ (SA_UsersPage, tables, modals)
│  │     ├─ roles/ (SA_RolesPage, assign modal)
│  │     └─ audit/ (SA_AuditPage, filters, table)
└─ utils/
   ├─ constants.js
   ├─ roles.js
   ├─ helpers.js
   └─ devtools.js
```

---

## 🔐 Authentication & RBAC

- **AuthProvider**: Handles JWT, loads user profile, redirects by role
- **AuthStore (Zustand)**: Caches role & permission flags
- **RoleProtectedRoute**: Route-level access control (supports single or multiple roles)
- **Permission-based UI**: Admin widgets appear only if Super Admin grants permission

### Admin Permissions (Toggleable by Super Admin)

| Widget                  | Permission Flag            |
|-------------------------|----------------------------|
| User approvals          | `canApproveUsers`          |
| Property approvals      | `canApproveProperties`     |
| System insights         | `canViewInsights`          |
| Reports dashboard       | `canViewReports`           |
| Maintenance overview    | `canManageMaintenance`     |

---

## 🧪 Mock vs Real API Mode

Switch between mock and real backend easily:

```env
# .env
VITE_USE_MOCK_API=true   # Development (uses mock data)
VITE_USE_MOCK_API=false  # Production (real backend)
```

Controlled via `services/mock/mockToggle.js`

---

## 🛠 Setup & Installation

```bash
git clone https://github.com/e-mond/RC.git
cd RC
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📌 Roadmap

### Done ✅
- Authentication & RBAC
- Role-based dashboards & routing
- Super Admin panel (Users, Roles, Audit)
- Admin dynamic permissions
- Mock/Real API toggle

### In Progress 🔄
- Landlord–Tenant rent payment workflow
- Maintenance request system
- Payment integration (Flutterwave / MTN MoMo)
- Real-time chat & notifications

### Planned
- Mobile app (React Native / Expo)
- Property verification with GPS & photos
- Credit scoring for tenants

---

## 📞 Contact & Author

**Author**: E-Mond  
**GitHub**: [@e-mond](https://github.com/e-mond)  
**Project**: Rental Connects (RC) – Solving Ghana’s rental chaos, one connection at a time.

---

⭐ **Star this repo if you find it useful!**  
Contributions, issues, and feature requests are welcome!
```
