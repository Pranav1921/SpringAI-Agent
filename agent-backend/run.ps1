# Kill any previous process running on port 8090 or 3001
$ports = @(8090, 3001)
foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pidToKill in $processes) {
        if ($pidToKill -gt 0) {
            Write-Host "Stopping process $pidToKill on port $port..."
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    }
}

$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "C:\Program Files\Java\jdk-17\bin;" + $env:Path
.\mvnw.cmd clean spring-boot:run -DskipTests
