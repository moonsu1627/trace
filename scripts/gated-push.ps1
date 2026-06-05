<#
.SYNOPSIS
  trace 게이트형 배포: 빌드 통과해야만 commit + push (깨진 건 절대 안 올라감).

.DESCRIPTION
  Vercel과 동일한 빌드(@trace/db -> @trace/web)를 먼저 돌린다.
  - 통과: git add -A -> commit -> push origin main  (push 후 Vercel이 자동 배포)
  - 실패: push 안 함. 빌드 로그를 scripts\_gate-last-fail.log 에 저장.
          나중에 "깨진 거 확인해줘" 하면 이 로그를 보고 고치면 된다.
  - 변경 없음: 아무것도 안 하고 종료.

.EXAMPLE
  pwsh scripts\gated-push.ps1 -Message "feat: add inbox filters"
  pwsh scripts\gated-push.ps1               # 메시지 생략 시 자동 생성
  pwsh scripts\gated-push.ps1 -NoPush       # 빌드+commit 까지만, push 보류
#>
[CmdletBinding()]
param(
  [string] $Message,
  [switch] $NoPush
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
Set-Location $repo

$failLog = Join-Path $PSScriptRoot '_gate-last-fail.log'
$kst = [System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow, 'Korea Standard Time')
$stamp = $kst.ToString('yyyy-MM-dd HH:mm:ss') + ' KST'

Write-Host '=== trace gated-push ===' -ForegroundColor Cyan
Write-Host "repo : $repo"
Write-Host "time : $stamp"
Write-Host '========================'

# --- 0. 변경 없으면 조기 종료 ---
$dirty = git status --porcelain
if (-not $dirty) {
  Write-Host '[skip] 변경 사항 없음. 할 일 없음.' -ForegroundColor Yellow
  return
}

# --- 1. 빌드 게이트 (vercel.json 과 동일한 명령) ---
Write-Host '[gate] 빌드 중... (db -> web)' -ForegroundColor Cyan
# native 명령(pnpm)은 stderr 경고를 내보내므로 NativeCommandError 승격을 막고 $LASTEXITCODE 로 판정.
$prevEAP = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$buildOut = & {
  & corepack pnpm --filter '@trace/db' build  2>&1
  $script:dbExit = $LASTEXITCODE
  & corepack pnpm --filter '@trace/web' build 2>&1
  $script:webExit = $LASTEXITCODE
}
$ErrorActionPreference = $prevEAP

$buildOut | Write-Host
$buildFailed = ($script:dbExit -ne 0) -or ($script:webExit -ne 0)

if ($buildFailed) {
  $header = "[$stamp] BUILD FAILED  db=$($script:dbExit) web=$($script:webExit)"
  $header | Set-Content -Path $failLog -Encoding UTF8
  $buildOut | Out-String | Add-Content -Path $failLog -Encoding UTF8
  Write-Host ''
  Write-Host '[gate] ❌ 빌드 실패 — push 안 함. (라이브 안전)' -ForegroundColor Red
  Write-Host ("[gate] 실패 로그: {0}" -f $failLog) -ForegroundColor Red
  Write-Host '[gate] 나중에 "깨진 거 확인해줘" 하면 이 로그 보고 고치면 됩니다.'
  exit 1
}

# 통과했으면 이전 실패 로그는 치운다.
if (Test-Path $failLog) { Remove-Item $failLog -Force }
Write-Host '[gate] ✅ 빌드 통과.' -ForegroundColor Green

# --- 2. commit ---
if (-not $Message) { $Message = "auto: gated deploy $stamp" }

$prevEAP = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
  & git add -A *>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "git add 실패 (exit $LASTEXITCODE)" }
  & git commit -m $Message *>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "git commit 실패 (exit $LASTEXITCODE)" }
  Write-Host ("[commit] {0}" -f $Message) -ForegroundColor Green

  # --- 3. push ---
  if ($NoPush) {
    Write-Host '[push] -NoPush 지정 — 커밋만 하고 push 보류.' -ForegroundColor Yellow
    return
  }
  & git push origin main *>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "git push 실패 (exit $LASTEXITCODE)" }
  Write-Host '[push] ✅ origin/main 푸시 완료 — Vercel 자동 배포 시작.' -ForegroundColor Green
} finally {
  $ErrorActionPreference = $prevEAP
}

Write-Host '=== 완료: 빌드 통과 코드만 라이브로 올라갑니다 ===' -ForegroundColor Cyan
