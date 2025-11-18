# Rental Connects Frontend - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Key Components](#key-components)
4. [Critical Workflows](#critical-workflows)
5. [Dependencies](#dependencies)
6. [Setup Instructions](#setup-instructions)

---

## 1. Project Overview

### Purpose
**Rental Connects (RC)** is a modern, responsive web platform that connects **tenants**, **landlords**, and **artisans** in Ghana's rental ecosystem. The platform addresses challenges with trust, communication, and efficiency in the rental industry by providing:

- **Tenants**: Verified property listings, secure rent payments, and rental history management
- **Landlords**: Property listing management, rent collection, and tenant analytics
- **Artisans**: Service profiles, client connections, and service request management

### Architecture

The frontend is built as a **Single Page Application (SPA)** using:

- **React 19** with **Vite** as the build tool
- **React Router v7** for client-side routing
- **Context API** for global state management (authentication, theme, language)
- **Axios** for HTTP requests with interceptors for authentication
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations and transitions

#### Architecture Patterns

1. **Component-Based Architecture**: Modular, reusable React components organized by feature
2. **Service Layer Pattern**: API calls abstracted into service modules
3. **Context API Pattern**: Global state (auth, theme, language) managed via React Context
4. **Route Protection**: Role-based access control for protected routes
5. **Progressive Enhancement**: Mobile-first responsive design

#### Key Design Decisions

- **JWT Token Authentication**: Tokens stored in localStorage with automatic injection via Axios interceptors
- **Role-Based Routing**: Dynamic redirects based on user role after login
- **Animated Route Transitions**: Framer Motion for smooth page transitions
- **Modular Form Components**: Role-specific signup forms with shared base components
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints

---

## 2. File Structure

```
RC/
├── public/                          # Static assets
│   └── vite.svg
├── src/
│   ├── main.jsx                    # Application entry point
│   ├── App.jsx                     # Root component with routing
│   ├── index.css                   # Global styles
│   │
│   ├── assets/                     # Static assets
│   │   └── images/                 # Image files
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── ui/                     # Base UI components
│   │   │   ├── Button.jsx          # Universal button component
│   │   │   ├── Input.jsx           # Form input component
│   │   │   ├── Select.jsx          # Dropdown select component
│   │   │   ├── Modal.jsx           # Modal dialog component
│   │   │   └── Card.jsx            # Card container component
│   │   ├── layout/                 # Layout components
│   │   │   ├── Navbar.jsx          # Main navigation bar
│   │   │   ├── Sidebar.jsx         # Dashboard sidebar
│   │   │   ├── Footer.jsx          # Site footer
│   │   │   ├── DashboardLayout.jsx # Dashboard wrapper
│   │   │   └── PublicLayout.jsx    # Public page wrapper
│   │   ├── common/                 # Shared components
│   │   │   ├── Sidebar.jsx         # Common sidebar
│   │   │   ├── Topbar.jsx          # Dashboard topbar
│   │   │   ├── StatsCard.jsx       # Statistics card
│   │   │   ├── DataTable.jsx       # Data table component
│   │   │   ├── NotificationDropdown.jsx
│   │   │   └── UserAvatar.jsx
│   │   ├── onboarding/             # Onboarding flow components
│   │   │   ├── RoleSelection.jsx   # Role selection page
│   │   │   ├── RoleCard.jsx        # Role card component
│   │   │   ├── ProgressIndicator.jsx
│   │   │   ├── OnboardingHeader.jsx
│   │   │   └── OnboardingFooter.jsx
│   │   └── shared/                 # Shared feature components
│   │       ├── PropertyCard.jsx
│   │       ├── ReviewCard.jsx
│   │       ├── AdsBanner.jsx
│   │       └── LoadingSpinner.jsx
│   │
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.js          # Auth context definition
│   │   ├── AuthProvider.jsx        # Auth provider implementation
│   │   ├── ThemeContext.jsx        # Theme context
│   │   └── LanguageContext.jsx     # i18n context
│   │
│   ├── pages/                      # Page components
│   │   ├── Landing/                # Landing page
│   │   │   ├── LandingPage.jsx
│   │   │   └── components/         # Landing page sections
│   │   ├── Auth/                   # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── components/         # Auth form components
│   │   ├── Dashboards/             # Role-specific dashboards
│   │   │   ├── TenantDashboard.jsx
│   │   │   ├── LandlordDashboard.jsx
│   │   │   ├── ArtisanDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── SuperAdminDashboard.jsx
│   │   ├── Tenant/                 # Tenant-specific pages
│   │   ├── Landlord/               # Landlord-specific pages
│   │   ├── Artisan/                # Artisan-specific pages
│   │   ├── Admin/                  # Admin pages
│   │   ├── LearnMore/              # Learn more page
│   │   ├── Blog.jsx                # Blog listing
│   │   └── BlogPost.jsx            # Individual blog post
│   │
│   ├── routes/                     # Routing configuration
│   │   ├── index.jsx               # Route definitions (currently empty)
│   │   ├── ProtectedRoute.jsx      # Protected route wrapper
│   │   ├── PublicRoute.jsx         # Public route wrapper
│   │   └── RoleRedirect.jsx        # Role-based redirect logic
│   │
│   ├── services/                   # API service layer
│   │   ├── apiClient.js            # Axios instance with interceptors
│   │   ├── authService.js          # Authentication API calls
│   │   ├── signupService.js        # User registration
│   │   ├── propertyService.js      # Property management
│   │   ├── artisanService.js       # Artisan services
│   │   ├── tenantService.js        # Tenant services
│   │   ├── userService.js          # User management
│   │   ├── adsService.js           # Advertisement services
│   │   └── notificationService.js  # Notifications
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.js              # Auth hook (wrapper)
│   │   ├── useDebounce.js          # Debounce utility hook
│   │   ├── useFetch.js             # Data fetching hook
│   │   ├── useLanguage.js          # Language/i18n hook
│   │   └── useRoleRedirect.js      # Role redirect hook
│   │
│   ├── utils/                      # Utility functions
│   │   ├── constants.js            # App constants
│   │   ├── roles.js                # Role definitions
│   │   ├── validationSchemas.js    # Form validation
│   │   ├── encryption.js           # Encryption utilities
│   │   └── formatDate.js           # Date formatting
│   │
│   ├── styles/                     # Additional stylesheets
│   │   ├── buttons.css
│   │   ├── dashboard.css
│   │   ├── forms.css
│   │   └── theme.js
│   │
│   └── data/                       # Static data
│       └── posts.js                 # Blog posts data
│
├── dist/                           # Production build output
├── node_modules/                   # Dependencies
├── .husky/                         # Git hooks
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── eslint.config.js                # ESLint configuration
└── README.md                       # Project README
```

### Key Directories Explained

- **`src/components/`**: Reusable UI components organized by purpose (ui, layout, common, onboarding, shared)
- **`src/pages/`**: Full page components organized by feature/role
- **`src/services/`**: API communication layer - all HTTP requests abstracted here
- **`src/context/`**: Global state management via React Context API
- **`src/routes/`**: Route configuration and route protection logic
- **`src/hooks/`**: Custom React hooks for reusable logic
- **`src/utils/`**: Pure utility functions and constants

---

## 3. Key Components

### 3.1 Authentication Components

#### `AuthProvider` (`src/context/AuthProvider.jsx`)

Global authentication state provider that manages user session, login, and logout.

**Props:**
- `children` (ReactNode): Child components to wrap

**Returns:**
- Context provider with value: `{ user, loading, handleLogin, logout }`

**Context Value:**
- `user` (Object | null): Current authenticated user object
- `loading` (boolean): Loading state during session check
- `handleLogin` (Function): Login handler
- `logout` (Function): Logout handler

**Example:**
```jsx
import { AuthProvider } from '@/context/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

**Usage:**
```jsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, loading, handleLogin, logout } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <LoginForm onLogin={handleLogin} />;
  
  return <Dashboard user={user} onLogout={logout} />;
}
```

---

#### `useAuth` Hook (`src/context/AuthContext.js`)

Custom hook to access authentication context safely.

**Returns:**
- `{ user, loading, handleLogin, logout }`: Auth context value

**Throws:**
- Error if used outside `AuthProvider`

**Example:**
```jsx
import { useAuth } from '@/context/AuthContext';

function Profile() {
  const { user } = useAuth();
  return <div>Welcome, {user?.name}</div>;
}
```

---

#### `Login` Component (`src/pages/Auth/Login.jsx`)

Login page with form and illustration.

**Features:**
- Animated entrance with Framer Motion
- Responsive split layout (form left, illustration right)
- Back to home button
- Integrated with `LoginForm` component

**Example:**
```jsx
// Rendered at /login route
<Route path="/login" element={<Login />} />
```

---

#### `Signup` Component (`src/pages/Auth/Signup.jsx`)

Dynamic signup page that renders role-specific forms.

**State:**
- `role` (string | null): Selected role from localStorage

**Behavior:**
- Redirects to `/role-selection` if no role is stored
- Renders appropriate form based on role (TenantForm, LandlordForm, ArtisanForm)
- Includes onboarding header and footer

**Example:**
```jsx
// User flow:
// 1. User selects role at /role-selection
// 2. Role stored in localStorage
// 3. Navigate to /signup
// 4. Signup component reads role and renders form
```

---

#### `RoleSelection` Component (`src/components/onboarding/RoleSelection.jsx`)

Role selection page for onboarding flow.

**Props:** None (reads from route)

**Functions:**
- `handleRoleSelect(role)`: Stores role in localStorage and navigates to `/signup`

**Features:**
- Three role cards: Tenant, Landlord, Artisan
- Progress indicator (step 1 of 3)
- Animated card interactions
- Info banner for security messaging

**Example:**
```jsx
<RoleSelection />
// User clicks "Tenant" card
// → localStorage.setItem("userRole", "tenant")
// → navigate("/signup")
```

---

### 3.2 UI Components

#### `Button` Component (`src/components/ui/Button.jsx`)

Universal button component with variants and flexible rendering.

**Props:**
- `children` (ReactNode): Button content
- `variant` (string): `"primary"` | `"outline"` | `"ghost"` (default: `"primary"`)
- `as` (string | Component): Element to render as (default: `"button"`)
- `className` (string): Additional CSS classes
- `disabled` (boolean): Disabled state
- `loading` (boolean): Shows loading spinner
- `...props`: All other props passed to underlying component

**Returns:**
- Rendered button element with appropriate styling

**Example:**
```jsx
import { Button } from '@/components/ui/Button';

// Primary button
<Button variant="primary" onClick={handleClick}>
  Submit
</Button>

// Outline button as Link
<Button 
  variant="outline" 
  as={Link} 
  to="/login"
>
  Log In
</Button>

// Loading state
<Button loading={isSubmitting} disabled>
  Processing...
</Button>
```

**Variants:**
- `primary`: Green background (`#0b6e4f`), white text
- `outline`: White background, gray border, dark text
- `ghost`: Transparent background, green text

---

### 3.3 Layout Components

#### `Navbar` Component (`src/components/layout/Navbar.jsx`)

Main navigation bar with scroll detection and mobile menu.

**Features:**
- Fixed position with backdrop blur
- Scroll-based active section highlighting
- Smooth scroll to sections
- Responsive mobile menu (slides from right)
- Logo with hover animation
- Desktop and mobile navigation

**State:**
- `activeSection` (string): Currently visible section ID
- `mobileOpen` (boolean): Mobile menu visibility

**Functions:**
- `scrollToSection(id)`: Smoothly scrolls to section and updates active state

**Example:**
```jsx
<Navbar />
// Automatically detects scroll position
// Highlights active section in nav
```

---

#### `LandingPage` Component (`src/pages/Landing/LandingPage.jsx`)

Main landing page with multiple sections.

**Sections:**
1. Hero Section
2. How It Works
3. Features
4. Benefits
5. Pricing
6. Trust
7. Ads
8. Join Banner
9. Articles

**Features:**
- Framer Motion animations (fade in, fade in up)
- Scroll-triggered animations (`whileInView`)
- Responsive layout

**Example:**
```jsx
<Route path="/" element={<LandingPage />} />
```

---

### 3.4 Service Layer

#### `apiClient` (`src/services/apiClient.js`)

Configured Axios instance with interceptors for authentication.

**Configuration:**
- Base URL: `import.meta.env.VITE_API_BASE_URL` or `http://localhost:5000/api`
- Default headers: `Content-Type: application/json`

**Interceptors:**

1. **Request Interceptor:**
   - Automatically adds `Authorization: Bearer <token>` header if token exists in localStorage

2. **Response Interceptor:**
   - Handles 401 errors by clearing localStorage and token

**Returns:**
- Axios instance

**Example:**
```jsx
import apiClient from '@/services/apiClient';

// Automatically includes token if available
const response = await apiClient.get('/users/profile');
```

---

#### `authService` (`src/services/authService.js`)

Authentication-related API calls.

**Functions:**

##### `loginUser(credentials)`
Logs in a user with email and password.

**Parameters:**
- `credentials` (Object): `{ email: string, password: string }`

**Returns:**
- `Promise<Object>`: `{ user, token }`

**Throws:**
- Error object with message if login fails

**Example:**
```jsx
import { loginUser } from '@/services/authService';

try {
  const data = await loginUser({ 
    email: 'user@example.com', 
    password: 'password123' 
  });
  // data.user, data.token
} catch (error) {
  console.error(error.message);
}
```

---

##### `getUserProfile()`
Fetches the authenticated user's profile.

**Parameters:** None (uses token from localStorage via apiClient)

**Returns:**
- `Promise<Object>`: User profile object

**Throws:**
- Error if profile fetch fails or token invalid

**Example:**
```jsx
import { getUserProfile } from '@/services/authService';

const profile = await getUserProfile();
// { id, name, email, role, ... }
```

---

##### `signupArtisan(formData)`
Registers a new artisan account with file upload support.

**Parameters:**
- `formData` (FormData): Registration data including files (e.g., ID document)

**Returns:**
- `Promise<Object>`: Server response

**Example:**
```jsx
import { signupArtisan } from '@/services/authService';

const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('idDocument', file);

await signupArtisan(formData);
```

---

##### `forgotPassword(email)`
Initiates password reset email.

**Parameters:**
- `email` (string): User email address

**Returns:**
- `Promise<Object>`: Server response

**Example:**
```jsx
import { forgotPassword } from '@/services/authService';

await forgotPassword('user@example.com');
```

---

##### `resetPassword(token, payload)`
Resets password using token from email.

**Parameters:**
- `token` (string): Reset token from email link
- `payload` (Object): `{ password: string, confirmPassword: string }`

**Returns:**
- `Promise<Object>`: Server response

**Example:**
```jsx
import { resetPassword } from '@/services/authService';

await resetPassword(token, {
  password: 'newPassword123',
  confirmPassword: 'newPassword123'
});
```

---

#### `signupService` (`src/services/signupService.js`)

Dynamic user registration service.

**Functions:**

##### `signupUser(role, formData)`
Signs up a new user based on role.

**Parameters:**
- `role` (string): `"landlord"` | `"tenant"` | `"artisan"`
- `formData` (FormData): Registration data (multipart/form-data)

**Returns:**
- `Promise<Object>`: Server response

**Example:**
```jsx
import { signupUser } from '@/services/signupService';

const formData = new FormData();
formData.append('name', 'Jane Doe');
formData.append('email', 'jane@example.com');
formData.append('password', 'password123');

await signupUser('tenant', formData);
```

---

### 3.5 Routing Components

#### `App` Component (`src/App.jsx`)

Root component with route definitions and animated transitions.

**Routes:**
- `/` - LandingPage
- `/learn-more` - LearnMore
- `/role-selection` - RoleSelection
- `/signup` - Signup
- `/login` - Login
- `/forgot-password` - ForgotPassword
- `/reset-password/:token` - ResetPassword
- `/blog` - Blog
- `/blog/:slug` - BlogPost

**Features:**
- `AnimatePresence` for route transitions
- `mode="wait"` ensures one route animates out before next animates in

**Example:**
```jsx
// Wrapped in Router and AuthProvider in main.jsx
<App />
```

---

## 4. Critical Workflows

### 4.1 Authentication Flow

#### Login Flow

```
1. User navigates to /login
   ↓
2. User enters credentials in LoginForm
   ↓
3. LoginForm calls handleLogin from AuthProvider
   ↓
4. handleLogin calls loginUser(credentials) from authService
   ↓
5. authService makes POST /auth/login via apiClient
   ↓
6. apiClient request interceptor adds Authorization header (if token exists)
   ↓
7. Server responds with { user, token }
   ↓
8. AuthProvider stores token in localStorage
   ↓
9. AuthProvider stores userRole in localStorage
   ↓
10. AuthProvider updates user state
   ↓
11. AuthProvider navigates based on role:
    - landlord → /dashboard/landlord
    - tenant → /dashboard/tenant
    - artisan → /dashboard/artisan
    - admin → /admin/dashboard
    - super-admin → /super-admin/overview
```

#### Session Persistence Flow

```
1. App loads (main.jsx renders AuthProvider)
   ↓
2. AuthProvider useEffect runs on mount
   ↓
3. Checks localStorage for "token"
   ↓
4. If token exists:
   - Calls getUserProfile() via apiClient
   - apiClient adds Authorization header automatically
   - Server validates token
   - If valid: Updates user state
   - If invalid: Clears localStorage, sets user to null
   ↓
5. Sets loading to false
   ↓
6. Components can now access user via useAuth()
```

#### Logout Flow

```
1. User clicks logout button
   ↓
2. Calls logout() from AuthProvider
   ↓
3. AuthProvider:
   - Sets user to null
   - Removes "token" from localStorage
   - Removes "userRole" from localStorage
   - Navigates to /login
```

---

### 4.2 Signup Flow

#### Role-Based Signup Flow

```
1. User navigates to /role-selection
   ↓
2. User selects role (Tenant, Landlord, or Artisan)
   ↓
3. RoleSelection stores role in localStorage.setItem("userRole", role)
   ↓
4. Navigates to /signup
   ↓
5. Signup component:
   - Reads role from localStorage
   - If no role: Redirects to /role-selection
   - If role exists: Renders appropriate form component
   ↓
6. User fills form (TenantForm, LandlordForm, or ArtisanForm)
   ↓
7. Form submission:
   - Creates FormData object
   - Calls signupUser(role, formData) from signupService
   ↓
8. signupService makes POST /auth/signup/{role} via apiClient
   ↓
9. Server creates user account
   ↓
10. On success: Navigate to /login or auto-login
```

---

### 4.3 Data Flow

#### API Request Flow

```
Component
  ↓
Service Function (e.g., loginUser, getUserProfile)
  ↓
apiClient (Axios instance)
  ↓
Request Interceptor (adds Authorization header)
  ↓
HTTP Request to Backend API
  ↓
Response Interceptor (handles 401 errors)
  ↓
Service Function returns data
  ↓
Component updates state/UI
```

#### State Management Flow

```
Global State (AuthContext)
  ↓
AuthProvider manages user, loading state
  ↓
Components access via useAuth() hook
  ↓
Components update local state or trigger actions
  ↓
Actions update global state via AuthProvider methods
  ↓
All consuming components re-render with new state
```

---

### 4.4 Route Protection Flow

**Note:** ProtectedRoute component exists but is currently empty. Here's the intended flow:

```
1. User navigates to protected route (e.g., /dashboard/tenant)
   ↓
2. ProtectedRoute wrapper checks authentication:
   - If loading: Show loading spinner
   - If not authenticated: Redirect to /login
   - If authenticated but wrong role: Redirect to appropriate dashboard
   - If authenticated and correct role: Render component
```

---

## 5. Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.0 | UI library |
| `react-dom` | ^19.2.0 | React DOM renderer |
| `react-router-dom` | ^7.9.5 | Client-side routing |
| `axios` | ^1.13.2 | HTTP client for API requests |
| `framer-motion` | ^12.23.24 | Animation library |
| `tailwindcss` | ^4.1.17 | Utility-first CSS framework |
| `@headlessui/react` | ^2.2.9 | Unstyled UI components |
| `@heroicons/react` | ^2.2.0 | Icon library |
| `lucide-react` | ^0.553.0 | Icon library |
| `react-icons` | ^5.5.0 | Icon library |
| `react-hot-toast` | ^2.6.0 | Toast notifications |
| `react-phone-number-input` | ^3.4.13 | Phone number input component |
| `crypto-js` | ^4.2.0 | Encryption utilities |
| `dayjs` | ^1.11.19 | Date manipulation |
| `i18next` | ^25.6.1 | Internationalization framework |
| `react-i18next` | ^16.2.4 | React bindings for i18next |
| `zustand` | ^5.0.8 | State management (lightweight alternative) |
| `classnames` | ^2.5.1 | Conditional className utility |
| `clsx` | ^2.1.1 | Conditional className utility |
| `tailwind-merge` | ^3.4.0 | Merge Tailwind classes |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^7.2.2 | Build tool and dev server |
| `@vitejs/plugin-react` | ^5.1.0 | Vite plugin for React |
| `@types/react` | ^19.2.2 | TypeScript types for React |
| `@types/react-dom` | ^19.2.2 | TypeScript types for React DOM |
| `eslint` | ^9.39.1 | JavaScript linter |
| `eslint-plugin-react` | ^7.37.5 | ESLint plugin for React |
| `eslint-plugin-react-hooks` | ^5.2.0 | ESLint plugin for React hooks |
| `prettier` | ^3.6.2 | Code formatter |
| `husky` | ^9.1.7 | Git hooks |
| `lint-staged` | ^16.2.6 | Run linters on staged files |
| `postcss` | ^8.5.6 | CSS post-processor |
| `autoprefixer` | ^10.4.21 | PostCSS plugin for vendor prefixes |
| `@tailwindcss/postcss` | ^4.1.17 | Tailwind PostCSS plugin |

### Key Dependency Roles

#### React & React Router
- **React 19**: Core UI library with latest features (concurrent rendering, hooks)
- **React Router v7**: Handles client-side routing, navigation, and route protection

#### Styling & UI
- **Tailwind CSS**: Utility-first CSS for rapid UI development
- **Framer Motion**: Declarative animations for smooth user experience
- **Headless UI**: Accessible, unstyled components (dropdowns, modals, etc.)

#### HTTP & API
- **Axios**: Promise-based HTTP client with interceptors for authentication

#### State Management
- **Context API**: Built-in React solution for global state (auth, theme, language)
- **Zustand**: Lightweight state management (if needed for complex state)

#### Utilities
- **Day.js**: Lightweight date library (alternative to Moment.js)
- **Crypto-JS**: Encryption/decryption utilities
- **clsx/classnames**: Conditional className utilities

#### Build Tools
- **Vite**: Fast build tool with HMR (Hot Module Replacement)
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

---

## 6. Setup Instructions

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or higher recommended)
- **npm** (v7 or higher) or **yarn**
- **Git**

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/e-mond/RC.git
cd RC
```

#### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

This installs all production and development dependencies listed in `package.json`.

#### 3. Environment Configuration

Create a `.env.local` file in the root directory (`RC/`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Note:** Replace with your actual backend API URL in production.

#### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

The application will start on `http://localhost:5173` (default Vite port).

