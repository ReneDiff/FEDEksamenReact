export interface Exam {
  id: string;
  examtermin: string;
  courseName: string;
  date: string;
  numberOfQuestions: number;
  examDurationMinutes: number;
  startTime: string;
  isCompleted: boolean;
}

export interface Student {
  id: string;
  examId: string;
  studentNumber: string;
  name: string;
  questionDrawn?: number; 
  actualExamDurationSeconds?: number;
  notes?: string;
  grade?: string;
}