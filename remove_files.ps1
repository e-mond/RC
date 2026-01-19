# PowerShell Script to Automatically Remove Historical Documentation Files
# Run this script to clean up historical/duplicate markdown files and unused source files
# Total files to remove: ~52 files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Documentation & Code Cleanup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting automatic cleanup..." -ForegroundColor Green
Write-Host ""

$removedCount = 0
$notFoundCount = 0

# Category 1: Historical Fix Documentation (6 files)
Write-Host "Category 1: Historical Fix Documentation..." -ForegroundColor Yellow
$fixFiles = @(
    "FRONTEND_ERROR_FIXES_2026-01-15.md",
    "ALL_FIXES_SUMMARY.md",
    "LATEST_FIXES.md",
    "CRITICAL_ISSUES_AND_FIXES.md",
    "FRONTEND_FIXES_SUMMARY.md",
    "FRONTEND_UPDATES_AND_BACKEND_REQUIREMENTS.md"
)

foreach ($file in $fixFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor DarkGray
        $notFoundCount++
    }
}

# Category 2: Duplicate Implementation Guides (6 files)
Write-Host ""
Write-Host "Category 2: Duplicate Implementation Guides..." -ForegroundColor Yellow
$implFiles = @(
    "FRONTEND_NOTIFICATION_INTEGRATION_SUMMARY.md",
    "FRONTEND_BACKEND_NOTIFICATION_INTEGRATION_GUIDE.md",
    "SIGNUP_APPROVAL_NOTIFICATIONS_IMPLEMENTATION.md",
    "NOTIFICATION_SYSTEM_IMPLEMENTATION_SUMMARY.md",
    "FRONTEND_NOTIFICATION_UI_DOCUMENTATION.md",
    "ADMIN_APPROVAL_PAGES_IMPLEMENTATION.md"
)

foreach ($file in $implFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor DarkGray
        $notFoundCount++
    }
}

# Category 3: Historical Backend Documentation (6 files - excluding BACKEND_REQUIREMENTS_AND_ISSUES.md)
Write-Host ""
Write-Host "Category 3: Historical Backend Documentation..." -ForegroundColor Yellow
$backendFiles = @(
    "BACKEND_ACTION_REQUIRED_2026-01-15.md",
    "BACKEND_IMPLEMENTATION_SUMMARY.md",
    "BACKEND_IMPLEMENTATION_PRIORITY.md",
    "BACKEND_PROPERTY_UPDATES.md",
    "BACKEND_PROPERTY_API_IMPLEMENTATION.md",
    "BACKEND_LEASE_DOWNLOAD_API.md"
)

foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor DarkGray
        $notFoundCount++
    }
}

# Category 4: Duplicate Summaries (2 files - excluding FRONTEND_QUICK_REFERENCE.md)
Write-Host ""
Write-Host "Category 4: Duplicate Summaries..." -ForegroundColor Yellow
$summaryFiles = @(
    "FRONTEND_DOCUMENTATION_SUMMARY.md",
    "DOCUMENTATION_CLEANUP_REPORT.md"
)

foreach ($file in $summaryFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor DarkGray
        $notFoundCount++
    }
}

# Category 5: Archive Files (19 files)
Write-Host ""
Write-Host "Category 5: Archive Files in docs/archive/..." -ForegroundColor Yellow
$archiveFiles = @(
    "docs\archive\README.md",
    "docs\archive\DOCUMENTATION_ORGANIZATION_COMPLETE.md",
    "docs\archive\FIXES_SUMMARY.md",
    "docs\archive\LANDING_PAGE_FIXES_COMPLETE.md",
    "docs\archive\SYSTEM_STATUS_FINAL.md",
    "docs\archive\COMPREHENSIVE_REVIEW_COMPLETE.md",
    "docs\archive\FINAL_ITEMS_REVIEW.md",
    "docs\archive\REMAINING_ITEMS_REVIEW.md",
    "docs\archive\SYSTEM_REVIEW_COMPLETE.md",
    "docs\archive\COMPREHENSIVE_REVIEW_SUMMARY.md",
    "docs\archive\CORE_TASKS_VERIFICATION.md",
    "docs\archive\FINAL_SUMMARY.md",
    "docs\archive\CORE_OBJECTIVES_PROGRESS.md",
    "docs\archive\FINAL_VERIFICATION_REPORT.md",
    "docs\archive\IMPLEMENTATION_PROGRESS.md",
    "docs\archive\PRODUCTION_READINESS_SUMMARY.md",
    "docs\archive\RESPONSIVE_DESIGN_VERIFICATION.md",
    "docs\archive\PROGRESS_SUMMARY.md",
    "docs\archive\PRODUCTION_HARDENING_STATUS.md"
)

foreach ($file in $archiveFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor DarkGray
        $notFoundCount++
    }
}

# Category 6: Phase Documentation (7 files)
Write-Host ""
Write-Host "Category 6: Phase Documentation in docs/phases/..." -ForegroundColor Yellow
$phaseFiles = @(
    "docs\phases\CLEANUP_REPORT.md",
    "docs\phases\PHASE2_COMPLETE.md",
    "docs\phases\PHASE3_COMPLETE.md",
    "docs\phases\PHASE4_COMPLETE.md",
    "docs\phases\PHASE5_COMPLETE.md",
    "docs\phases\PHASE6_COMPLETE.md",
    "docs\phases\PHASE7_PREP.md"
)

foreach ($file in $phaseFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor DarkGray
        $notFoundCount++
    }
}

# Category 7: Consolidation Reports (1 file - excluding docs/ARCHIVE.md)
Write-Host ""
Write-Host "Category 7: Consolidation Reports..." -ForegroundColor Yellow
$consolidationFiles = @(
    "docs\DOCUMENTATION_CONSOLIDATION_SUMMARY.md"
)

foreach ($file in $consolidationFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor DarkGray
        $notFoundCount++
    }
}

# Category 8: Empty Source Files (4 files - unused)
Write-Host ""
Write-Host "Category 8: Empty Source Files..." -ForegroundColor Yellow
$sourceFiles = @(
    "src\hooks\useDebounce.js",
    "src\utils\validationSchemas.js",
    "src\utils\roles.js",
    "src\utils\constants.js"
)

foreach ($file in $sourceFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor DarkGray
        $notFoundCount++
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files Removed: $removedCount" -ForegroundColor Green
Write-Host "Files Not Found: $notFoundCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: The following files were kept for review:" -ForegroundColor Yellow
Write-Host "  - BACKEND_REQUIREMENTS_AND_ISSUES.md (may still be relevant)" -ForegroundColor Cyan
Write-Host "  - FRONTEND_QUICK_REFERENCE.md (may be useful)" -ForegroundColor Cyan
Write-Host "  - docs/ARCHIVE.md (reference for archived files)" -ForegroundColor Cyan
Write-Host ""
