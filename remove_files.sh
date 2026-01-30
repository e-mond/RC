#!/bin/bash
# Bash Script to Automatically Remove Historical Documentation Files
# Run this script to clean up historical/duplicate markdown files and unused source files
# Total files to remove: ~52 files

echo "========================================"
echo "Documentation & Code Cleanup Script"
echo "========================================"
echo ""
echo "Starting automatic cleanup..."
echo ""

removedCount=0
notFoundCount=0

# Category 1: Historical Fix Documentation (6 files)
echo "Category 1: Historical Fix Documentation..."
fixFiles=(
    "FRONTEND_ERROR_FIXES_2026-01-15.md"
    "ALL_FIXES_SUMMARY.md"
    "LATEST_FIXES.md"
    "CRITICAL_ISSUES_AND_FIXES.md"
    "FRONTEND_FIXES_SUMMARY.md"
    "FRONTEND_UPDATES_AND_BACKEND_REQUIREMENTS.md"
)

for file in "${fixFiles[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed: $file"
        ((removedCount++))
    else
        echo "  - Not found: $file"
        ((notFoundCount++))
    fi
done

# Category 2: Duplicate Implementation Guides (6 files)
echo ""
echo "Category 2: Duplicate Implementation Guides..."
implFiles=(
    "FRONTEND_NOTIFICATION_INTEGRATION_SUMMARY.md"
    "FRONTEND_BACKEND_NOTIFICATION_INTEGRATION_GUIDE.md"
    "SIGNUP_APPROVAL_NOTIFICATIONS_IMPLEMENTATION.md"
    "NOTIFICATION_SYSTEM_IMPLEMENTATION_SUMMARY.md"
    "FRONTEND_NOTIFICATION_UI_DOCUMENTATION.md"
    "ADMIN_APPROVAL_PAGES_IMPLEMENTATION.md"
)

for file in "${implFiles[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed: $file"
        ((removedCount++))
    else
        echo "  - Not found: $file"
        ((notFoundCount++))
    fi
done

# Category 3: Historical Backend Documentation (6 files - excluding BACKEND_REQUIREMENTS_AND_ISSUES.md)
echo ""
echo "Category 3: Historical Backend Documentation..."
backendFiles=(
    "BACKEND_ACTION_REQUIRED_2026-01-15.md"
    "BACKEND_IMPLEMENTATION_SUMMARY.md"
    "BACKEND_IMPLEMENTATION_PRIORITY.md"
    "BACKEND_PROPERTY_UPDATES.md"
    "BACKEND_PROPERTY_API_IMPLEMENTATION.md"
    "BACKEND_LEASE_DOWNLOAD_API.md"
)

for file in "${backendFiles[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed: $file"
        ((removedCount++))
    else
        echo "  - Not found: $file"
        ((notFoundCount++))
    fi
done

# Category 4: Duplicate Summaries (2 files - excluding FRONTEND_QUICK_REFERENCE.md)
echo ""
echo "Category 4: Duplicate Summaries..."
summaryFiles=(
    "FRONTEND_DOCUMENTATION_SUMMARY.md"
    "DOCUMENTATION_CLEANUP_REPORT.md"
)

for file in "${summaryFiles[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed: $file"
        ((removedCount++))
    else
        echo "  - Not found: $file"
        ((notFoundCount++))
    fi
done

# Category 5: Archive Files (19 files)
echo ""
echo "Category 5: Archive Files in docs/archive/..."
archiveFiles=(
    "docs/archive/README.md"
    "docs/archive/DOCUMENTATION_ORGANIZATION_COMPLETE.md"
    "docs/archive/FIXES_SUMMARY.md"
    "docs/archive/LANDING_PAGE_FIXES_COMPLETE.md"
    "docs/archive/SYSTEM_STATUS_FINAL.md"
    "docs/archive/COMPREHENSIVE_REVIEW_COMPLETE.md"
    "docs/archive/FINAL_ITEMS_REVIEW.md"
    "docs/archive/REMAINING_ITEMS_REVIEW.md"
    "docs/archive/SYSTEM_REVIEW_COMPLETE.md"
    "docs/archive/COMPREHENSIVE_REVIEW_SUMMARY.md"
    "docs/archive/CORE_TASKS_VERIFICATION.md"
    "docs/archive/FINAL_SUMMARY.md"
    "docs/archive/CORE_OBJECTIVES_PROGRESS.md"
    "docs/archive/FINAL_VERIFICATION_REPORT.md"
    "docs/archive/IMPLEMENTATION_PROGRESS.md"
    "docs/archive/PRODUCTION_READINESS_SUMMARY.md"
    "docs/archive/RESPONSIVE_DESIGN_VERIFICATION.md"
    "docs/archive/PROGRESS_SUMMARY.md"
    "docs/archive/PRODUCTION_HARDENING_STATUS.md"
)

for file in "${archiveFiles[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed: $file"
        ((removedCount++))
    else
        echo "  - Not found: $file"
        ((notFoundCount++))
    fi
done

# Category 6: Phase Documentation (7 files)
echo ""
echo "Category 6: Phase Documentation in docs/phases/..."
phaseFiles=(
    "docs/phases/CLEANUP_REPORT.md"
    "docs/phases/PHASE2_COMPLETE.md"
    "docs/phases/PHASE3_COMPLETE.md"
    "docs/phases/PHASE4_COMPLETE.md"
    "docs/phases/PHASE5_COMPLETE.md"
    "docs/phases/PHASE6_COMPLETE.md"
    "docs/phases/PHASE7_PREP.md"
)

for file in "${phaseFiles[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed: $file"
        ((removedCount++))
    else
        echo "  - Not found: $file"
        ((notFoundCount++))
    fi
done

# Category 7: Consolidation Reports (1 file - excluding docs/ARCHIVE.md)
echo ""
echo "Category 7: Consolidation Reports..."
consolidationFiles=(
    "docs/DOCUMENTATION_CONSOLIDATION_SUMMARY.md"
)

for file in "${consolidationFiles[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed: $file"
        ((removedCount++))
    else
        echo "  - Not found: $file"
        ((notFoundCount++))
    fi
done

# Category 8: Empty Source Files (4 files - unused)
echo ""
echo "Category 8: Empty Source Files (unused)..."
sourceFiles=(
    "src/hooks/useDebounce.js"
    "src/utils/validationSchemas.js"
    "src/utils/roles.js"
    "src/utils/constants.js"
)

for file in "${sourceFiles[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Removed: $file"
        ((removedCount++))
    else
        echo "  - Not found: $file"
        ((notFoundCount++))
    fi
done

# Summary
echo ""
echo "========================================"
echo "Cleanup Summary"
echo "========================================"
echo "Files Removed: $removedCount"
echo "Files Not Found: $notFoundCount"
echo ""
echo "Cleanup complete!"
echo ""
echo "Note: The following files were kept for review:"
echo "  - BACKEND_REQUIREMENTS_AND_ISSUES.md (may still be relevant)"
echo "  - FRONTEND_QUICK_REFERENCE.md (may be useful)"
echo "  - docs/ARCHIVE.md (reference for archived files)"
echo ""
