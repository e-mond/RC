#  Rental Connects Frontend (RCC)

**Rental Connects (RCC)** is a modern, responsive, and dynamic web platform that bridges the gap between **tenants**, **landlords**, and **artisans** in Ghana’s rental ecosystem.  
This repository hosts the **frontend** built with **React + Vite**, powered by **Tailwind CSS** and **Framer Motion** for a fast, scalable, and engaging user experience.

---

##  Project Overview

Ghana’s rental industry faces challenges with trust, communication, and efficiency.  
**Rental Connects** addresses these by offering a unified platform where users can:

-  **Tenants** — Find verified listings, pay rent securely, and manage rental history.  
-  **Landlords** — List properties, manage tenants, collect rent, and monitor occupancy.  
-  **Artisans** — Offer maintenance and repair services directly to verified clients.

This app promotes **transparency, convenience, and digital trust** in property management.

---

##  Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Routing | [React Router v6](https://reactrouter.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| HTTP Client | [Axios](https://axios-http.com/) |
| State/Context | React Context API |
| Deployment | GitHub Pages / Vercel (optional) |

---

##  Features

###  Tenant Features
- Browse verified property listings  
- Pay rent securely online  
- Manage rental agreements and payment history  

###  Landlord Features
- List and manage multiple properties  
- Collect rent directly from tenants  
- Access analytics dashboards  

###  Artisan Features
- Create professional service profiles  
- Connect with nearby landlords and tenants  
- Receive service requests and reviews  

###  UI / UX Highlights
- Modern responsive interface  
- Smooth animations (Framer Motion)  
- Minimal, readable typography  
- Consistent design system built with Tailwind  
- Modular, reusable React components  

---

##  Folder Structure

```
RC/
├─ .husky
├─ public/
│  └─ index.html
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ index.css
│  ├─ routes/
│  │  ├─ index.jsx                # All routes (React Router)
│  │  ├─ ProtectedRoute.jsx
│  │  ├─ PublicRoute.jsx
│  │  └─ RoleRedirect.jsx
│  ├─ pages/
│  │  ├─ Landing/
│  │  │  ├─ LandingPage.jsx
│  │  │  ├─ components/
│  │  │  │  ├─ HeroSection.jsx
│  │  │  │  ├─ FeaturesSection.jsx
│  │  │  │  ├─ AdsSection.jsx
│  │  │  │  ├─ FreemiumSection.jsx
│  │  │  │  ├─ UserBenefits.jsx
│  │  │  │  ├─ Testimonials.jsx
│  │  │  │  └─ Footer.jsx
│  │  ├─ Auth/
│  │  │  ├─ Login.jsx              # unified login
│  │  │  ├─ Signup.jsx             # one signup page, renders components dynamically
│  │  │  ├─ components/
│  │  │  │  ├─ RoleSelector.jsx
│  │  │  │  ├─ TenantSignupForm.jsx
│  │  │  │  ├─ LandlordSignupForm.jsx
│  │  │  │  ├─ ArtisanSignupForm.jsx
│  │  │  │  └─ SignupPreview.jsx   # side image + tagline updates dynamically
│  │  ├─ Dashboards/
│  │  │  ├─ TenantDashboard.jsx
│  │  │  ├─ LandlordDashboard.jsx
│  │  │  ├─ ArtisanDashboard.jsx
│  │  │  ├─ AdminDashboard.jsx
│  │  │  └─ SuperAdminDashboard.jsx
│  │  ├─ Ads/
│  │  │  ├─ AdsList.jsx
│  │  │  ├─ AdCard.jsx
│  │  │  └─ ManageAds.jsx
│  │  ├─ Maintenance/
│  │  │  ├─ MaintenanceRequests.jsx
│  │  │  └─ MaintenanceForm.jsx
│  │  ├─ Payments/
│  │  │  ├─ PaymentPage.jsx
│  │  │  ├─ PaymentHistory.jsx
│  │  │  └─ UpgradePlan.jsx
│  │  ├─ Chat/
│  │  │  ├─ ChatWindow.jsx
│  │  │  ├─ ChatList.jsx
│  │  │  └─ ChatMessage.jsx
│  │  └─ Error/
│  │     └─ NotFound.jsx
│  ├─ components/
│  │  ├─ ui/
│  │  │  ├─ Button.jsx
│  │  │  ├─ Input.jsx
│  │  │  ├─ Select.jsx
│  │  │  ├─ Modal.jsx
│  │  │  └─ Card.jsx
│  │  ├─ layout/
│  │  │  ├─ Navbar.jsx
│  │  │  ├─ Sidebar.jsx
│  │  │  └─ Footer.jsx
│  │  └─ shared/
│  │     ├─ PropertyCard.jsx
│  │     ├─ UserCard.jsx
│  │     └─ RoleBadge.jsx
│  ├─ context/
│  │  ├─ AuthContext.jsx
│  │  ├─ ThemeContext.jsx
│  │  └─ LanguageContext.jsx
│  ├─ services/
│  │  ├─ apiClient.js              # axios instance
│  │  ├─ authService.js
│  │  ├─ userService.js
│  │  ├─ propertyService.js
│  │  ├─ adService.js
│  │  ├─ paymentService.js
│  │  ├─ chatService.js
│  │  ├─ cloudinary.js
│  │  └─ i18n.js
│  ├─ hooks/
│  │  ├─ useAuth.js
│  │  ├─ useAds.js
│  │  └─ useLanguage.js
│  ├─ utils/
│  │  ├─ validators.js
│  │  ├─ roles.js
│  │  ├─ constants.js
│  │  └─ helpers.js
│  └─ assets/
│     ├─ images/
│     └─ icons/
└─ package.json
└── vite.config.js
```

