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
  score: number;
  correct_answers: number;
  total_questions: number;
  passed: boolean;
  message?: string;
}

export interface LessonProgress {
  completed: boolean;
  score: number | null;
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
  totalQuestions: number
): Promise<GameResult> {
  const response = await api.post(`/lessons/${lessonId}/result`, {
    correct_answers: correctAnswers,
    total_questions: totalQuestions,
  });
  return response.data;
}

export async function getLessonProgress(lessonId: number): Promise<LessonProgress> {
  const response = await api.get(`/lessons/${lessonId}/progress`);
  return response.data;
}
