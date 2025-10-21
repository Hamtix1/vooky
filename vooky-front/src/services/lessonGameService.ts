import api from '@/config/api';

export interface Question {
  question_number: number;
  audio_url: string;
  correct_image_id: number;
  options: {
    left: {
      id: number;
      url: string;
      description: string | null;
    };
    right: {
      id: number;
      url: string;
      description: string | null;
    };
  };
}

export interface LessonGameData {
  lesson: {
    id: number;
    title: string;
    content_type: string;
    dia: number;
  };
  questions: Question[];
  total_questions: number;
}

export interface GameResult {
  accuracy: number; // Porcentaje de aciertos (0-100)
  game_score: number; // Puntuación del juego con combos (sin límite, puede ser miles)
  current_attempt_accuracy: number; // Accuracy del intento actual
  current_attempt_score: number; // Game score del intento actual
  correct_answers: number;
  total_questions: number;
  passed: boolean;
  improved: boolean;
  was_already_completed: boolean;
  message: string;
  new_badges?: Array<{
    id: number;
    name: string;
    description: string;
    image?: string;
    lessons_required: number;
  }>;
}

export interface LessonProgress {
  completed: boolean;
  accuracy: number | null; // Mejor porcentaje de aciertos (0-100)
  game_score: number | null; // Mejor puntuación del juego (sin límite)
  correct_answers: number | null;
  total_questions: number | null;
  completed_at: string | null;
}

export async function getLessonQuestions(lessonId: number): Promise<LessonGameData> {
  const response = await api.get(`/lessons/${lessonId}/questions`);
  return response.data;
}

export async function saveLessonResult(
  lessonId: number,
  correctAnswers: number,
  totalQuestions: number,
  gameScore?: number // Score del juego con combos (opcional)
): Promise<GameResult> {
  const response = await api.post(`/lessons/${lessonId}/result`, {
    correct_answers: correctAnswers,
    total_questions: totalQuestions,
    game_score: gameScore,
  });
  return response.data;
}

export async function getLessonProgress(lessonId: number): Promise<LessonProgress> {
  const response = await api.get(`/lessons/${lessonId}/progress`);
  return response.data;
}
