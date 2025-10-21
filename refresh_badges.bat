@echo off
echo Eliminando y recreando tablas de insignias...
cd c:\laragon\www\vooky\vooky-back
C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe artisan migrate:rollback --path=database/migrations/2025_10_21_000002_create_badge_user_table.php
C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe artisan migrate:rollback --path=database/migrations/2025_10_21_000001_create_badges_table.php
C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe artisan migrate --path=database/migrations/2025_10_21_000001_create_badges_table.php
C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe artisan migrate --path=database/migrations/2025_10_21_000002_create_badge_user_table.php
echo.
echo Migraciones actualizadas exitosamente!
pause