---

##  Setup Instructions

###  Prerequisites
Ensure you have:
- **Node.js** (v16+)
- **npm** or **yarn**
- **Git**

###  Clone the Repository
```bash
git clone https://github.com/e-mond/RC.git
cd RC
```

###  Install Dependencies
```bash
npm install
# or
yarn
```

###  Run the Development Server
```bash
npm run dev
# or
yarn dev
```

###  Build for Production
```bash
npm run build
# or
yarn build
```

###  Environment Variables
Create a `.env.local` file in the root directory:
```
VITE_API_BASE_URL=https://api.rentalconnects.gh
```

---

##  Authentication Flow
- User logs in via `/login`
- Token (JWT) stored securely in localStorage
- `apiClient.js` attaches the token to every API request
- `AuthContext` auto-loads user profile on refresh
- Logout clears session and redirects to `/login`

---

##  Role-Based Signup Flow

| Role | Route | Form Component | Purpose |
|------|--------|----------------|----------|
| Tenant | `/signup?role=tenant` | `TenantForm.jsx` | Register tenants to browse & pay rent |
| Landlord | `/signup?role=landlord` | `LandlordForm.jsx` | Manage and list properties |
| Artisan | `/signup?role=artisan` | `ArtisanForm.jsx` | Offer maintenance services |

---

##  Learn More Page (Editorial + Marketing)
Blends editorial storytelling with marketing for better engagement.

Sections include:
-  Hero Section — inspiring tagline, CTA to join
-  Feature Highlights — breakdown for tenants, landlords, artisans
-  News & Insights Feed — short reads, platform updates
-  Sponsored/Ads Section — placeholders for partnerships
-  Final CTA Banner — call to action leading to signup

---

##  Component Breakdown (Key UI)

| Component | Description |
|------------|-------------|
| `HeroSection.jsx` | Landing page hero with CTA and animation |
| `JoinBanner.jsx` | Signup prompt for tenants, landlords, artisans |
| `RoleSelection.jsx` | Multi-role onboarding selector |
| `ProgressIndicator.jsx` | Shows user’s onboarding step |
| `OnboardingHeader/Footer.jsx` | Consistent header/footer during signup |
| `LearnMorePage.jsx` | Editorial layout with newsfeed, marketing & ads sections |

---

##  Contributing

1. Fork the repository  
2. Create a new branch  
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit and push your changes  
   ```bash
   git commit -m "Add: your feature"
   git push origin feature/your-feature
   ```
4. Submit a Pull Request (PR)

Ensure:
- Proper code formatting (`npm run lint` if available)
- Components follow existing naming conventions
- Reusable UI > repetitive code

---

##  Roadmap
Role-based signup flow  
Landing + Learn More pages  
Tenant/Landlord dashboards  
Chat and messaging system  
Service booking and payments integration  
Admin control panel  

---

##  License
Licensed under the **MIT License** — free to use, modify, and distribute with attribution.

---

##  Contact
**Author:** E-Mond 
**Project:** Rental Connects (RC)  
**GitHub:** [https://github.com/e-mond/RC](https://github.com/e-mond/RC)

---

##  Acknowledgements
- Tailwind CSS  
- Framer Motion  
- React Router  
- Lucide Icons  
- Vite  
- Open-source contributors 

---

## Final Note
Rental Connects isn’t just another web app — it’s a movement toward **digital trust and simplicity** in Ghana’s rental ecosystem.  
Built for tenants, landlords, and artisans alike, RCC empowers users with transparency and ease in every interaction.

**Let’s build the future of renting — together. **
