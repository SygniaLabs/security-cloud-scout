@echo off

cd tools\Stormspotter\backend
pipenv run python import_storm.py %1 %2 %3 %4