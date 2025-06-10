import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Define ProfileData interface
export interface ProfileData {
  user_id: string;
  full_name: string;
  email: string;
  profile_complete: boolean;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  school_name?: string;
  department?: string;
  level?: string;
  state_of_origin?: string;
  matric_number?: string;
  updated_at?: string;
  [key: string]: any; // Allow for any additional fields
}

// Define types
export type Question = {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
};

export type QuizConfig = {
  title: string;
  courseId: string;
  questionCount: number;
  difficultyLevel: "easy" | "medium" | "hard" | "mixed";
  questionTypes: ("multiple-choice" | "true-false" | "short-answer")[];
};

export interface PDFQuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated: (quiz: {
    title: string;
    courseId: string;
    questions: Question[];
  }) => void;
  availableCourses: { id: string; name: string }[];
}

// types/course.ts
export interface Course {
  id: number;
  title: string;
  code: string;
  progress: number;
  instructor: string;
  nextSession: string;
  assignmentsDue: number;
  resources: number;
  color: string;
  thumbnail: string;
}

export type StudyMaterialType = 'quiz' | 'flashcard' | 'pastQuestion';

export interface StudyMaterial {
  id: number;
  course: string;
  type: StudyMaterialType;
  title: string;
  questions?: number;
  completed?: number;
  dueDate?: string;
  cards?: number;
  mastered?: number;
  lastReviewed?: string;
  pages?: number;
  downloads?: number;
  year?: string;
}

export interface OverviewProps {
  courses: Course[];
  studyMaterials: StudyMaterial[];
  setActiveTab: (tab: string) => void;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  course: string;
  description: string;
  cards_count: number;
  mastered_count: number;
  last_reviewed: string;
  user_id: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  is_mastered: boolean;
  difficulty_level: number;
  review_count: number;
  last_reviewed: string;
  created_at: string;
}

// Define the StudySession interface - date is a Date object for client-side use
export interface StudySession {
  id: string;
  title: string;
  course: string;
  date: Date; // Stored as string in DB, converted to Date object for React state
  duration: number;
  priority: "high" | "medium" | "low";
  completed: boolean;
  type: "revision" | "reading" | "assignment" | "practice";
  created_at?: string;
}

export interface EditStudySessionModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  session: StudySession | null;
  onUpdateSession: (session: StudySession) => void;
}

export interface DeckFormData {
  title: string;
  pdfText?: string;
  description: string;
  cardCount: number;
}

export interface CardFormData {
  front: string;
  back: string;
}

export interface LoadingState {
  decks: boolean;
  cards: boolean;
  creating: boolean;
  updating: boolean;
}

export interface StudyMaterialSectionProps {
  title: string;
  icon: React.ReactNode;
  materials: StudyMaterial[];
  courseKey: keyof StudyMaterial;
  onViewAll: () => void;
  progressKey?: keyof StudyMaterial;
  totalKey?: keyof StudyMaterial;
  showLastReviewed?: boolean;
  showYear?: boolean;
  showDownloads?: boolean;
}