@echo off
echo ====================================
echo  opencode-adobe-bridge - Setup
echo ====================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo [ERROR] Node.js no encontrado. Descargalo en https://nodejs.org
  pause
  exit /b 1
)

echo [OK] Node.js encontrado
node --version

echo.
echo Instalando dependencias...
npm install

echo.
echo ====================================
echo  Setup completado!
echo ====================================
echo.
echo Para iniciar el bridge:
echo   npm run bridge
echo.
echo Para usar con OpenCode:
echo   opencode
echo.
echo Recuerda editar config/paths.json
echo con las rutas correctas de Adobe.
echo.
pause
