@echo off

copy %1 helpers\AWS
cd helpers\AWS
pipenv run python convert.py %cd%\%~nx1

del /f /s *.zip