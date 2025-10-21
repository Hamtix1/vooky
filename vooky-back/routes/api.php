<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LevelController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\AudioController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\LessonGameController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\StatsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- RUTAS PÚBLICAS ---
// Cualquiera puede intentar iniciar sesión.
Route::post('/login', [AuthController::class, 'login']);

// Estadísticas públicas de la plataforma
Route::get('/stats/public', [StatsController::class, 'public']);


// --- RUTAS PROTEGIDAS POR AUTENTICACIÓN ---
// Solo los usuarios que han iniciado sesión (admins y parents) pueden acceder a estas rutas.
Route::middleware('auth:sanctum')->group(function () {
    
    // Rutas de autenticación para usuarios logueados
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rutas de perfil de usuario
    Route::get('/profile', [UserProfileController::class, 'show']);
    Route::put('/profile', [UserProfileController::class, 'update']);
    Route::get('/profile/ranking', [UserProfileController::class, 'myRanking']);
    Route::get('/profile/badges', [BadgeController::class, 'userBadges']);
    
    // Ranking global (disponible para todos los usuarios autenticados)
    Route::get('/ranking', [UserProfileController::class, 'ranking']);

    // --- RUTAS SOLO PARA ADMINISTRADORES ---
    // Solo los usuarios con rol 'admin' pueden acceder a este grupo.
    Route::middleware('admin')->group(function () {
    
    // Gestión de usuarios (CRUD completo)
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::get('/admin/users/{user}', [AdminUserController::class, 'show']);
    Route::put('/admin/users/{user}', [AdminUserController::class, 'update']);
    Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy']);
    
    // Gestión de inscripciones de usuarios a cursos
    Route::get('/admin/users/{user}/courses', [AdminUserController::class, 'userCourses']);
    Route::post('/admin/users/{user}/enroll/{course}', [AdminUserController::class, 'enrollUserToCourse']);
    Route::delete('/admin/users/{user}/unenroll/{course}', [AdminUserController::class, 'unenrollUserFromCourse']);

    // Toda la gestión de contenido (crear, editar, borrar) es solo para admins.
    Route::apiResource('courses', CourseController::class);
    Route::apiResource('courses.levels', LevelController::class);
    Route::apiResource('courses.categories', CategoryController::class);
    Route::apiResource('levels.lessons', LessonController::class);
    Route::apiResource('images', ImageController::class);
    Route::apiResource('audios', AudioController::class);
    Route::apiResource('questions', QuestionController::class);
    
    // Gestión de insignias (CRUD completo para admin)
    Route::get('badges', [BadgeController::class, 'all']);
    Route::get('courses/{course}/badges', [BadgeController::class, 'index']);
    Route::post('badges', [BadgeController::class, 'store']);
    Route::get('badges/{badge}', [BadgeController::class, 'show']);
    Route::put('badges/{badge}', [BadgeController::class, 'update']);
    Route::delete('badges/{badge}', [BadgeController::class, 'destroy']);
    
    // Estadísticas del dashboard (solo admin)
    Route::get('stats/dashboard', [StatsController::class, 'dashboard']);
    });

    // --- RUTAS PARA USUARIOS GENERALES (PARENTS) ---
    // Si quisieras que los 'parents' pudieran VER los cursos pero no crearlos,
    // podrías definir rutas de solo lectura aquí. Por ejemplo:
    
    Route::get('courses', [CourseController::class, 'index']);
    Route::get('courses/{course}', [CourseController::class, 'show']);
    
    //Endpoint para regresar pool de imagenes
    Route::get('lessons/{lesson}/question-pool', [LessonController::class, 'getQuestionPool']);

    // Inscripción y progreso de cursos y lecciones    
    Route::post('courses/{course}/enroll', [EnrollmentController::class, 'enroll']);
    Route::post('courses/{course}/unenroll', [EnrollmentController::class, 'unenroll']);
    Route::post('lessons/{lesson}/complete', [EnrollmentController::class, 'completeLesson']);
    Route::post('lessons/{lesson}/uncomplete', [EnrollmentController::class, 'uncompleteLesson']);
    Route::get('courses/{course}/progress', [EnrollmentController::class, 'courseProgress']);
    
    // Rutas del juego de lecciones
    Route::get('lessons/{lesson}/questions', [LessonGameController::class, 'getQuestions']);
    Route::post('lessons/{lesson}/result', [LessonGameController::class, 'saveResult']);
    Route::get('lessons/{lesson}/progress', [LessonGameController::class, 'getProgress']);
    
    // Rutas de insignias para usuarios (solo lectura)
    Route::get('users/{user}/courses/{course}/badges', [BadgeController::class, 'userBadges']);
    
    
    // Por ahora, para máxima seguridad, hemos puesto todo bajo el control del admin.
});