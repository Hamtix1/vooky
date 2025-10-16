# ====================================
# Vooky - Git Initialization Script
# ====================================
# Este script inicializa el repositorio Git
# y prepara el proyecto para subir a GitHub

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   VOOKY - Git Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Git está instalado
Write-Host "1. Verificando Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "   ✓ Git instalado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Git no está instalado. Por favor instala Git primero." -ForegroundColor Red
    Write-Host "   Descarga: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verificar si ya existe un repositorio Git
if (Test-Path ".git") {
    Write-Host "2. Repositorio Git ya existe" -ForegroundColor Yellow
    $response = Read-Host "   ¿Deseas reinicializarlo? Esto borrará el historial actual (s/n)"
    
    if ($response -eq "s" -or $response -eq "S") {
        Write-Host "   Eliminando repositorio anterior..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force .git
        Write-Host "   ✓ Repositorio eliminado" -ForegroundColor Green
    } else {
        Write-Host "   Manteniendo repositorio actual" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "Script cancelado por el usuario" -ForegroundColor Yellow
        Write-Host "=====================================" -ForegroundColor Cyan
        exit 0
    }
}

Write-Host ""

# Inicializar repositorio Git
Write-Host "3. Inicializando repositorio Git..." -ForegroundColor Yellow
git init
Write-Host "   ✓ Repositorio inicializado" -ForegroundColor Green

Write-Host ""

# Configurar nombre de rama principal
Write-Host "4. Configurando rama principal..." -ForegroundColor Yellow
git branch -M main
Write-Host "   ✓ Rama 'main' configurada" -ForegroundColor Green

Write-Host ""

# Agregar todos los archivos
Write-Host "5. Agregando archivos al staging..." -ForegroundColor Yellow
git add .
Write-Host "   ✓ Archivos agregados" -ForegroundColor Green

Write-Host ""

# Crear commit inicial
Write-Host "6. Creando commit inicial..." -ForegroundColor Yellow
git commit -m "Initial commit: Vooky educational gaming platform

- Laravel 10 backend with Sanctum authentication
- Vue 3 + TypeScript frontend with Vite
- Complete course/level/lesson hierarchy
- Audio-visual matching game mechanics
- Admin dashboard with CRUD operations
- User progress tracking system
- Category management panel
- Responsive design with animations
- Documentation files included"

Write-Host "   ✓ Commit inicial creado" -ForegroundColor Green

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Git Setup Completado!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Instrucciones para conectar con GitHub
Write-Host "Próximos pasos para subir a GitHub:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Crea un nuevo repositorio en GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. NO inicialices con README, .gitignore o licencia" -ForegroundColor White
Write-Host "   (ya los tenemos localmente)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Ejecuta los siguientes comandos:" -ForegroundColor White
Write-Host ""
Write-Host "   # Conectar con tu repositorio remoto" -ForegroundColor Gray
Write-Host "   git remote add origin https://github.com/TU-USUARIO/vooky.git" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Subir el código" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Preguntar si quiere agregar remote ahora
$addRemote = Read-Host "¿Deseas agregar el remote de GitHub ahora? (s/n)"

if ($addRemote -eq "s" -or $addRemote -eq "S") {
    Write-Host ""
    $repoUrl = Read-Host "Ingresa la URL del repositorio (ejemplo: https://github.com/usuario/vooky.git)"
    
    if ($repoUrl) {
        Write-Host ""
        Write-Host "Agregando remote..." -ForegroundColor Yellow
        git remote add origin $repoUrl
        Write-Host "✓ Remote agregado correctamente" -ForegroundColor Green
        Write-Host ""
        
        $pushNow = Read-Host "¿Deseas hacer push ahora? (s/n)"
        
        if ($pushNow -eq "s" -or $pushNow -eq "S") {
            Write-Host ""
            Write-Host "Subiendo código a GitHub..." -ForegroundColor Yellow
            git push -u origin main
            Write-Host ""
            Write-Host "✓ Código subido exitosamente!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Tu repositorio está disponible en:" -ForegroundColor Cyan
            Write-Host "$repoUrl" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "Puedes hacer push más tarde con:" -ForegroundColor Yellow
            Write-Host "git push -u origin main" -ForegroundColor Cyan
        }
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Script Finalizado" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Mostrar estado del repositorio
Write-Host "Estado del repositorio:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Mostrar información de remotes
$remotes = git remote -v 2>$null
if ($remotes) {
    Write-Host "Remotes configurados:" -ForegroundColor Yellow
    git remote -v
} else {
    Write-Host "No hay remotes configurados aún" -ForegroundColor Gray
}

Write-Host ""
Write-Host "¡Listo! 🚀" -ForegroundColor Green
