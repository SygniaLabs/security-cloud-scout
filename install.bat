@echo off

if [%1] == [] (
    echo Error: Missing arguments
    goto usage
)


REM Install StormSpotter
mkdir %1\tools
cd %1\tools
git clone https://github.com/Azure/Stormspotter.git
cd %1\tools\Stormspotter\backend

REM Edit files
copy %1\resources\app\index.html %1\resources\app\index.html.bak
powershell %~dp0/editFiles.ps1 %1

pipenv install -r requirements.txt
copy /y %~dp0\helpers\Stormspotter\import_storm.py %1\tools\Stormspotter\backend

REM Move helpers to BloodHound folder and install neccessary files
cd %~dp0
mkdir %1\helpers
xcopy /y /s helpers %1\helpers

REM Install requirements for helpers
cd %1\helpers\AWS
pipenv install -r requirements.txt
cd %1\helpers\AWS\attacks
pipenv install -r requirements.txt

REM Add plugin files to BloodHound
cd %~dp0
mkdir %1\resources\app\plugin
xcopy /y /s plugin %1\resources\app\plugin


REM Edit BloodHound custom queries
cd %~dp0
move %APPDATA%\BloodHound\customqueries.json %APPDATA%\BloodHound\customqueries.json.bkp
copy /y plugin\customqueries.json %APPDATA%\BloodHound\

cd %~dp0
echo "Installation complete, happy graphing :)"
goto end

:usage
echo "install <BloodHound path>""

:end