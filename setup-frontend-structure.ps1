# ============================================
#  RENTAL CONNECTS FRONTEND STRUCTURE SETUP
# ============================================

$base = "D:\RentalConnects\rental-connects-frontend\src"


# Helper function to create folders
function Make-Folder($path) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
        Write-Host "Created: $path"
    }
}

# Helper function to create files
function Make-File($path, $content="") {
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Force -Path $path | Out-Null
        if ($content -ne "") {
            Set-Content -Path $path -Value $content
        }
        Write-Host "Created: $path"
    }
}

Write-Host "`n Setting up Rental Connects Frontend structure...`n"

# === BASE FOLDERS ===
$folders = @(
    (Join-Path $base "assets/images"),
    (Join-Path $base "assets/icons"),
    (Join-Path $base "assets/illustrations"),

    (Join-Path $base "components/layout"),
    (Join-Path $base "components/ui"),
    (Join-Path $base "components/shared"),

    (Join-Path $base "context"),
    (Join-Path $base "hooks"),
    (Join-Path $base "services"),
    (Join-Path $base "utils"),
    (Join-Path $base "routes"),

    (Join-Path $base "pages/Landing/components"),
    (Join-Path $base "pages/Auth/components"),
    (Join-Path $base "pages/Dashboards"),
    (Join-Path $base "pages/Admin"),
    (Join-Path $base "pages/Artisan"),
    (Join-Path $base "pages/Tenant"),
    (Join-Path $base "pages/Landlord"),
    (Join-Path $base "pages/Error"),
    (Join-Path $base "styles")
)

foreach ($folder in $folders) { Make-Folder $folder }

# === CORE FILES ===
$files = @{
    (Join-Path $base "main.jsx") = "// Entry point"
    (Join-Path $base "App.jsx") = "// Root app component"
    (Join-Path $base "index.css") = "@tailwind base;`n@tailwind components;`n@tailwind utilities;"
}

foreach ($file in $files.Keys) {
    Make-File $file $files[$file]
}

# === COMPONENTS ===
$componentFiles = @(
    "components/layout/Navbar.jsx",
    "components/layout/Sidebar.jsx",
    "components/layout/Footer.jsx",
    "components/layout/DashboardLayout.jsx",
    "components/layout/PublicLayout.jsx",
    "components/ui/Button.jsx",
    "components/ui/Input.jsx",
    "components/ui/Select.jsx",
    "components/ui/Modal.jsx",
    "components/ui/Card.jsx",
    "components/shared/AdsBanner.jsx",
    "components/shared/RoleCard.jsx",
    "components/shared/ReviewCard.jsx",
    "components/shared/PropertyCard.jsx",
    "components/shared/LoadingSpinner.jsx"
) | ForEach-Object { Join-Path $base $_ }

foreach ($file in $componentFiles) { Make-File $file 'export default function(){}' }

# === CONTEXT, HOOKS, SERVICES, UTILS, ROUTES ===
$moduleFiles = @(
    "context/AuthContext.jsx",
    "context/LanguageContext.jsx",
    "context/ThemeContext.jsx",

    "hooks/useAuth.js",
    "hooks/useFetch.js",
    "hooks/useDebounce.js",
    "hooks/useRoleRedirect.js",
    "hooks/useLanguage.js",

    "services/apiClient.js",
    "services/authService.js",
    "services/propertyService.js",
    "services/userService.js",
    "services/artisanService.js",
    "services/notificationService.js",
    "services/adsService.js",

    "utils/constants.js",
    "utils/validationSchemas.js",
    "utils/roles.js",
    "utils/formatDate.js",
    "utils/encryption.js",

    "routes/index.jsx",
    "routes/ProtectedRoute.jsx",
    "routes/RoleRedirect.jsx",
    "routes/PublicRoute.jsx"
) | ForEach-Object { Join-Path $base $_ }

foreach ($file in $moduleFiles) { Make-File $file 'export default {}' }

# === PAGES ===
$pageFiles = @(
    "pages/Landing/LandingPage.jsx",
    "pages/Landing/components/HeroSection.jsx",
    "pages/Landing/components/FeaturesSection.jsx",
    "pages/Landing/components/AboutSection.jsx",
    "pages/Landing/components/AdsSection.jsx",
    "pages/Landing/components/TestimonialsSection.jsx",
    "pages/Landing/components/FooterSection.jsx",

    "pages/Auth/Login.jsx",
    "pages/Auth/Signup.jsx",
    "pages/Auth/ForgotPassword.jsx",
    "pages/Auth/components/LoginForm.jsx",
    "pages/Auth/components/SignupForm.jsx",
    "pages/Auth/components/RoleSelect.jsx",
    "pages/Auth/components/AuthIllustration.jsx",

    "pages/Dashboards/TenantDashboard.jsx",
    "pages/Dashboards/LandlordDashboard.jsx",
    "pages/Dashboards/ArtisanDashboard.jsx",
    "pages/Dashboards/AdminDashboard.jsx",
    "pages/Dashboards/SuperAdminDashboard.jsx",

    "pages/Admin/ManageUsers.jsx",
    "pages/Admin/ManageProperties.jsx",
    "pages/Admin/ManageReports.jsx",
    "pages/Admin/Analytics.jsx",

    "pages/Artisan/ArtisanPage.jsx",
    "pages/Artisan/ArtisanProfile.jsx",
    "pages/Artisan/ServiceRequests.jsx",
    "pages/Artisan/Bookings.jsx",

    "pages/Tenant/TenantProfile.jsx",
    "pages/Tenant/RentalHistory.jsx",
    "pages/Tenant/MaintenanceRequests.jsx",
    "pages/Tenant/Reviews.jsx",

    "pages/Landlord/PropertyList.jsx",
    "pages/Landlord/AddProperty.jsx",
    "pages/Landlord/TenantManagement.jsx",
    "pages/Landlord/Payments.jsx",
    "pages/Landlord/Reviews.jsx",

    "pages/Error/NotFound.jsx",
    "pages/Error/ServerError.jsx"
) | ForEach-Object { Join-Path $base $_ }

foreach ($file in $pageFiles) { Make-File $file 'export default function(){}' }

# === STYLES ===
$styleFiles = @(
    "styles/buttons.css",
    "styles/forms.css",
    "styles/dashboard.css"
) | ForEach-Object { Join-Path $base $_ }

foreach ($file in $styleFiles) { Make-File $file '/* Styles */' }

Write-Host "`n All folders and files created successfully!"
Write-Host "You can now open VS Code and start building your components "
