# Precise Refactoring Script for app.js

$filePath = "c:\Users\Rayyan\Documents\robotik-website-main\app.js"
$backupPath = "c:\Users\Rayyan\Documents\robotik-website-main\app.js.bak"

# 1. Restore from backup
Copy-Item -Path $backupPath -Destination $filePath -Force
Write-Host "Restored original from backup."

# Read original content as lines
$lines = [System.IO.File]::ReadAllLines($filePath)
Write-Host "Total original lines: $($lines.Length)"

# 2. Prepare the new header (imports and state aliases)
$header = @(
"import { ",
"  state, ",
"  saveData, ",
"  playRoboticSound, ",
"  sanitizeInput, ",
"  escapeHtml, ",
"  parseMarkdownToHtml, ",
"  initializeCloudDataSync ",
"} from './shared.js';",
"",
"// Central shared state shortcuts",
"const blogArticles = state.blogArticles;",
"const portfolioProjects = state.portfolioProjects;",
"const applicants = state.applicants;",
"const regSettings = state.regSettings;",
"const landingData = state.landingData;",
"const useFirebase = state.useFirebase;",
"const db = state.db;",
""
)

# We want to build the new array of lines
$newLines = [System.Collections.Generic.List[string]]::new()

# Add header lines (replacing original lines 1-653 (0-indexed 0 to 652))
foreach ($hl in $header) {
    $newLines.Add($hl)
}

# We will copy lines from index 653 (line 654) onwards, but skip the specified admin ranges
# Original lines in 1-indexed notation:
# range 1 to 653: replaced by header (indices 0 to 652)
# range 654 to 1717: keep (indices 653 to 1716)
# range 1718 to 3767: skip/delete (indices 1717 to 3766)
# range 3768 to 3822 (renderWhatsAppBanner, initializeCloudDataSync, setupPendaftaranCMSAndCountdown): keep (indices 3767 to 3821)
# range 3823 to 3988 (compressImage, setupLocalImageUploader, setupApplicantsFilterAndExport, exportApplicantsToCsv): skip/delete (indices 3822 to 3987)
# range 3989 to end (DOMContentLoaded, setupInteractiveDivisions, System Status & Telemetry): keep (indices 3988 to end)

Write-Host "Filtering lines..."
for ($i = 653; $i -lt $lines.Length; $i++) {
    $lineNum = $i + 1
    
    # Range 1718 to 3767 (CMS controllers)
    if ($lineNum -ge 1718 -and $lineNum -le 3767) {
        continue
    }
    
    # Range 3823 to 3988 (Image uploaders and export csv)
    if ($lineNum -ge 3823 -and $lineNum -le 3988) {
        continue
    }
    
    # Process lines that are kept
    $line = $lines[$i]
    
    # In DOMContentLoaded, comment out or remove admin init functions
    if ($line.Contains("setupAudioToggle();")) { $line = "  // setupAudioToggle();" }
    if ($line.Contains("setupLandingPageCMS();")) { $line = "  // setupLandingPageCMS();" }
    if ($line.Contains("setupCmsAuthentication();")) { $line = "  // setupCmsAuthentication();" }
    if ($line.Contains("setupCmsTabs();")) { $line = "  // setupCmsTabs();" }
    if ($line.Contains("setupApplicantsFilterAndExport();")) { $line = "  // setupApplicantsFilterAndExport();" }
    
    # In setupPendaftaranCMSAndCountdown, remove setupAdminRegSettings
    if ($line.Contains("setupAdminRegSettings();")) { $line = "  // setupAdminRegSettings();" }
    
    # In public applicant submission, remove renderAdminApplicantsTable
    if ($line.Contains("renderAdminApplicantsTable();")) { $line = "      // renderAdminApplicantsTable();" }
    
    $newLines.Add($line)
}

# Write the processed lines back
[System.IO.File]::WriteAllLines($filePath, $newLines.ToArray(), [System.Text.Encoding]::UTF8)
Write-Host "Success: Precise refactored app.js saved! Total lines: $($newLines.Count)"
