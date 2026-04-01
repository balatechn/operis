$cookieFile = "D:\Manufacturing\coolify_cookies.txt"
$baseUrl = "http://187.127.134.246:8000"

# Step 1: Refresh CSRF
Remove-Item $cookieFile -ErrorAction SilentlyContinue
& C:\Windows\System32\curl.exe -s -c $cookieFile "$baseUrl/sanctum/csrf-cookie" | Out-Null

# Step 2: Extract tokens
$lines = [System.IO.File]::ReadAllLines($cookieFile)
$xsrfEncoded = (($lines | Where-Object { $_ -match "XSRF-TOKEN" }) -split "`t")[-1].Trim()
$xsrfDecoded = [System.Uri]::UnescapeDataString($xsrfEncoded)
$sessionVal = (($lines | Where-Object { $_ -match "coolify_session" }) -split "`t")[-1].Trim()

Write-Host "XSRF token length: $($xsrfDecoded.Length)"
Write-Host "Session length: $($sessionVal.Length)"

# Step 3: Login - write body to file to avoid shell escaping issues
$loginBodyObj = @{ email = "bpillai100@gmail.com"; password = "Nzt@!!%%" }
$loginBody = $loginBodyObj | ConvertTo-Json -Compress
$loginBody | Set-Content -Path "D:\Manufacturing\login_body.json" -Encoding UTF8
$loginResp = & C:\Windows\System32\curl.exe -s -i `
  -b "coolify_session=$sessionVal; XSRF-TOKEN=$xsrfEncoded" `
  -c $cookieFile `
  -X POST "$baseUrl/login" `
  -H "Content-Type: application/json" `
  -H "Accept: application/json" `
  -H "X-XSRF-TOKEN: $xsrfDecoded" `
  -H "Referer: $baseUrl/login" `
  --data "@D:\Manufacturing\login_body.json"

Write-Host "Login response:"
$loginResp

# Step 4: Refresh XSRF after login
$lines2 = [System.IO.File]::ReadAllLines($cookieFile)
$xsrfEncoded2 = (($lines2 | Where-Object { $_ -match "XSRF-TOKEN" }) -split "`t")[-1].Trim()
$xsrfDecoded2 = [System.Uri]::UnescapeDataString($xsrfEncoded2)

# Step 5: Generate API token
$tokenBody = '{"name":"operis-deploy-token"}'
$tokenResp = & C:\Windows\System32\curl.exe -s `
  -b $cookieFile `
  -c $cookieFile `
  -X POST "$baseUrl/api/v1/security/keys" `
  -H "Content-Type: application/json" `
  -H "Accept: application/json" `
  -H "X-XSRF-TOKEN: $xsrfDecoded2" `
  -H "Referer: $baseUrl" `
  --data-raw $tokenBody

Write-Host "Token response:"
Write-Host $tokenResp