#### 5. Build for Production

```bash
npm run build
# or
yarn build
```

This creates an optimized production build in the `dist/` directory.

#### 6. Preview Production Build

```bash
npm run preview
# or
yarn preview
```

This serves the production build locally for testing.

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server with HMR |
| `build` | `npm run build` | Build for production |
| `preview` | `npm run preview` | Preview production build |
| `lint` | `npm run lint` | Run ESLint |
| `prepare` | `npm run prepare` | Setup Husky git hooks |

### Development Workflow

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Make Changes:**
   - Edit files in `src/`
   - Changes hot-reload automatically

3. **Check for Linting Errors:**
   ```bash
   npm run lint
   ```

4. **Build Before Committing:**
   ```bash
   npm run build
   ```

### Project Configuration

#### Vite Configuration (`vite.config.js`)

- **Path Alias**: `@` maps to `src/` directory
- **React Plugin**: Enables Fast Refresh and JSX transformation

**Usage:**
```jsx
// Instead of: import Button from '../../../components/ui/Button'
import Button from '@/components/ui/Button';
```

#### Tailwind Configuration (`tailwind.config.js`)

**Custom Colors:**
- `primary`: `#0b6e4f` (green)
- `secondary`: `#f1f3f5` (light gray)
- `border`: `#e6e8ea` (border gray)
- `background`: `#f8f9f9` (page background)
- `card`: `#ffffff` (white)
- `foreground`: `#0f1724` (dark text)

