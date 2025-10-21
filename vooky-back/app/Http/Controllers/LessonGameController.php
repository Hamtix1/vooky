<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\Image;
use App\Models\Level;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LessonGameController extends Controller
{
    /**
     * Obtiene las preguntas para una lección específica
     */
    public function getQuestions(Request $request, $lessonId)
    {
        $lesson = Lesson::with('level')->findOrFail($lessonId);
        $level = $lesson->level;
        
        // Obtener todas las imágenes disponibles:
        // - De niveles anteriores (todos los días)
        // - Del nivel actual (hasta el día de la lección)
        $availableImages = Image::where(function($query) use ($level, $lesson) {
                // Imágenes de niveles anteriores (todas)
                $query->where('level_id', '<', $level->id)
                    // O imágenes del nivel actual hasta el día de la lección
                    ->orWhere(function($q) use ($level, $lesson) {
                        $q->where('level_id', $level->id)
                          ->where('dia', '<=', $lesson->dia);
                    });
            })
            ->with('category')
            ->get();

        if ($availableImages->count() < 2) {
            return response()->json([
                'message' => 'No hay suficientes imágenes disponibles para generar preguntas.',
                'available_images' => $availableImages->count(),
                'level_id' => $level->id,
                'lesson_dia' => $lesson->dia
            ], 400);
        }

        // Generar 20 preguntas según el tipo de contenido
        $questions = $this->generateQuestions($lesson, $availableImages);

        return response()->json([
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'content_type' => $lesson->content_type,
                'dia' => $lesson->dia,
            ],
            'questions' => $questions,
            'total_questions' => count($questions)
        ]);
    }

    /**
     * Genera preguntas basadas en el tipo de contenido de la lección
     */
    private function generateQuestions($lesson, $availableImages)
    {
        $questions = [];
        $totalQuestions = 20;

        // Normalizar el content_type: quitar acentos, a minúsculas
        $contentType = strtolower($lesson->content_type);
        $contentType = str_replace(['á', 'é', 'í', 'ó', 'ú'], ['a', 'e', 'i', 'o', 'u'], $contentType);

        \Log::info("Generating questions for lesson {$lesson->id}, content_type: '{$lesson->content_type}' (normalized: '{$contentType}')");

        // Manejar diferentes variaciones del content_type
        if (in_array($contentType, ['combinadas', 'combinado', 'combinada'])) {
            \Log::info("Using MIXED category questions (different categories)");
            $questions = $this->generateMixedCategoryQuestions($availableImages, $totalQuestions);
        } elseif (in_array($contentType, ['enlace de categorias', 'enlace de categoria', 'enlace_categoria', 'enlace categoria', 'misma_categoria', 'misma categoria', 'misma categoría'])) {
            \Log::info("Using SAME category questions (same category)");
            $questions = $this->generateSameCategoryQuestions($availableImages, $totalQuestions);
        } elseif ($contentType === 'mixto') {
            \Log::info("Using MIXED type: 10 different categories + 10 same category");
            // 10 preguntas combinadas + 10 de enlace de categoría
            $mixed = $this->generateMixedCategoryQuestions($availableImages, 10);
            $sameCategory = $this->generateSameCategoryQuestions($availableImages, 10);
            $questions = array_merge($mixed, $sameCategory);
            // Mezclar las preguntas
            shuffle($questions);
        } else {
            // Por defecto, usar preguntas combinadas
            \Log::warning("Unknown content_type '{$lesson->content_type}', using mixed categories as default");
            $questions = $this->generateMixedCategoryQuestions($availableImages, $totalQuestions);
        }

        return $questions;
    }

    /**
     * Genera preguntas con imágenes de diferentes categorías
     */
    private function generateMixedCategoryQuestions($images, $count)
    {
        $questions = [];
        $imagesArray = $images->toArray();
        
        for ($i = 0; $i < $count; $i++) {
            // Seleccionar imagen correcta aleatoria
            $correctImage = $imagesArray[array_rand($imagesArray)];
            
            // Buscar una imagen de diferente categoría para la incorrecta
            $incorrectOptions = array_filter($imagesArray, function($img) use ($correctImage) {
                return $img['category_id'] !== $correctImage['category_id'];
            });
            
            if (empty($incorrectOptions)) {
                // Si no hay imágenes de otra categoría, usar cualquier otra imagen
                $incorrectOptions = array_filter($imagesArray, function($img) use ($correctImage) {
                    return $img['id'] !== $correctImage['id'];
                });
            }
            
            if (!empty($incorrectOptions)) {
                $incorrectImage = $incorrectOptions[array_rand($incorrectOptions)];
                
                $questions[] = $this->formatQuestion($correctImage, $incorrectImage, $i + 1);
            }
        }
        
        return $questions;
    }

    /**
     * Genera preguntas con imágenes de la misma categoría
     */
    private function generateSameCategoryQuestions($images, $count)
    {
        $questions = [];
        $imagesArray = $images->toArray();
        
        // Agrupar imágenes por categoría
        $imagesByCategory = [];
        foreach ($imagesArray as $image) {
            $categoryId = $image['category_id'];
            if (!isset($imagesByCategory[$categoryId])) {
                $imagesByCategory[$categoryId] = [];
            }
            $imagesByCategory[$categoryId][] = $image;
        }
        
        \Log::info("Categories found: " . count($imagesByCategory));
        foreach ($imagesByCategory as $catId => $catImages) {
            \Log::info("Category {$catId}: " . count($catImages) . " images");
        }
        
        // Filtrar categorías que tienen al menos 2 imágenes
        $validCategories = array_filter($imagesByCategory, function($categoryImages) {
            return count($categoryImages) >= 2;
        });
        
        \Log::info("Valid categories (with 2+ images): " . count($validCategories));
        
        if (empty($validCategories)) {
            \Log::warning("No categories with 2+ images found, falling back to mixed questions");
            // Fallback: generar preguntas mixtas si no hay categorías válidas
            return $this->generateMixedCategoryQuestions($images, $count);
        }
        
        for ($i = 0; $i < $count; $i++) {
            // Seleccionar una categoría aleatoria que tenga al menos 2 imágenes
            $categoryImages = $validCategories[array_rand($validCategories)];
            
            // Seleccionar dos imágenes diferentes de la misma categoría
            shuffle($categoryImages);
            $correctImage = $categoryImages[0];
            $incorrectImage = $categoryImages[1];
            
            \Log::info("Question {$i}: Using category {$correctImage['category_id']}, images {$correctImage['id']} (correct) vs {$incorrectImage['id']} (option)");
            
            $questions[] = $this->formatQuestion($correctImage, $incorrectImage, $i + 1);
        }
        
        return $questions;
    }

    /**
     * Formatea una pregunta con dos opciones (correcta e incorrecta)
     */
    private function formatQuestion($correctImage, $incorrectImage, $questionNumber)
    {
        // Aleatorizar la posición de la respuesta correcta (izquierda o derecha)
        $isCorrectOnLeft = rand(0, 1) === 1;
        
        return [
            'question_number' => $questionNumber,
            'audio_url' => $correctImage['audio_file_url'],
            'correct_image_id' => $correctImage['id'],
            'options' => [
                'left' => [
                    'id' => $isCorrectOnLeft ? $correctImage['id'] : $incorrectImage['id'],
                    'url' => $isCorrectOnLeft ? $correctImage['file_url'] : $incorrectImage['file_url'],
                    'description' => $isCorrectOnLeft ? $correctImage['description'] : $incorrectImage['description'],
                ],
                'right' => [
                    'id' => $isCorrectOnLeft ? $incorrectImage['id'] : $correctImage['id'],
                    'url' => $isCorrectOnLeft ? $incorrectImage['file_url'] : $correctImage['file_url'],
                    'description' => $isCorrectOnLeft ? $incorrectImage['description'] : $correctImage['description'],
                ]
            ]
        ];
    }

    /**
     * Guarda el resultado de una lección completada
     */
    public function saveResult(Request $request, $lessonId)
    {
        $request->validate([
            'correct_answers' => 'required|integer|min:0|max:20',
            'total_questions' => 'required|integer|min:1|max:20',
            'game_score' => 'nullable|integer|min:0', // Score del juego con combos (sin límite superior)
        ]);

        $user = $request->user();
        $lesson = Lesson::findOrFail($lessonId);
        
        // Calcular accuracy actual (0-100) - porcentaje de aciertos
        $newAccuracy = ($request->correct_answers / $request->total_questions) * 100;
        $roundedNewAccuracy = round($newAccuracy);
        
        // Game score (puntuación con combos y bonos) - viene del frontend
        $newGameScore = $request->input('game_score', $roundedNewAccuracy);
        
        // Determinar si aprobó en este intento (75% o más de accuracy)
        $passedNow = $newAccuracy >= 75;
        
        // Obtener el progreso previo (si existe)
        $previousProgress = DB::table('lesson_user')
            ->where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->first();
        
        // Determinar los valores finales
        $finalAccuracy = $roundedNewAccuracy;
        $finalGameScore = $newGameScore;
        $finalCorrectAnswers = $request->correct_answers;
        $finalTotalQuestions = $request->total_questions;
        $finalCompletedAt = null;
        $wasAlreadyCompleted = false;
        
        if ($previousProgress) {
            // Ya existe un registro previo
            $wasAlreadyCompleted = !is_null($previousProgress->completed_at);
            
            // Mantener la accuracy más alta
            if ($previousProgress->accuracy && $previousProgress->accuracy > $roundedNewAccuracy) {
                $finalAccuracy = $previousProgress->accuracy;
                $finalCorrectAnswers = $previousProgress->correct_answers;
                $finalTotalQuestions = $previousProgress->total_questions;
            }
            
            // Mantener el game_score más alto
            if ($previousProgress->game_score && $previousProgress->game_score > $newGameScore) {
                $finalGameScore = $previousProgress->game_score;
            }
            
            // Mantener completed_at si ya estaba aprobada, o actualizar si aprueba ahora
            if ($wasAlreadyCompleted) {
                // Ya estaba aprobada, mantener la fecha original
                $finalCompletedAt = $previousProgress->completed_at;
            } elseif ($passedNow) {
                // Primera vez que aprueba
                $finalCompletedAt = now();
            }
        } else {
            // Primer intento
            if ($passedNow) {
                $finalCompletedAt = now();
            }
        }
        
        // Actualizar o crear el registro
        DB::table('lesson_user')->updateOrInsert(
            [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id
            ],
            [
                'accuracy' => $finalAccuracy,
                'game_score' => $finalGameScore,
                'correct_answers' => $finalCorrectAnswers,
                'total_questions' => $finalTotalQuestions,
                'completed_at' => $finalCompletedAt,
                'updated_at' => now(),
            ]
        );
        
        // Determinar el estado final (aprobada si tiene completed_at)
        $finalPassed = !is_null($finalCompletedAt);
        
        // Mensajes descriptivos
        $message = '';
        if ($passedNow && !$wasAlreadyCompleted) {
            $message = '¡Lección aprobada por primera vez!';
        } elseif ($passedNow && $wasAlreadyCompleted && $roundedNewAccuracy > $previousProgress->accuracy) {
            $message = '¡Nueva mejor puntuación! Lección ya aprobada anteriormente.';
        } elseif ($passedNow && $wasAlreadyCompleted && $roundedNewAccuracy <= $previousProgress->accuracy) {
            $message = 'Lección ya aprobada. Puntuación anterior es mejor.';
        } elseif (!$passedNow && $wasAlreadyCompleted) {
            $message = 'Lección sigue aprobada. Este intento no superó el 75%.';
        } else {
            $message = 'Lección no aprobada - Necesitas 75% o más.';
        }

        // Verificar y otorgar insignias si completó la lección por primera vez
        $newBadges = [];
        if ($passedNow && !$wasAlreadyCompleted) {
            $newBadges = $this->checkAndAwardBadges($user->id, $lesson->level->course_id);
        }

        return response()->json([
            'message' => $message,
            'accuracy' => $finalAccuracy, // Mejor accuracy (porcentaje de aciertos)
            'game_score' => $finalGameScore, // Mejor game score (con combos)
            'current_attempt_accuracy' => $roundedNewAccuracy, // Accuracy de este intento
            'current_attempt_score' => $newGameScore, // Game score de este intento
            'correct_answers' => $finalCorrectAnswers,
            'total_questions' => $finalTotalQuestions,
            'passed' => $finalPassed,
            'improved' => $previousProgress && $roundedNewAccuracy > $previousProgress->accuracy,
            'was_already_completed' => $wasAlreadyCompleted,
            'new_badges' => $newBadges, // Nuevas insignias obtenidas
        ]);
    }

    /**
     * Verificar y otorgar insignias a un usuario basado en lecciones completadas
     */
    private function checkAndAwardBadges($userId, $courseId)
    {
        // Contar lecciones completadas del usuario en este curso
        $completedLessonsCount = DB::table('lesson_user')
            ->join('lessons', 'lessons.id', '=', 'lesson_user.lesson_id')
            ->join('levels', 'levels.id', '=', 'lessons.level_id')
            ->where('lesson_user.user_id', $userId)
            ->where('levels.course_id', $courseId)
            ->whereNotNull('lesson_user.completed_at')
            ->count();

        // Obtener insignias del curso que el usuario aún no tiene y ha alcanzado
        $availableBadges = Badge::where('course_id', $courseId)
            ->where('lessons_required', '<=', $completedLessonsCount)
            ->whereDoesntHave('users', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->get();

        $newBadges = [];

        // Otorgar cada insignia disponible
        foreach ($availableBadges as $badge) {
            $badge->users()->attach($userId, ['earned_at' => now()]);
            $newBadges[] = [
                'id' => $badge->id,
                'name' => $badge->name,
                'description' => $badge->description,
                'image' => $badge->image,
                'lessons_required' => $badge->lessons_required,
            ];
        }

        return $newBadges;
    }

    /**
     * Obtiene el progreso del usuario en una lección
     */
    public function getProgress(Request $request, $lessonId)
    {
        try {
            $user = $request->user();
            
            $progress = DB::table('lesson_user')
                ->where('user_id', $user->id)
                ->where('lesson_id', $lessonId)
                ->first();

            if (!$progress) {
                return response()->json([
                    'completed' => false,
                    'accuracy' => null,
                    'game_score' => null,
                    'correct_answers' => null,
                    'total_questions' => null,
                    'completed_at' => null,
                ]);
            }

            return response()->json([
                'completed' => !is_null($progress->completed_at),
                'accuracy' => $progress->accuracy ?? null,
                'game_score' => $progress->game_score ?? null,
                'correct_answers' => $progress->correct_answers ?? null,
                'total_questions' => $progress->total_questions ?? null,
                'completed_at' => $progress->completed_at,
            ]);
        } catch (\Exception $e) {
            \Log::error("Error getting lesson progress: " . $e->getMessage());
            \Log::error("Stack trace: " . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Error al obtener el progreso',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
