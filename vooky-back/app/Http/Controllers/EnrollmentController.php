<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnrollmentController extends Controller
{
    // Inscribir al usuario autenticado en un curso
    public function enroll(Course $course)
    {
        $user = Auth::user();
        $user->courses()->syncWithoutDetaching([$course->id]);
        return response()->json(['message' => 'Inscripción exitosa']);
    }

    // Desinscribir al usuario autenticado de un curso
    public function unenroll(Course $course)
    {
        $user = Auth::user();
        $user->courses()->detach($course->id);
        return response()->json(['message' => 'Desinscripción exitosa']);
    }

    // Marcar una lección como completada
    public function completeLesson(Lesson $lesson)
    {
        $user = Auth::user();
        $user->completedLessons()->syncWithoutDetaching([
            $lesson->id => ['completed_at' => now()]
        ]);
        return response()->json(['message' => 'Lección marcada como completada']);
    }

    // Quitar el estado de completada de una lección
    public function uncompleteLesson(Lesson $lesson)
    {
        $user = Auth::user();
        $user->completedLessons()->detach($lesson->id);
        return response()->json(['message' => 'Lección marcada como no completada']);
    }

    // Obtener el progreso del usuario en un curso
    public function courseProgress(Course $course)
    {
        $user = Auth::user();
        $totalLessons = $course->levels()->withCount('lessons')->get()->sum('lessons_count');
        $completedLessons = $user->completedLessons()->whereHas('level', function($q) use ($course) {
            $q->where('course_id', $course->id);
        })->count();
        return response()->json([
            'total_lessons' => $totalLessons,
            'completed_lessons' => $completedLessons,
            'progress_percent' => $totalLessons > 0 ? round($completedLessons / $totalLessons * 100, 2) : 0
        ]);
    }
}
