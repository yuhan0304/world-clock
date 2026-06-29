@echo off
cd /d "%~dp0"
title WorldClock - 多时区时钟

echo ========================================
echo  WorldClock - 跨平台多时区桌面时钟
echo ========================================
echo.

:: 检查 node_modules
if not exist "node_modules\electron\dist\electron.exe" (
    echo [1/2] 首次运行需要下载 Electron 依赖（约 150MB）...
    echo       请耐心等待，不要关闭窗口...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [错误] 依赖安装失败，请尝试以管理员身份运行！
        pause
        exit /b 1
    )
    echo.
    echo 依赖安装完成！
) else (
    echo [1/2] 依赖已就绪
)

echo [2/2] 启动 WorldClock...
echo.
echo 应用启动后，可右键非本地时区卡片更换时区
echo 关闭窗口将最小化到系统托盘，右键托盘图标可退出
echo.
start "" "node_modules\.bin\electron.cmd" .
