param(
  [string]$TargetUrl = "https://slashdot.org/",
  [string]$CapturesDir = "$env:USERPROFILE\Videos\Captures"
)

$ErrorActionPreference = "Stop"

function Write-Step($text) {
  Write-Host ""
  Write-Host "==> $text" -ForegroundColor Cyan
}

function Wait-User($message) {
  Write-Host ""
  Read-Host "$message (press Enter when done)"
}

Write-Host "Jap-Jap Step-1 Recording Agent" -ForegroundColor Green
Write-Host "Goal: Record Slashdot word selection + popup + Play Audio." -ForegroundColor Green

Write-Step "Opening Chrome at target page"
Start-Process "chrome.exe" $TargetUrl

Write-Step "Pre-check instructions"
Write-Host "1) Make sure Jap-Jap extension is loaded and enabled."
Write-Host "2) Keep only the target Chrome window visible for clean recording."
Write-Host "3) Ensure speaker volume is ON (audio must be recorded)."
Wait-User "Complete the pre-check"

Write-Step "Start recording with Xbox Game Bar"
Write-Host "Press Win+G, open Capture widget, then click Record."
Write-Host "Shortcut to start/stop directly: Win+Alt+R"
Wait-User "Start recording now"

Write-Step "Perform the demo action"
Write-Host "In Slashdot:"
Write-Host "- Select a random single word."
Write-Host "- Confirm Jap-Jap popup appears."
Write-Host "- Click Play Audio."
Write-Host "- Let audio play for at least 2-3 seconds."
Wait-User "Finish the action and stop recording"

Write-Step "Looking for newest capture file"
if (-not (Test-Path $CapturesDir)) {
  Write-Host "Captures folder not found: $CapturesDir" -ForegroundColor Yellow
  Write-Host "Check your recording settings and locate file manually."
  exit 0
}

$latest = Get-ChildItem -Path $CapturesDir -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($null -eq $latest) {
  Write-Host "No recording files found in $CapturesDir" -ForegroundColor Yellow
  Write-Host "Please verify Game Bar saved the clip."
  exit 0
}

Write-Host ""
Write-Host "Latest recording found:" -ForegroundColor Green
Write-Host "Name: $($latest.Name)"
Write-Host "Path: $($latest.FullName)"
Write-Host "Size: $([Math]::Round($latest.Length / 1MB, 2)) MB"
Write-Host "Modified: $($latest.LastWriteTime)"

Write-Step "Step 1 complete"
Write-Host "Next: Upload this file to YouTube as Unlisted/Private."
