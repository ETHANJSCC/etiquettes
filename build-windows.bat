@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ============================================================
echo   EtiqTool - Generation des executables
echo ============================================================
echo.
echo Cette operation telecharge les composants necessaires puis
echo cree l'installeur et la version portable.
echo Aucun droit administrateur n'est requis.
echo La premiere fois peut prendre quelques minutes selon la connexion.
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
echo [2/2] Creation des executables ^(installeur + portable^)...
call npm run dist
if errorlevel 1 goto erreur

echo.
echo ============================================================
echo   Termine ! Les fichiers sont dans le dossier "release" :
echo     - ...-Installeur.exe  (installation en un clic)
echo     - ...-Portable.exe    (a lancer sans installation)
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
