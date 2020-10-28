$path = $args[0]

# Edit index.html for plugin to start
$content = Get-Content $path\resources\app\index.html
$content | ForEach-Object{$_ -replace "// You can also require other files to run in this process", "require('./plugin/main.js');"} | Set-Content $path\resources\app\index.html

# Edit Stormdash to avoid running server
#Get-Content $path\tools\Stormspotter\Stormdash.py.bak | ForEach-Object{$_ -replace 'app.run_server', '#app.run_server'} | Set-Content $path\tools\Stormspotter\Stormdash.py
$content = Get-Content $path\tools\Stormspotter\backend\requirements.txt
$content | ForEach-Object{$_ -replace 'uvloop==', '#uvloop=='} | Set-Content $path\tools\Stormspotter\backend\requirements.txt