# RentalConnects Frontend - Complete Documentation

**Version:** 1.0.0  
**Last Updated:** January 11, 2026  
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Setup & Installation](#setup--installation)
4. [Features & Functionality](#features--functionality)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [Routing & Navigation](#routing--navigation)
8. [Authentication & Authorization](#authentication--authorization)
9. [UI Components](#ui-components)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

RentalConnects is a comprehensive rental management platform frontend built with React 19 and Vite. It provides a complete solution for tenants, landlords, artisans, admins, and super admins to manage rental properties, bookings, payments, messaging, and more.

### Key Highlights

- ✅ **Production Ready** - Fully tested and documented
- ✅ **Role-Based Access Control** - Granular permissions for all roles
- ✅ **Freemium/Premium Model** - Dynamic subscription management
- ✅ **Hybrid Mock/Real API** - Seamless development and production modes
- ✅ **PWA Ready** - Installable and offline-capable
- ✅ **Multi-Language Support** - English and French
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Dark/Light Mode** - Full theme support

---

## Architecture & Tech Stack

### Core Technologies

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **React Router v7** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **CryptoJS** - Encryption
- **React Hook Form** - Form handling
- **Zod** - Validation

### Key Libraries

- **@paystack/inline-js** - Payment processing
- **@cloudinary/react** - Image uploads
- **react-leaflet** - Maps
- **react-hot-toast** - Notifications
- **date-fns** - Date utilities
- **recharts** - Data visualization

### Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/           # Page components
├── services/        # API service layer
├── stores/          # Zustand state stores
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── routes/          # Route definitions
├── config/          # Configuration files
└── mocks/           # Mock data for development
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RentalConnects
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_USE_MOCK=true
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Run tests**
   ```bash
   npm test
   ```

---

## Features & Functionality

### 1. Authentication & User Management

- **Signup** - Role-based registration (Tenant, Landlord, Artisan)
- **Login/Logout** - JWT-based authentication
- **Password Reset** - Email-based password recovery
- **Account Approval** - Admin approval for Landlords and Artisans
- **Profile Management** - Complete user profiles with verification

### 2. Property Management

- **Property Listing** - Create, edit, delete properties
- **Property Search** - Advanced filtering and search
- **Property Details** - Comprehensive property pages with maps
- **Image Upload** - Cloudinary integration
- **Property Approval** - Admin approval workflow

### 3. Booking & Viewing Requests

- **Viewing Requests** - Tenants can request property viewings
- **Booking Management** - Landlords manage booking requests
- **Calendar View** - Visual calendar for bookings
- **Status Tracking** - Pending, accepted, declined states

### 4. Payments & Wallets

- **Wallet Setup** - Required for Landlords, Artisans, Admins
- **Wallet Top-Up** - Paystack integration
- **Premium Upgrades** - Subscription management
- **Transaction History** - Complete payment records
- **Receipts** - Automatic email receipts for all transactions

### 5. Messaging & Chat

- **Real-time Chat** - End-to-end encrypted messaging
- **Conversation Management** - Create and manage conversations
- **Role-Based Rules** - Strict messaging permissions
- **Notifications** - Toast and sound notifications
- **File Attachments** - Support for file sharing

### 6. Ratings & Reviews

- **Property Reviews** - Tenants review properties and landlords
- **Tenant Reviews** - Landlords review tenants
- **Artisan Ratings** - Job-based ratings
- **Trust Scores** - Calculated trust metrics
- **Review Moderation** - Admin moderation system

### 7. Ads System

- **Ad Creation** - Landlords and Artisans create ads
- **Ad Management** - CRUD operations for ads
- **Dynamic Pricing** - Super Admin controlled pricing
- **Role-Based Visibility** - Plan and role-based ad display

### 8. Admin & Super Admin

- **User Management** - Approve, suspend, delete users
- **Property Approvals** - Approve property listings
- **Role Delegation** - Granular permission assignment
- **Audit Logs** - Complete action tracking
- **System Announcements** - Platform-wide announcements

### 9. Freemium & Premium

- **Upgrade Flows** - Seamless premium upgrades
- **Feature Gating** - Premium feature protection
- **Dynamic Pricing** - API-driven pricing
- **Subscription Management** - Monthly/yearly plans

---

## API Integration

### API Client Configuration

The app uses a centralized API client (`src/services/apiClient.js`) with:
- JWT token injection
- Trailing slash normalization (Django compatibility)
- Error handling
- Request/response interceptors
- Mock mode support

### Service Layer

All API calls are abstracted through service files:
- `authService.js` - Authentication
- `propertyService.js` - Properties
- `walletService.js` - Wallets & payments
- `messagesService.js` - Messaging
- `reviewService.js` - Reviews & ratings
- `adsService.js` - Advertisements
- `adminService.js` - Admin operations

### Mock Mode

The app supports full mock mode for development:
- Set `VITE_USE_MOCK=true` in `.env`
- All services work without backend
- Mock data stored in `src/mocks/`
- Seamless switching between mock and real API

---

## State Management

### Zustand Stores

- **authStore** - User authentication state
- **featureStore** - Premium/subscription state

### React Context

- **ThemeContext** - Dark/light mode
- **LanguageContext** - Multi-language support
- **FeatureAccessContext** - Feature access control

---

## Routing & Navigation

### Route Structure

- **Public Routes** - Landing, properties, blog
- **Auth Routes** - Login, signup, password reset
- **Protected Routes** - Role-based dashboard routes

### Route Protection

- `RoleProtectedRoute` - Role-based access
- `FeatureProtectedRoute` - Premium feature gating
- Automatic redirects based on user role

---

## Authentication & Authorization

### JWT Authentication

- Tokens stored in localStorage
- Automatic token refresh
- Session restoration on page load

### Role-Based Access Control

**Roles:**
- Tenant
- Landlord
- Artisan
- Admin (with granular permissions)
- Super Admin

**Permissions:**
- User approvals
- Property approvals
- Review moderation
- System management
- And more...

---

## UI Components

### Component Library

- **Button** - Primary, secondary, outline variants
- **Card** - Container components
- **Modal** - Dialog modals
- **Form** - Form inputs and validation
- **Toast** - Notification toasts
- **Loading** - Loading states

### Custom Components

- **WalletDisplay** - Wallet balance and setup
- **PropertyMapView** - Interactive maps
- **ReviewCard** - Review display
- **UpgradeBanner** - Premium upgrade CTAs
- **EmailStatusBanner** - Email status display

---

## Testing

### Test Setup

- **Vitest** - Test runner
- **Testing Library** - Component testing
- **jsdom** - DOM simulation

### Test Coverage

- Service worker registration
- PWA configuration
- Authentication flows
- Component rendering
- Encryption functionality
- Store operations

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --run     # Single run
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] Set `VITE_USE_MOCK=false`
- [ ] Configure production API URL
- [ ] Set Paystack production keys
- [ ] Configure Cloudinary credentials
- [ ] Run tests: `npm test`
- [ ] Build: `npm run build`
- [ ] Verify build output

### Deployment Options

1. **Vercel** (Recommended)
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Netlify**
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod
   ```

3. **Traditional Server**
   - Build: `npm run build`
   - Upload `dist/` folder
   - Configure Nginx/Apache

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## Troubleshooting

### Common Issues

**Build Errors:**
- Clear `node_modules` and reinstall
- Check Node.js version (18+)
- Verify all environment variables

**API Errors:**
- Check `VITE_API_BASE_URL`
- Verify backend is running
- Check CORS configuration

**Language Not Changing:**
- Clear browser cache
- Check `LanguageProvider` is in `main.jsx`
- Verify translation keys exist

**Wallet Not Showing:**
- Check user role (Landlord, Artisan, Admin)
- Verify wallet is loaded
- Check `needsWallet` logic

---

## Additional Resources

- **API Contracts:** `FRONTEND_API_CONTRACTS.md`
- **Changelog:** `FRONTEND_CHANGELOG.md`
- **Overview:** `FRONTEND_OVERVIEW.md`
- **Mock Mode:** `MOCK_MODE_GUIDE.md`
- **Deployment:** `DEPLOYMENT_GUIDE.md`
- **Verification:** `CORE_TASKS_VERIFICATION.md`

---

**Last Updated:** January 11, 2026  
**Maintained By:** Development Team  
**Status:** ✅ Production Ready

