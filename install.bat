@echo off
setlocal

echo ============================================
echo  OpenCode AI - Adobe CEP Panel Installer
echo ============================================
echo.

set PANEL_SRC=%~dp0cep-panel
set PANEL_NAME=com.kusmedios.opencode

REM Ruta de extensiones de Adobe en Windows
set ADOBE_EXT=%APPDATA%\Adobe\CEP\extensions

if not exist "%ADOBE_EXT%" (
  mkdir "%ADOBE_EXT%"
  echo [OK] Carpeta de extensiones creada
)

set DEST=%ADOBE_EXT%\%PANEL_NAME%

if exist "%DEST%" (
  echo [INFO] Eliminando version anterior...
  rmdir /s /q "%DEST%"
)

echo [INFO] Copiando panel a:
echo       %DEST%
xcopy /E /I /Q "%PANEL_SRC%" "%DEST%"

echo.
echo [INFO] Habilitando CEP debug mode (necesario para extensiones sin firma)...
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.9"  /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1

echo.
echo ============================================
echo  Instalacion completada!
echo ============================================
echo.
echo Pasos para activar el panel:
echo  1. Instala dependencias:  npm install
echo  2. Inicia el bridge:       start-bridge.bat
echo  3. Abre After Effects o Premiere Pro
echo  4. Ve a  Window ^> Extensions ^> OpenCode AI
echo.
pause
