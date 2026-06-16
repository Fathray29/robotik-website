# Refactoring Script for app.js

$filePath = "c:\Users\Rayyan\Documents\robotik-website-main\app.js"
$backupPath = "c:\Users\Rayyan\Documents\robotik-website-main\app.js.bak"

# 1. Backup original file
Copy-Item -Path $filePath -Destination $backupPath -Force
Write-Host "Backup created at: $backupPath"

# Read original content as a single string to allow multi-line regex replacements
$content = [System.IO.File]::ReadAllText($filePath)

# 2. Replace the initialization section (from start to CLIENT-SIDE ROUTER)
$headerReplacement = @"
import { 
  state, 
  saveData, 
  playRoboticSound, 
  sanitizeInput, 
  escapeHtml, 
  parseMarkdownToHtml, 
  initializeCloudDataSync 
} from './shared.js';

// Central shared state shortcuts
const blogArticles = state.blogArticles;
const portfolioProjects = state.portfolioProjects;
const applicants = state.applicants;
const regSettings = state.regSettings;
const landingData = state.landingData;
const useFirebase = state.useFirebase;
const db = state.db;

"@

# Regex escape to find the start section
# Matches from start of string to '// --- CLIENT-SIDE ROUTER ---'
$patternStart = "(?s)^.*?(?=\/\/ --- CLIENT-SIDE ROUTER ---)"
if ($content -match $patternStart) {
    $content = [regex]::Replace($content, $patternStart, $headerReplacement)
    Write-Host "Success: Replaced header section with imports and aliases."
} else {
    Write-Warning "Could not find client-side router header pattern."
}

# 3. Remove the entire CMS module (from CMS & SECURITY MODULE CONTROLLER to SYSTEM STATUS & TELEMETRY MODULE)
$patternCms = "(?s)\/\/ --- CMS & SECURITY MODULE CONTROLLER ---.*?(?=\/\/ --- SYSTEM STATUS & TELEMETRY MODULE ---)"
if ($content -match $patternCms) {
    $content = [regex]::Replace($content, $patternCms, "")
    Write-Host "Success: Removed CMS & Security module block."
} else {
    Write-Warning "Could not find CMS & Security module block."
}

# 4. Clean up the DOMContentLoaded boots (remove CMS init functions)
$content = $content.Replace("setupAudioToggle();", "// setupAudioToggle();")
$content = $content.Replace("setupLandingPageCMS();", "// setupLandingPageCMS();")
$content = $content.Replace("setupCmsAuthentication();", "// setupCmsAuthentication();")
$content = $content.Replace("setupCmsTabs();", "// setupCmsTabs();")
$content = $content.Replace("setupApplicantsFilterAndExport();", "// setupApplicantsFilterAndExport();")
$content = $content.Replace("setupAdminRegSettings();", "// setupAdminRegSettings();")
Write-Host "Success: Disabled admin functions in DOMContentLoaded."

# 5. Remove renderAdminApplicantsTable() call from the public submission block
$content = $content.Replace("renderAdminApplicantsTable();", "// renderAdminApplicantsTable();")
Write-Host "Success: Disabled renderAdminApplicantsTable() inside form handler."

# 6. Refactor click listener in setupRouter() to check for data-target
$oldClickListener = @"
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      navigateTo(target);
    });
    link.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
"@

$newClickListener = @"
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('data-target');
      if (!target) return; // Allow normal navigation (e.g., admin.html)
      e.preventDefault();
      navigateTo(target);
    });
    link.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
"@

if ($content.Contains($oldClickListener)) {
    $content = $content.Replace($oldClickListener, $newClickListener)
    Write-Host "Success: Updated setupRouter click listener."
} else {
    Write-Warning "Could not match the exact old click listener pattern. Let's try flexible regex."
    # Fallback to regex replacement
    $patternClick = "(?s)navLinks\.forEach\(link\s*=>\s*\{\s*link\.addEventListener\('click',\s*\(e\)\s*=>\s*\{\s*e\.preventDefault\(\);\s*const target\s*=\s*link\.getAttribute\('data-target'\);\s*navigateTo\(target\);\s*\}\);\s*link\.addEventListener\('mouseenter',\s*\(\)\s*=>\s*playRoboticSound\('hover'\)\);\s*\}\);"
    $content = [regex]::Replace($content, $patternClick, $newClickListener)
}

# 7. Remove the 'view-admin' routing hook in navigateTo inside setupRouter()
$patternAdminHook = "(?s)\s*// Secure verification hook for admin dashboard.*?if\s*\(targetViewId\s*===\s*'view-admin'\)\s*\{.*?\}\s*(?=\s*const performTransition)"
if ($content -match $patternAdminHook) {
    $content = [regex]::Replace($content, $patternAdminHook, "`r`n`r`n")
    Write-Host "Success: Removed secure verification hook for view-admin in router."
} else {
    Write-Warning "Could not find secure verification hook pattern."
}

# 8. Write content back to app.js
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Success: Refactored app.js saved successfully!"
