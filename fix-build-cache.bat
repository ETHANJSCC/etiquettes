@echo off
chcp 65001 >nul
echo ============================================================
echo   EtiqTool - Nettoyage du cache de compilation
echo ============================================================
echo.
echo A utiliser si le build echoue avec une erreur EPERM / rename
echo sur le cache electron-builder (cache corrompu ou verrouille).
echo.

echo Fermeture des processus de build eventuels...
taskkill /f /im electron-builder.exe >nul 2>nul
taskkill /f /im makensis.exe >nul 2>nul

echo Suppression du cache electron-builder...
rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache" 2>nul

echo.
echo ============================================================
echo   Termine. Relance maintenant build-windows.bat.
echo   (Le cache sera retelecharge proprement au prochain build.)
echo ============================================================
echo.
pause
