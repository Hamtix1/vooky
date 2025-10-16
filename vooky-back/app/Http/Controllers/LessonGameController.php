<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\Image;
use App\Models\Level;
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
        ]);

        $user = $request->user();
        $lesson = Lesson::findOrFail($lessonId);
        
        // Calcular puntuación (0-100)
        $score = ($request->correct_answers / $request->total_questions) * 100;
        
        // Determinar si aprobó (75% o más)
        $passed = $score >= 75;
        
        // Guardar o actualizar el registro en lesson_user
        DB::table('lesson_user')->updateOrInsert(
            [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id
            ],
            [
                'score' => round($score),
                'correct_answers' => $request->correct_answers,
                'total_questions' => $request->total_questions,
                'completed_at' => $passed ? now() : null, // Solo marcar completada si aprobó
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'message' => $passed ? 'Lección aprobada exitosamente' : 'Lección no aprobada - Necesitas 75% o más',
            'score' => round($score),
            'correct_answers' => $request->correct_answers,
            'total_questions' => $request->total_questions,
            'passed' => $passed,
        ]);
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
                    'score' => null,
                    'correct_answers' => null,
                    'total_questions' => null,
                    'completed_at' => null,
                ]);
            }

            return response()->json([
                'completed' => !is_null($progress->completed_at),
                'score' => $progress->score ?? null,
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
