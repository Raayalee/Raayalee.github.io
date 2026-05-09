param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('start', 'build', 'deploy-firestore', 'deploy-hosting', 'deploy-all')]
  [string]$Action
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $projectRoot

$reactScriptsPath = Join-Path $projectRoot 'node_modules\react-scripts\bin\react-scripts.js'

function Invoke-NodeReactScripts {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ScriptAction
  )

  if (-not (Test-Path $reactScriptsPath)) {
    throw "Cannot find react-scripts at $reactScriptsPath"
  }

  & node $reactScriptsPath $ScriptAction
  if ($LASTEXITCODE -ne 0) {
    throw "react-scripts $ScriptAction failed with exit code $LASTEXITCODE"
  }
}

function Invoke-FirebaseDeploy {
  param(
    [Parameter(Mandatory = $true)]
    [string]$OnlyArg
  )

  $firebaseCmd = Get-Command firebase -ErrorAction SilentlyContinue
  if (-not $firebaseCmd) {
    if ($OnlyArg -like 'firestore*') {
      Write-Host 'Firebase CLI not found. Falling back to direct Firestore API deploy via service account...'
      & node (Join-Path $projectRoot 'scripts\deployFirestoreConfig.mjs')
      if ($LASTEXITCODE -ne 0) {
        throw @"
Direct Firestore API deploy failed.

Most likely reason: service account has insufficient IAM permissions (PERMISSION_DENIED).
Required roles for automatic deploy:
- Firebase Rules Admin (roles/firebaserules.admin)
- Cloud Datastore Index Admin (roles/datastore.indexAdmin) or broader Firestore Admin

You can still apply manually in Firebase Console:
1) Firestore Database -> Rules -> paste content from lab5/firestore.rules -> Publish
2) Firestore Database -> Indexes -> Composite index:
   - Collection: applications
   - Fields: userId (Ascending), createdAt (Descending)
"@
      }
      return
    }

    throw 'Firebase CLI is not installed or not in PATH. Install with: npm i -g firebase-tools'
  }

  & firebase deploy --only $OnlyArg
  if ($LASTEXITCODE -ne 0) {
    throw "firebase deploy --only $OnlyArg failed with exit code $LASTEXITCODE"
  }
}

switch ($Action) {
  'start' {
    Write-Host 'Starting development server...'
    Invoke-NodeReactScripts -ScriptAction 'start'
  }
  'build' {
    Write-Host 'Creating production build...'
    Invoke-NodeReactScripts -ScriptAction 'build'
  }
  'deploy-firestore' {
    Write-Host 'Deploying Firestore rules and indexes...'
    Invoke-FirebaseDeploy -OnlyArg 'firestore:rules,firestore:indexes'
  }
  'deploy-hosting' {
    Write-Host 'Building app and deploying Firebase Hosting...'
    Invoke-NodeReactScripts -ScriptAction 'build'
    Invoke-FirebaseDeploy -OnlyArg 'hosting'
  }
  'deploy-all' {
    Write-Host 'Deploying Firestore and Hosting...'
    Invoke-FirebaseDeploy -OnlyArg 'firestore:rules,firestore:indexes'
    Invoke-NodeReactScripts -ScriptAction 'build'
    Invoke-FirebaseDeploy -OnlyArg 'hosting'
  }
}

Write-Host "Completed action: $Action"