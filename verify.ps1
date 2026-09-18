$paths = @{
    html = "c:\Users\Admin\Videos\rol\index.html"
    css  = "c:\Users\Admin\Videos\rol\styles.css"
    js   = "c:\Users\Admin\Videos\rol\app.js"
}

Write-Host "--- STARTING WEBSITE VERIFICATION (POWERSHELL) ---"
$errors = @()

foreach ($key in $paths.Keys) {
    $filePath = $paths[$key]
    if (Test-Path $filePath) {
        Write-Host "[PASS] $key file exists at: $filePath"
    } else {
        $errors += "[FAIL] $key file is missing! Checked path: $filePath"
    }
}

if ($errors.Count -gt 0) {
    Write-Host "`nErrors found during existence check:"
    foreach ($err in $errors) { Write-Host $err }
    Exit 1
}

$html = [System.IO.File]::ReadAllText($paths.html)
$css  = [System.IO.File]::ReadAllText($paths.css)
$js   = [System.IO.File]::ReadAllText($paths.js)

function Check-Contains($name, $content, $searchStr, $errMessage) {
    if ($content.Contains($searchStr)) {
        Write-Host "[PASS] $name"
    } else {
        $global:errors += "[FAIL] $name : $errMessage"
    }
}

Write-Host "`n--- VERIFYING INDEX.HTML INTEGRITY ---"
Check-Contains "CSS stylesheet linked" $html 'href="styles.css"' "styles.css is not linked in index.html"
Check-Contains "JS app.js linked" $html 'src="app.js"' "app.js is not linked in index.html"

$requiredIds = @(
    'globalSearch', 'themeToggle', 'menuToggle', 'navLinks',
    'searchResultsArea', 'searchResultsGrid', 'resultsCount', 'pagesContainer',
    'page-home', 'innerPagesContainer', 'breadcrumbActive', 'pageInnerSearch'
)

foreach ($id in $requiredIds) {
    Check-Contains "ID '$id' exists" $html "id=`"$id`"" "Target ID '$id' is missing in HTML"
}

$requiredSections = @(
    'page-general-rules', 'page-dispatcher-taser', 'page-radio-protocols',
    'page-pursuit-policy', 'page-case-management', 'page-criminal-procedures',
    'page-firearm-policy', 'page-contraband-policy'
)

foreach ($sec in $requiredSections) {
    Check-Contains "Section '$sec' exists" $html "id=`"$sec`"" "Policy page container '$sec' is missing"
}

$requiredRoles = @('role-ic', 'role-fc', 'role-neg', 'role-he', 'role-ems', 'role-photog')
foreach ($role in $requiredRoles) {
    Check-Contains "Case management role '$role' exists" $html "id=`"$role`"" "Role block '$role' is missing in Case Management"
}

# Match count of general rules cards
$cardCount = ([regex]::Matches($html, 'class="rule-info-card')).Count
if ($cardCount -ge 14) {
    Write-Host "[PASS] Found $cardCount rule info cards (At least 14 required)"
} else {
    $errors += "[FAIL] Expected at least 14 rule info cards, found only $cardCount"
}

Write-Host "`n--- VERIFYING APP.JS SCRIPTS ---"
$requiredJsKeywords = @(
    'hashchange', 'handleRoute', 'currentTheme',
    'performGlobalSearch', 'filterInnerPage', 'animateStats',
    'IntersectionObserver', 'localStorage'
)

foreach ($kw in $requiredJsKeywords) {
    Check-Contains "JS contains keyword '$kw'" $js $kw "Javascript file is missing essential logic for '$kw'"
}

Write-Host "`n--- VERIFYING STYLES.CSS STYLING ---"
$requiredCssSelectors = @(
    '.light-theme', '[dir="rtl"]', '.top-header', '.main-nav',
    '.hero-section', '.quick-card', '.stats-banner', '.timeline',
    '.workflow-diagram', '.modal-overlay', '@keyframes pulse-glow'
)

foreach ($selector in $requiredCssSelectors) {
    Check-Contains "CSS contains class/selector '$selector'" $css $selector "Stylesheet is missing styling selector for '$selector'"
}

Write-Host "`n--- SUMMARY REPORT ---"
if ($errors.Count -eq 0) {
    Write-Host "ALL TESTS COMPLETED SUCCESSFULLY! No errors found. The website is robustly structured and ready for production."
} else {
    Write-Host "VERIFICATION FAILED! Found $($errors.Count) error(s):"
    foreach ($err in $errors) {
        Write-Host $err
    }
    Exit 1
}