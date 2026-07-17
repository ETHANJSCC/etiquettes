@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ============================================================
echo   Etiquettes Inventaire - Generation de l'executable
echo ============================================================
echo.
echo Cette operation telecharge les composants necessaires puis
echo cree l'application. La premiere fois peut prendre plusieurs
echo minutes selon la connexion.
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Node.js n'est pas installe.
  echo Installe-le depuis https://nodejs.org ^(version LTS^) puis relance ce script.
  echo.
  pause
  exit /b 1
)

echo [1/2] Installation des dependances ^(npm install^)...
call npm install
if errorlevel 1 goto erreur

echo.
echo [2/2] Creation de l'executable portable ^(npm run build:win^)...
call npm run build:win
if errorlevel 1 goto erreur

echo.
echo ============================================================
echo   Termine ! L'executable se trouve dans le dossier "release".
echo ============================================================
start "" "%~dp0release"
echo.
pause
exit /b 0

:erreur
echo.
echo ============================================================
echo   [ECHEC] Une etape a echoue. Verifie la connexion Internet
echo   et relance ce script.
echo ============================================================
echo.
pause
exit /b 1
