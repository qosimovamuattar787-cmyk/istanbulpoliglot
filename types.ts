
export type Language = 
  | 'English' | 'Russian' | 'German' | 'French' | 'Spanish' 
  | 'Turkish' | 'Arabic' | 'Korean' | 'Japanese' | 'Chinese';

export type Level = 'A1' | 'A2' | 'B1' | 'B2';

export interface QuizOption {
  text: string;
  language: string;
}

export interface Question {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
  options: QuizOption[];
  correctIndex: number;
  explanation: string;
}

export interface QuizHistoryEntry {
  id: string;
  date: string;
  languages: Language[];
  level: Level;
  unit: number;
  score: number;
  total: number;
}

export interface QuizState {
  languages: Language[];
  level: Level | null;
  unit: number | null;
  questions: Question[];
  currentIndex: number;
  score: number;
  isComplete: boolean;
  userAnswers: (number | null)[];
}

export type Step = 'START' | 'LANG_SELECT' | 'LEVEL_SELECT' | 'UNIT_SELECT' | 'LOADING' | 'QUIZ' | 'RESULTS';