**Usage:**
```jsx
<div className="bg-primary text-white">
  Primary colored background
</div>
```

### Troubleshooting

#### Port Already in Use

If port 5173 is occupied, Vite will automatically try the next available port. You can also specify a port:

```bash
npm run dev -- --port 3000
```

#### Module Not Found Errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors

1. Check Node.js version: `node --version` (should be v16+)
2. Clear build cache: `rm -rf dist`
3. Rebuild: `npm run build`

#### API Connection Issues

1. Verify `.env.local` has correct `VITE_API_BASE_URL`
2. Ensure backend server is running
3. Check CORS configuration on backend
4. Verify network tab in browser DevTools

### Deployment

#### Build for Production

```bash
npm run build
```

The `dist/` folder contains the production-ready files.

#### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

#### Deploy to Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy --prod`
3. Follow prompts

#### Deploy to GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```
3. Run: `npm run deploy`

---

## Additional Notes

### Code Style

- **Components**: PascalCase (e.g., `Button.jsx`, `LoginForm.jsx`)
- **Utilities**: camelCase (e.g., `formatDate.js`, `validationSchemas.js`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth.js`, `useDebounce.js`)
- **Services**: camelCase (e.g., `authService.js`, `apiClient.js`)

### Best Practices

1. **Use Path Aliases**: Always use `@/` instead of relative paths
2. **Component Organization**: Keep components small and focused
3. **Service Layer**: All API calls should go through service modules
4. **Error Handling**: Always handle errors in try-catch blocks
5. **Loading States**: Show loading indicators during async operations
6. **Responsive Design**: Test on mobile, tablet, and desktop

### Future Enhancements

- Implement ProtectedRoute component for route protection
- Add role-based route guards
- Implement error boundaries
- Add unit and integration tests
- Set up CI/CD pipeline
- Add Storybook for component documentation
- Implement service workers for offline support

---

**Documentation Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Development Team

